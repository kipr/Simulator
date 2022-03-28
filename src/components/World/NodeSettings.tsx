import * as React from "react";
import { styled } from "styletron-react";
import { Vector3 as RawVector3, AngleAxis, Euler } from "../../math";
import { ReferenceFrame, Rotation, Vector3 } from "../../unit-math";

import { Angle, Distance, Mass, UnitlessValue, Value } from "../../util";
import ComboBox from "../ComboBox";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import ScrollArea from "../ScrollArea";
import Section from "../Section";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import Geometry from '../../state/State/Scene/Geometry';
import Node from "../../state/State/Scene/Node";
import Scene from "../../state/State/Scene";
import Dict from "../../Dict";
import Material from '../../state/State/Scene/Material';
import { Color } from '../../state/State/Scene/Color';

import * as uuid from 'uuid';

export interface NodeSettingsProps extends ThemeProps {
  onNodeChange: (node: Node) => void;
  node: Node;
  id: string;

  onGeometryAdd: (id: string, geometry: Geometry) => void;
  onGeometryChange: (id: string, geometry: Geometry) => void;
  onGeometryRemove: (id: string) => void;

  scene: Scene;
}

interface NodeSettingsState {
  collapsed: { [key: string]: boolean };
}

type Props = NodeSettingsProps;
type State = NodeSettingsState;

const StyledField = styled(Field, (props: ThemeProps) => ({
  width: '100%',
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
}));

const StyledValueEdit = styled(ValueEdit, (props: ThemeProps) => ({
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
}));

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
}));

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '300px',
  flex: '1 1',
}));

const GEOMETRY_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Box', 'box'),
  ComboBox.option('Sphere', 'sphere'),
  ComboBox.option('Cylinder', 'cylinder'),
  ComboBox.option('Cone', 'cone'),
  ComboBox.option('Plane', 'plane'),
  ComboBox.option('File', 'file'),
];

const GEOMETRY_REVERSE_OPTIONS: Dict<number> = GEOMETRY_OPTIONS.reduce((dict, option, i) => {
  dict[option.data as string] = i;
  return dict;
}, {});

const ROTATION_TYPES: ComboBox.Option[] = [
  ComboBox.option('Euler', 'euler'),
  ComboBox.option('Axis Angle', 'angle-axis'),
];

const EULER_ORDER_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('XYZ', 'xyz'),
  ComboBox.option('YZX', 'yzx'),
  ComboBox.option('ZXY', 'zxy'),
  ComboBox.option('XZY', 'xzy'),
  ComboBox.option('YXZ', 'yxz'),
  ComboBox.option('ZYX', 'zyx'),
];

const NODE_TYPES = [
  'empty',
  'object',
  'directional-light',
  'point-light',
  'spot-light',
];

const NODE_TYPE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Empty', 'empty'),
  ComboBox.option('Object', 'object'),
  ComboBox.option('Directional Light', 'directional-light'),
  ComboBox.option('Point Light', 'point-light'),
  ComboBox.option('Spot Light', 'spot-light'),
];

const NODE_TYPE_OPTIONS_REV = (() => {
  const map: Record<string, number> = {};
  NODE_TYPES.forEach((type, i) => {
    map[type] = i;
  });
  return map;
})();

const MATERIAL_TYPE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Unset', 'unset'),
  ComboBox.option('PBR', 'pbr'),
];

const MATERIAL_TYPE_OPTIONS_REV = (() => {
  const map: Record<string, number> = {};
  MATERIAL_TYPE_OPTIONS.forEach((option, i) => {
    map[option.data as string] = i;
  });
  return map;
})();

const MATERIAL_SOURCE3_TYPE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Unset', 'unset'),
  ComboBox.option('Color', 'color3'),
  ComboBox.option('Texture', 'texture'),
];

const MATERIAL_SOURCE3_TYPE_OPTIONS_REV = (() => {
  const map: Record<string, number> = {};
  MATERIAL_SOURCE3_TYPE_OPTIONS.forEach((option, i) => {
    map[option.data as string] = i;
  });
  return map;
})();

const MATERIAL_SOURCE1_TYPE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Unset', 'unset'),
  ComboBox.option('Value', 'color1'),
  ComboBox.option('Texture', 'texture'),
];

const MATERIAL_SOURCE1_TYPE_OPTIONS_REV = (() => {
  const map: Record<string, number> = {};
  MATERIAL_SOURCE3_TYPE_OPTIONS.forEach((option, i) => {
    map[option.data as string] = i;
  });
  return map;
})();

class NodeSettings extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      collapsed: {
        position: true,
        orientation: true,
        scale: true,
        physics: true,
      }
    };
  }

  private onRotationTypeChange_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;

    const type = option.data as Rotation.Type;

    switch (type) {
      case 'euler':
        this.props.onNodeChange({
          ...node,
          origin: {
            ...node.origin,
            orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(Rotation.toRawQuaternion(node.origin.orientation)))
          }
        });
        break;
      case 'angle-axis':
        this.props.onNodeChange({
          ...node,
          origin: {
            ...node.origin,
            orientation: Rotation.AngleAxis.fromRaw(AngleAxis.fromQuaternion(Rotation.toRawQuaternion(node.origin.orientation)))
          }
        });
        break;
    }
  };

  private onEulerOrderChange_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;
    const order = option.data as Euler.Order;

    this.props.onNodeChange({
      ...node,
      origin: {
        ...node.origin,
        orientation: {
          ...node.origin.orientation as Rotation.Euler,
          order
        }
      }
    });
  };
    

  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.onNodeChange({
      ...this.props.node,
      name: event.currentTarget.value
    });
  };

  private onTypeSelect_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;
    
    // If the type didn't change, do nothing
    const selectedType = option.data as Node.Type;
    if (node.type === selectedType) {
      return;
    }

    let transmutedNode = Node.transmute(node, selectedType);

    // If the new type is an object, add a new geometry and reset the physics type
    if (transmutedNode.type === 'object') {
      const defaultGeometryType: Geometry.Type = 'box';

      transmutedNode = {
        ...transmutedNode,
        geometryId: uuid.v4(),
        physics: {
          ...transmutedNode.physics,
          type: PHSYICS_TYPE_MAPPINGS[defaultGeometryType],
        },
      };
      this.props.onGeometryAdd(transmutedNode.geometryId, Geometry.defaultFor(defaultGeometryType));
    }

    this.props.onNodeChange({ ...transmutedNode });

    // If the old type was an object, remove the old geometry
    if (node.type === 'object') {
      this.props.onGeometryRemove(node.geometryId);
    }
  };

  private onMaterialTypeSelect_ = (index: number, option: ComboBox.Option) => {
    const { props } = this;
    const { node, onNodeChange } = props;
    if (node.type !== 'object') return;

    onNodeChange({
      ...node,
      material: option.data as string === 'unset' ? undefined : Material.NIL
    });
  };

  private onMaterialFieldTypeChange_ = (field: keyof Material) => (index: number, option: ComboBox.Option) => {
    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');
    const material = node.material || {};

    const nextMaterial = { ...material };
    
    // Some fields are Source3 (3 channel) and others are Source1 (1 channel).
    // TypeScript isn't happy assigning the union of these, so a little any is used.
    switch (option.data as string) {
      case 'unset': {
        nextMaterial[field] = undefined;
        break;
      }
      case 'color1': {
        nextMaterial[field] = {
          type: 'color1',
          color: 0,
        } as any;
        break;
      }
      case 'color3': {
        nextMaterial[field] = {
          type: 'color3',
          color: Color.BLACK,
        } as any;
        break;
      }
      case 'texture': {
        nextMaterial[field] = {
          type: 'texture',
          uri: ''
        };
        break;
      }
    }

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialAlbedoTypeChange_ = this.onMaterialFieldTypeChange_('albedo');
  private onMaterialEmissiveTypeChange_ = this.onMaterialFieldTypeChange_('emissive');
  private onMaterialReflectionTypeChange_ = this.onMaterialFieldTypeChange_('reflection');
  private onMaterialAmbientTypeChange_ = this.onMaterialFieldTypeChange_('ambient');
  private onMaterialMetalnessTypeChange_ = this.onMaterialFieldTypeChange_('metalness');

  private onMaterialSource1Change_ = (field: keyof Material) => (value: Value) => {
    if (value.type !== Value.Type.Unitless) throw new Error('Value must be unitless');

    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material || {};

    const nextMaterial = { ...material };

    const member = material[field];

    if (member.type !== 'color1') throw new Error('Field is not a color1');

    nextMaterial[field] = {
      ...member,
      color: value.value
    } as any;

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialSource3ChannelChange_ = (field: keyof Material, channel: keyof Color.Rgb) => (value: Value) => {
    if (value.type !== Value.Type.Unitless) throw new Error('Value must be unitless');

    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material || {};

    const nextMaterial = { ...material };

    const member = material[field];

    if (member.type !== 'color3') throw new Error('Field is not a color3');

    const nextColor = Color.toRgb(member.color);
    nextColor[channel] = value.value.value;

    nextMaterial[field] = {
      ...member,
      color: nextColor
    } as any;

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialAlbedoRChange_ = this.onMaterialSource3ChannelChange_('albedo', 'r');
  private onMaterialAlbedoGChange_ = this.onMaterialSource3ChannelChange_('albedo', 'g');
  private onMaterialAlbedoBChange_ = this.onMaterialSource3ChannelChange_('albedo', 'b');

  private onMaterialEmissiveRChange_ = this.onMaterialSource3ChannelChange_('emissive', 'r');
  private onMaterialEmissiveGChange_ = this.onMaterialSource3ChannelChange_('emissive', 'g');
  private onMaterialEmissiveBChange_ = this.onMaterialSource3ChannelChange_('emissive', 'b');

  private onMaterialReflectionRChange_ = this.onMaterialSource3ChannelChange_('reflection', 'r');
  private onMaterialReflectionGChange_ = this.onMaterialSource3ChannelChange_('reflection', 'g');
  private onMaterialReflectionBChange_ = this.onMaterialSource3ChannelChange_('reflection', 'b');

  private onMaterialAmbientRChange_ = this.onMaterialSource3ChannelChange_('ambient', 'r');
  private onMaterialAmbientGChange_ = this.onMaterialSource3ChannelChange_('ambient', 'g');
  private onMaterialAmbientBChange_ = this.onMaterialSource3ChannelChange_('ambient', 'b');

  private onMaterialMetalnessChange_ = this.onMaterialSource1Change_('metalness');

  private onMaterialFieldTextureUriChange_ = (field: keyof Material) => (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { node, onNodeChange } = this.props;

    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material || {};
    const nextMaterial = { ...material };
    const member = material[field];

    if (member.type !== 'texture') throw new Error('Field is not a texture');

    nextMaterial[field] = {
      ...member,
      uri: event.currentTarget.value
    } as any;

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialAlbedoTextureUriChange_ = this.onMaterialFieldTextureUriChange_('albedo');
  private onMaterialEmissiveTextureUriChange_ = this.onMaterialFieldTextureUriChange_('emissive');
  private onMaterialReflectionTextureUriChange_ = this.onMaterialFieldTextureUriChange_('reflection');
  private onMaterialAmbientTextureUriChange_ = this.onMaterialFieldTextureUriChange_('ambient');
  private onMaterialMetalnessTextureUriChange_ = this.onMaterialFieldTextureUriChange_('metalness');
  
  // Convert a Material.Source3 into a ComboBox option.
  private static source1Type = (source1: Material.Source1) => {
    if (!source1) return 'unset';
    if (source1.type === 'color1') return 'color1';
    if (source1.type === 'texture') return 'texture';
    throw new Error('Unknown source1 type');
  }

  // Convert a Material.Source3 into a ComboBox option.
  private static source3Type = (source3: Material.Source3) => {
    if (!source3) return 'unset';
    if (source3.type === 'color3') return 'color3';
    if (source3.type === 'texture') return 'texture';
    throw new Error('Unknown source3 type');
  }


  private onParentSelect_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;
    
    this.props.onNodeChange({
      ...node,
      parentId: option.data as string
    });
  };

  private onGeometrySelect_ = (index: number, option: ComboBox.Option) => {
    const { props } = this;
    const { node } = props;
    
    if (node.type !== 'object') return;

    const type = option.data as Geometry.Type;

    this.props.onGeometryChange(node.geometryId, Geometry.defaultFor(type));

    const newPhysicsType = PHSYICS_TYPE_MAPPINGS[type];
    if (node.physics && node.physics.type !== newPhysicsType) {
      this.props.onNodeChange({
        ...node,
        physics: {
          ...node.physics,
          type: newPhysicsType,
        }
      });
    }
  };

  private onCollapsedChange_ = (key: string) => (collapsed: boolean) => {
    this.setState({
      collapsed: {
        ...this.state.collapsed,
        [key]: collapsed
      }
    });
  };

  private onPositionXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        position: {
          ...origin.position,
          x: Value.toDistance(value)
        }
      }
    });
  };

  private onPositionYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeChange({
      ...node,
      origin: {
        ...(origin || {}),
        position: {
          ...origin.position,
          y: Value.toDistance(value)
        }
      }
    });
  };

  private onPositionZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        position: {
          ...origin.position,
          z: Value.toDistance(value)
        }
      }
    });
  };

  private onOrientationEulerXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
          x: Value.toAngle(value)
        }
      }
    });
  };

  private onOrientationEulerYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
          y: Value.toAngle(value)
        }
      }
    });
  };

  private onOrientationEulerZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
          z: Value.toAngle(value)
        }
      }
    });
  };

  private onOrientationAngleAxisXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);

    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...orientation,
          axis: {
            ...orientation.axis,
            x: Value.toDistance(value)
          }
        }
      }
    });
  };

  private onOrientationAngleAxisYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);

    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...orientation,
          axis: {
            ...orientation.axis,
            y: Value.toDistance(value)
          }
        }
      }
    });
  };

  private onOrientationAngleAxisZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...orientation,
          axis: {
            ...orientation.axis,
            z: Value.toDistance(value)
          }
        }
      }
    });
  };

  private onOrientationAngleAxisAngleChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        orientation: {
          ...orientation,
          angle: Value.toAngle(value)
        }
      }
    });
  };

  private onScaleXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const scale = origin.scale || RawVector3.ONE;
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        scale: {
          ...scale,
          x: Value.toUnitless(value).value
        }
      }
    });
  };

  private onScaleYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const scale = origin.scale || RawVector3.ONE;
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        scale: {
          ...scale,
          y: Value.toUnitless(value).value
        }
      }
    });
  };

  private onScaleZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const scale = origin.scale || RawVector3.ONE;
    this.props.onNodeChange({
      ...node,
      origin: {
        ...origin,
        scale: {
          ...scale,
          z: Value.toUnitless(value).value
        }
      }
    });
  };

  

  private onMassChange_ = (value: Value) => {
    const { node } = this.props;
    if (node.type !== 'object') return;

    this.props.onNodeChange({
      ...node,
      physics: {
        ...node.physics,
        mass: Value.toMass(value)
      }
    });
  };

  private onFrictionChange_ = (value: Value) => {
    const { node } = this.props;
    if (node.type !== 'object') return;
    
    this.props.onNodeChange({
      ...node,
      physics: {
        ...node.physics,
        friction: Value.toUnitless(value).value
      }
    });
  };

  private onBoxSizeXChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Box;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      size: {
        ...geometry.size,
        x: Value.toDistance(value)
      }
    });
  };

  private onBoxSizeYChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Box;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      size: {
        ...geometry.size,
        y: Value.toDistance(value)
      }
    });
  };

  private onBoxSizeZChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Box;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      size: {
        ...geometry.size,
        z: Value.toDistance(value)
      }
    });
  };

  private onSphereRadiusChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Sphere;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      radius: Value.toDistance(value)
    });
  };

  private onCylinderRadiusChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Cylinder;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      radius: Value.toDistance(value)
    });
  };

  private onCylinderHeightChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Cylinder;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      height: Value.toDistance(value)
    });
  };
  
  private onPlaneSizeXChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Plane;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      size: {
        ...geometry.size,
        x: Value.toDistance(value)
      }
    });
  };
  
  private onPlaneSizeYChange_ = (geometryId: string) => (value: Value) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.Plane;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      size: {
        ...geometry.size,
        y: Value.toDistance(value)
      }
    });
  };

  private onFileUriChange_ = (geometryId: string) => (event: React.SyntheticEvent<HTMLInputElement>) => {
    const geometry = this.props.scene.geometry[geometryId] as Geometry.File;
    this.props.onGeometryChange(geometryId, {
      ...geometry,
      uri: event.currentTarget.value
    });
  };




  render() {
    const { props, state } = this;
    const { theme, node, scene, id } = props;
    const { collapsed } = state;

    const { parentId } = node;

    const origin = node.origin || {};
    const orientation = origin.orientation || Rotation.Euler.identity(Angle.Type.Degrees);

    const position = origin.position || Vector3.zero('centimeters');
    const scale = origin.scale || RawVector3.ONE;
    
    let friction = UnitlessValue.create(5);
    let mass: Mass = Mass.grams(5);

    if (node.type === 'object' && node.physics) {
      if (node.physics.friction !== undefined) friction = UnitlessValue.create(node.physics.friction);
      if (node.physics.mass !== undefined) mass = node.physics.mass;
    }

    const material = node.type === 'object' ? node.material : undefined;

    let parentIndex = 0;
    const parentOptions: ComboBox.Option[] = [
      ComboBox.option('Scene Root', undefined)
    ];

    let i = 0;
    for (const nodeId of Dict.keySet(scene.nodes)) {
      ++i;
      if (nodeId === id) continue;
      const node = scene.nodes[nodeId];
      parentOptions.push(ComboBox.option(node.name, nodeId));
      if (parentId === nodeId) parentIndex = i;
    }

    const geometry = node.type === 'object' ? scene.geometry[node.geometryId] : undefined;

    console.log({ node, geometry });


    return (
      <Container theme={theme}>
        <Section name='General' theme={theme}>
          <StyledField name='Name' theme={theme} long>
            <Input theme={theme} type='text' value={node.name} onChange={this.onNameChange_} />
          </StyledField>
          <StyledField name='Parent' theme={theme} long>
            <ComboBox options={parentOptions} theme={theme} index={parentIndex} onSelect={this.onParentSelect_} />
          </StyledField>
          <StyledField name='Type' theme={theme} long>
            <ComboBox options={NODE_TYPE_OPTIONS} theme={theme} index={NODE_TYPE_OPTIONS_REV[node.type]} onSelect={this.onTypeSelect_} />
          </StyledField>
          
          {node.type === 'object' && (
            <StyledField name='Geometry' theme={theme} long>
              <ComboBox options={GEOMETRY_OPTIONS} theme={theme} index={GEOMETRY_REVERSE_OPTIONS[geometry.type]} onSelect={this.onGeometrySelect_} />
            </StyledField>
          )}
        </Section>
        {(node.type === 'object' && geometry && geometry.type === 'box') ? (
          <Section
            name='Box Options'
            theme={theme}
            collapsed={collapsed['geometry']}
            onCollapsedChange={this.onCollapsedChange_('geometry')}
          >
            <StyledValueEdit
              name='Size X'
              long
              value={Value.distance(geometry.size.x)}
              onValueChange={this.onBoxSizeXChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Size Y'
              long
              value={Value.distance(geometry.size.y)}
              onValueChange={this.onBoxSizeYChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Size Z'
              long
              value={Value.distance(geometry.size.z)}
              onValueChange={this.onBoxSizeZChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'sphere') ? (
          <Section
            name='Sphere Options'
            theme={theme}
            collapsed={collapsed['geometry']}
            onCollapsedChange={this.onCollapsedChange_('geometry')}
          >
            <StyledValueEdit
              name='Radius'
              long
              value={Value.distance(geometry.radius)}
              onValueChange={this.onSphereRadiusChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'cylinder') ? (
          <Section
            name='Cylinder Options'
            theme={theme}
            collapsed={collapsed['geometry']}
            onCollapsedChange={this.onCollapsedChange_('geometry')}
          >
            <StyledValueEdit
              name='Radius'
              long
              value={Value.distance(geometry.radius)}
              onValueChange={this.onCylinderRadiusChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Height'
              long
              value={Value.distance(geometry.height)}
              onValueChange={this.onCylinderHeightChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'plane') ? (
          <Section name='Plane Options' theme={theme} collapsed={collapsed['geometry']} onCollapsedChange={this.onCollapsedChange_('geometry')}>
            <StyledValueEdit
              name='Size X'
              long
              value={Value.distance(geometry.size.x)}
              onValueChange={this.onPlaneSizeXChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Size Y'
              long
              value={Value.distance(geometry.size.y)}
              onValueChange={this.onPlaneSizeYChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        
        {(node.type === 'object' && geometry.type === 'file') ? (
          <Section name='File Options' theme={theme} collapsed={collapsed['geometry']} onCollapsedChange={this.onCollapsedChange_('geometry')}>
            <StyledField name='URI' long theme={theme}>
              <Input theme={theme} type='text' value={geometry.uri} onChange={this.onFileUriChange_(node.geometryId)} />
            </StyledField>
          </Section>
        ) : undefined}
        {node.type === 'object' ? (
          <Section name='Material' theme={theme} collapsed={collapsed['material']} onCollapsedChange={this.onCollapsedChange_('material')}>
            <StyledField name='Type' long theme={theme}>
              <ComboBox options={MATERIAL_TYPE_OPTIONS} theme={theme} index={MATERIAL_TYPE_OPTIONS_REV[material === undefined ? 'unset' : 'pbr']} onSelect={this.onMaterialTypeSelect_} />
            </StyledField>

            {/* Albedo */}
            {node.material && (
              <StyledField name='Albedo Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(material.albedo)]}
                  onSelect={this.onMaterialAlbedoTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.albedo && node.material.albedo.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Albedo Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).r))}
                  onValueChange={this.onMaterialAlbedoRChange_}
                />
                <StyledValueEdit
                  name='Albedo Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).g))}
                  onValueChange={this.onMaterialAlbedoGChange_}
                />
                <StyledValueEdit
                  name='Albedo Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).b))}
                  onValueChange={this.onMaterialAlbedoBChange_}
                />
              </>
            )}
            {node.material && node.material.albedo && node.material.albedo.type === 'texture' && (
              <StyledField name='Albedo Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.albedo.uri} onChange={this.onMaterialAlbedoTextureUriChange_} />
              </StyledField>
            )}

            {/* Reflection */}
            {node.material && (
              <StyledField name='Reflection Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(material.reflection)]}
                  onSelect={this.onMaterialReflectionTypeChange_}
                />
              </StyledField>
            )}

            {node.material && node.material.reflection && node.material.reflection.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Reflection Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).r))}
                  onValueChange={this.onMaterialReflectionRChange_}
                />
                <StyledValueEdit
                  name='Reflection Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).g))}
                  onValueChange={this.onMaterialReflectionGChange_}
                />
                <StyledValueEdit
                  name='Reflection Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).b))}
                  onValueChange={this.onMaterialReflectionBChange_}
                />
              </>
            )}
            {node.material && node.material.reflection && node.material.reflection.type === 'texture' && (
              <StyledField name='Reflection Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.reflection.uri} onChange={this.onMaterialReflectionTextureUriChange_} />
              </StyledField>
            )}

            {/* Emissive */}
            {node.material && (
              <StyledField name='Emissive Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(material.emissive)]}
                  onSelect={this.onMaterialEmissiveTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.emissive && node.material.emissive.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Emissive Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).r))}
                  onValueChange={this.onMaterialEmissiveRChange_}
                />
                <StyledValueEdit
                  name='Emissive Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).g))}
                  onValueChange={this.onMaterialEmissiveGChange_}
                />
                <StyledValueEdit
                  name='Emissive Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).b))}
                  onValueChange={this.onMaterialEmissiveBChange_}
                />
              </>
            )}
            {node.material && node.material.emissive && node.material.emissive.type === 'texture' && (
              <StyledField name='Emissive Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.emissive.uri} onChange={this.onMaterialEmissiveTextureUriChange_} />
              </StyledField>
            )}

            {/* Ambient */}
            {node.material && (
              <StyledField name='Ambient Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(material.ambient)]}
                  onSelect={this.onMaterialAmbientTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.ambient && node.material.ambient.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Ambient Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).r))}
                  onValueChange={this.onMaterialAmbientRChange_}
                />
                <StyledValueEdit
                  name='Ambient Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).g))}
                  onValueChange={this.onMaterialAmbientGChange_}
                />
                <StyledValueEdit
                  name='Ambient Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).b))} 
                  onValueChange={this.onMaterialAmbientBChange_}
                />
              </>
            )}
            {node.material && node.material.ambient && node.material.ambient.type === 'texture' && (
              <StyledField name='Ambient Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.ambient.uri} onChange={this.onMaterialAmbientTextureUriChange_} />
              </StyledField>
            )}

            {/* Metalness */}

            {node.material && (
              <StyledField name='Metalness Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE1_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE1_TYPE_OPTIONS_REV[NodeSettings.source1Type(material.metalness)]}
                  onSelect={this.onMaterialMetalnessTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.metalness && node.material.metalness.type === 'color1' && (
              <>
                <StyledValueEdit
                  name='Metalness'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(node.material.metalness.color))}
                  onValueChange={this.onMaterialMetalnessChange_}
                />
              </>
            )}
            {node.material && node.material.metalness && node.material.metalness.type === 'texture' && (
              <StyledField name='Metalness Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.metalness.uri} onChange={this.onMaterialMetalnessTextureUriChange_} />
              </StyledField>
            )}
          </Section>
        ) : undefined}
        <Section
          name='Position'
          theme={theme}
          collapsed={collapsed['position']}
          onCollapsedChange={this.onCollapsedChange_('position')}
        >
          <StyledValueEdit
            name='X'
            long
            value={Value.distance(position.x)}
            onValueChange={this.onPositionXChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Y'
            long
            value={Value.distance(position.y)}
            onValueChange={this.onPositionYChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Z'
            long
            value={Value.distance(position.z)}
            onValueChange={this.onPositionZChange_}
            theme={theme}
          />
        </Section>
        <Section
          name='Orientation'
          theme={theme}
          collapsed={collapsed['orientation']}
          onCollapsedChange={this.onCollapsedChange_('orientation')}
        >
          <StyledField name='Type' long theme={theme}>
            <ComboBox options={ROTATION_TYPES} theme={theme} index={ROTATION_TYPES.findIndex(r => r.data === orientation.type)} onSelect={this.onRotationTypeChange_} />
          </StyledField>
          {orientation.type === 'euler' ? (
            <>
              <StyledValueEdit
                name='X'
                long
                value={Value.angle(orientation.x)}
                onValueChange={this.onOrientationEulerXChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Y'
                long
                value={Value.angle(orientation.y)}
                onValueChange={this.onOrientationEulerYChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Z'
                long
                value={Value.angle(orientation.z)}
                onValueChange={this.onOrientationEulerZChange_}
                theme={theme}
              />
              <StyledField name='Order' long theme={theme}>
                <ComboBox
                  options={EULER_ORDER_OPTIONS}
                  theme={theme}
                  index={EULER_ORDER_OPTIONS.findIndex(o => (o.data as Euler.Order) === orientation.order)}
                  onSelect={this.onEulerOrderChange_}
                />
              </StyledField>
            </>
          ) : (
            <>
              <StyledValueEdit
                name='X'
                long
                value={Value.distance(orientation.axis.x)}
                onValueChange={this.onOrientationAngleAxisXChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Y'
                long
                value={Value.distance(orientation.axis.y)}
                onValueChange={this.onOrientationAngleAxisYChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Z'
                long
                value={Value.distance(orientation.axis.z)}
                onValueChange={this.onOrientationAngleAxisZChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Angle'
                long
                value={Value.angle(orientation.angle)}
                onValueChange={this.onOrientationAngleAxisAngleChange_}
                theme={theme}
              />
            </>
          )}
        </Section>
        <Section
          name='Scale'
          theme={theme}
          collapsed={collapsed['scale']}
          onCollapsedChange={this.onCollapsedChange_('scale')}
        >
          <StyledValueEdit
            name='X'
            long
            value={Value.unitless(UnitlessValue.create(scale.x))}
            onValueChange={this.onScaleXChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Y'
            long
            value={Value.unitless(UnitlessValue.create(scale.y))}
            onValueChange={this.onScaleYChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Z'
            long
            value={Value.unitless(UnitlessValue.create(scale.z))}
            onValueChange={this.onScaleZChange_}
            theme={theme}
          />
        </Section>
        {node.type === 'object' && (
          <Section
            name='Physics'
            theme={theme}
            collapsed={collapsed['physics']}
            onCollapsedChange={this.onCollapsedChange_('physics')}
            noBorder
          >
            <StyledValueEdit name='Mass' value={Value.mass(mass)} onValueChange={this.onMassChange_} theme={theme} />
            <StyledValueEdit name='Friction' value={Value.unitless(friction)} onValueChange={this.onFrictionChange_} theme={theme} />
          </Section>)}
        
      </Container>
    );
  }
}

const PHSYICS_TYPE_MAPPINGS: { [key in Geometry.Type]: Node.Physics.Type } = {
  'box': 'box',
  'cone': 'mesh',
  'cylinder': 'cylinder',
  'file': 'mesh',
  'mesh': 'mesh',
  'plane': 'box',
  'sphere': 'sphere',
};

export default NodeSettings;