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
  onNodeOriginChange: (origin: ReferenceFrame) => void;
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
  ComboBox.option('Basic', 'basic'),
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
  ComboBox.option('RGB', 'color3'),
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
        this.props.onNodeOriginChange({
          orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(Rotation.toRawQuaternion(node.origin.orientation))),
        });
        break;
      case 'angle-axis':
        this.props.onNodeOriginChange({
          orientation: Rotation.AngleAxis.fromRaw(AngleAxis.fromQuaternion(Rotation.toRawQuaternion(node.origin.orientation))),
        });
        break;
    }
  };

  private onEulerOrderChange_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;
    const order = option.data as Euler.Order;

    this.props.onNodeOriginChange({
      orientation: {
        ...node.origin.orientation as Rotation.Euler,
        order,
      },
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

    let nextMaterial: Material = undefined;
    switch (option.data as string) {
      case 'unset': {
        nextMaterial = undefined;
        break;
      }
      case 'pbr': {
        nextMaterial = Material.Pbr.NIL;
        break;
      }
      case 'basic': {
        nextMaterial = Material.Basic.NIL;
      }
    }

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialBasicFieldTypeChange_ = (field: keyof Omit<Material.Basic, 'type'>) => (index: number, option: ComboBox.Option) => {
    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');
    const material = node.material as Material.Basic;

    const nextMaterial = { ...material };
    
    // Some fields are Source3 (3 channel) and others are Source1 (1 channel).
    // TypeScript isn't happy assigning the union of these, so some type assertion is used.
    switch (option.data as string) {
      case 'unset': {
        nextMaterial[field] = undefined;
        break;
      }
      case 'color1': {
        (nextMaterial[field] as Material.Source1) = {
          type: 'color1',
          color: 0,
        };
        break;
      }
      case 'color3': {
        nextMaterial[field] = {
          type: 'color3',
          color: Color.BLACK,
        };
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


  private onMaterialPbrFieldTypeChange_ = (field: keyof Omit<Material.Pbr, 'type'>) => (index: number, option: ComboBox.Option) => {
    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');
    const material = node.material as Material.Pbr;

    const nextMaterial = { ...material };
    
    // Some fields are Source3 (3 channel) and others are Source1 (1 channel).
    // TypeScript isn't happy assigning the union of these, so some type assertion is used.
    switch (option.data as string) {
      case 'unset': {
        nextMaterial[field] = undefined;
        break;
      }
      case 'color1': {
        (nextMaterial[field] as Material.Source1) = {
          type: 'color1',
          color: 0,
        };
        break;
      }
      case 'color3': {
        (nextMaterial[field] as Material.Source3) = {
          type: 'color3',
          color: Color.BLACK,
        };
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

  private onMaterialPbrAlbedoTypeChange_ = this.onMaterialPbrFieldTypeChange_('albedo');
  private onMaterialPbrEmissiveTypeChange_ = this.onMaterialPbrFieldTypeChange_('emissive');
  private onMaterialPbrReflectionTypeChange_ = this.onMaterialPbrFieldTypeChange_('reflection');
  private onMaterialPbrAmbientTypeChange_ = this.onMaterialPbrFieldTypeChange_('ambient');
  private onMaterialPbrMetalnessTypeChange_ = this.onMaterialPbrFieldTypeChange_('metalness');

  private onMaterialBasicColorTypeChange_ = this.onMaterialBasicFieldTypeChange_('color');

  private onMaterialPbrSource1Change_ = (field: keyof Omit<Material.Pbr, 'type'>) => (value: Value) => {
    if (value.type !== Value.Type.Unitless) throw new Error('Value must be unitless');

    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material as Material.Pbr;

    const nextMaterial = { ...material };

    const member = material[field];

    if (member.type !== 'color1') throw new Error('Field is not a color1');

    (nextMaterial[field] as Material.Source1) = {
      ...member,
      color: value.value.value
    };

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialPbrSource3ChannelChange_ = (field: keyof Omit<Material.Pbr, 'type'>, channel: keyof Color.Rgb) => (value: Value) => {
    if (value.type !== Value.Type.Unitless) throw new Error('Value must be unitless');

    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material as Material.Pbr;

    const nextMaterial = { ...material };

    const member = material[field];

    if (member.type !== 'color3') throw new Error('Field is not a color3');

    const nextColor = Color.toRgb(member.color);
    nextColor[channel] = value.value.value;

    (nextMaterial[field] as Material.Source3) = {
      ...member,
      color: nextColor
    };

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialBasicSource3ChannelChange_ = (field: keyof Omit<Material.Basic, 'type'>, channel: keyof Color.Rgb) => (value: Value) => {
    if (value.type !== Value.Type.Unitless) throw new Error('Value must be unitless');

    const { node, onNodeChange } = this.props;
    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material as Material.Basic;

    const nextMaterial = { ...material };

    const member = material[field];

    if (member.type !== 'color3') throw new Error('Field is not a color3');

    const nextColor = Color.toRgb(member.color);
    nextColor[channel] = value.value.value;

    nextMaterial[field] = {
      ...member,
      color: nextColor
    };

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialPbrAlbedoRChange_ = this.onMaterialPbrSource3ChannelChange_('albedo', 'r');
  private onMaterialPbrAlbedoGChange_ = this.onMaterialPbrSource3ChannelChange_('albedo', 'g');
  private onMaterialPbrAlbedoBChange_ = this.onMaterialPbrSource3ChannelChange_('albedo', 'b');

  private onMaterialPbrEmissiveRChange_ = this.onMaterialPbrSource3ChannelChange_('emissive', 'r');
  private onMaterialPbrEmissiveGChange_ = this.onMaterialPbrSource3ChannelChange_('emissive', 'g');
  private onMaterialPbrEmissiveBChange_ = this.onMaterialPbrSource3ChannelChange_('emissive', 'b');

  private onMaterialPbrReflectionRChange_ = this.onMaterialPbrSource3ChannelChange_('reflection', 'r');
  private onMaterialPbrReflectionGChange_ = this.onMaterialPbrSource3ChannelChange_('reflection', 'g');
  private onMaterialPbrReflectionBChange_ = this.onMaterialPbrSource3ChannelChange_('reflection', 'b');

  private onMaterialPbrAmbientRChange_ = this.onMaterialPbrSource3ChannelChange_('ambient', 'r');
  private onMaterialPbrAmbientGChange_ = this.onMaterialPbrSource3ChannelChange_('ambient', 'g');
  private onMaterialPbrAmbientBChange_ = this.onMaterialPbrSource3ChannelChange_('ambient', 'b');

  private onMaterialPbrMetalnessChange_ = this.onMaterialPbrSource1Change_('metalness');

  private onMaterialBasicColorRChange_ = this.onMaterialBasicSource3ChannelChange_('color', 'r');
  private onMaterialBasicColorGChange_ = this.onMaterialBasicSource3ChannelChange_('color', 'g');
  private onMaterialBasicColorBChange_ = this.onMaterialBasicSource3ChannelChange_('color', 'b');

  private onMaterialPbrFieldTextureUriChange_ = (field: keyof Omit<Material.Pbr, 'type'>) => (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { node, onNodeChange } = this.props;

    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material as Material.Pbr;
    const nextMaterial = { ...material };
    const member = material[field];

    if (member.type !== 'texture') throw new Error('Field is not a texture');

    nextMaterial[field] = {
      ...member,
      uri: event.currentTarget.value
    };

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialBasicFieldTextureUriChange_ = (field: keyof Omit<Material.Basic, 'type'>) => (event: React.SyntheticEvent<HTMLInputElement>) => {
    const { node, onNodeChange } = this.props;

    if (node.type !== 'object') throw new Error('Node is not an object');

    const material = node.material as Material.Basic;
    const nextMaterial = { ...material };
    const member = material[field];

    if (member.type !== 'texture') throw new Error('Field is not a texture');

    nextMaterial[field] = {
      ...member,
      uri: event.currentTarget.value
    };

    onNodeChange({
      ...node,
      material: nextMaterial
    });
  };

  private onMaterialPbrAlbedoTextureUriChange_ = this.onMaterialPbrFieldTextureUriChange_('albedo');
  private onMaterialPbrEmissiveTextureUriChange_ = this.onMaterialPbrFieldTextureUriChange_('emissive');
  private onMaterialPbrReflectionTextureUriChange_ = this.onMaterialPbrFieldTextureUriChange_('reflection');
  private onMaterialPbrAmbientTextureUriChange_ = this.onMaterialPbrFieldTextureUriChange_('ambient');
  private onMaterialPbrMetalnessTextureUriChange_ = this.onMaterialPbrFieldTextureUriChange_('metalness');
  
  private onMaterialBasicColorTextureUriChange_ = this.onMaterialBasicFieldTextureUriChange_('color');
  
  private static materialType = (material: Material) => {
    if (!material) return 'unset';
    if (material.type === 'basic') return 'basic';
    if (material.type === 'pbr') return 'pbr';
    throw new Error('Unknown material type');
  };

  // Convert a Material.Source3 into a ComboBox option.
  private static source1Type = (source1: Material.Source1) => {
    if (!source1) return 'unset';
    if (source1.type === 'color1') return 'color1';
    if (source1.type === 'texture') return 'texture';
    throw new Error('Unknown source1 type');
  };

  // Convert a Material.Source3 into a ComboBox option.
  private static source3Type = (source3: Material.Source3) => {
    if (!source3) return 'unset';
    if (source3.type === 'color3') return 'color3';
    if (source3.type === 'texture') return 'texture';
    throw new Error('Unknown source3 type');
  };


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

    this.props.onNodeOriginChange({
      position: {
        ...origin.position,
        x: Value.toDistance(value),
      },
    });
  };

  private onPositionYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeOriginChange({
      position: {
        ...origin.position,
        y: Value.toDistance(value),
      },
    });
  };

  private onPositionZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeOriginChange({
      position: {
        ...origin.position,
        z: Value.toDistance(value),
      },
    });
  };

  private onOrientationEulerXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeOriginChange({
      orientation: {
        ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
        x: Value.toAngle(value),
      },
    });
  };

  private onOrientationEulerYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeOriginChange({
      orientation: {
        ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
        y: Value.toAngle(value),
      },
    });
  };

  private onOrientationEulerZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};

    this.props.onNodeOriginChange({
      orientation: {
        ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
        z: Value.toAngle(value),
      },
    });
  };

  private onOrientationAngleAxisXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);

    this.props.onNodeOriginChange({
      orientation: {
        ...orientation,
        axis: {
          ...orientation.axis,
          x: Value.toDistance(value),
        },
      },
    });
  };

  private onOrientationAngleAxisYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);

    this.props.onNodeOriginChange({
      orientation: {
        ...orientation,
        axis: {
          ...orientation.axis,
          y: Value.toDistance(value),
        },
      },
    });
  };

  private onOrientationAngleAxisZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);

    this.props.onNodeOriginChange({
      orientation: {
        ...orientation,
        axis: {
          ...orientation.axis,
          z: Value.toDistance(value),
        },
      },
    });
  };

  private onOrientationAngleAxisAngleChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const orientation: Rotation.AngleAxis = origin.orientation as Rotation.AngleAxis || Rotation.AngleAxis.identity(Angle.Type.Degrees);

    this.props.onNodeOriginChange({
      orientation: {
        ...orientation,
        angle: Value.toAngle(value),
      },
    });
  };

  private onScaleXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const scale = origin.scale || RawVector3.ONE;

    this.props.onNodeOriginChange({
      scale: {
        ...scale,
        x: Value.toUnitless(value).value,
      },
    });
  };

  private onScaleYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const scale = origin.scale || RawVector3.ONE;

    this.props.onNodeOriginChange({
      scale: {
        ...scale,
        y: Value.toUnitless(value).value,
      },
    });
  };

  private onScaleZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.origin || {};
    const scale = origin.scale || RawVector3.ONE;

    this.props.onNodeOriginChange({
      scale: {
        ...scale,
        z: Value.toUnitless(value).value,
      },
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
              <ComboBox options={MATERIAL_TYPE_OPTIONS} theme={theme} index={MATERIAL_TYPE_OPTIONS_REV[NodeSettings.materialType(node.material)]} onSelect={this.onMaterialTypeSelect_} />
            </StyledField>

            {/* Basic Color */}
            {node.material && node.material.type === 'basic' && (
              <StyledField name='Color Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(node.material.color)]}
                  onSelect={this.onMaterialBasicColorTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.type === 'basic' && node.material.color && node.material.color.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Color Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.color.color).r))}
                  onValueChange={this.onMaterialBasicColorRChange_}
                />
                <StyledValueEdit
                  name='Color Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.color.color).g))}
                  onValueChange={this.onMaterialBasicColorGChange_}
                />
                <StyledValueEdit
                  name='Color Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.color.color).b))}
                  onValueChange={this.onMaterialBasicColorBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'basic' && node.material.color && node.material.color.type === 'texture' && (
              <StyledField name='Color Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.color.uri} onChange={this.onMaterialBasicColorTextureUriChange_} />
              </StyledField>
            )}

            {/* Albedo */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name='Albedo Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(node.material.albedo)]}
                  onSelect={this.onMaterialPbrAlbedoTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.type === 'pbr' && node.material.albedo && node.material.albedo.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Albedo Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).r))}
                  onValueChange={this.onMaterialPbrAlbedoRChange_}
                />
                <StyledValueEdit
                  name='Albedo Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).g))}
                  onValueChange={this.onMaterialPbrAlbedoGChange_}
                />
                <StyledValueEdit
                  name='Albedo Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).b))}
                  onValueChange={this.onMaterialPbrAlbedoBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.albedo && node.material.albedo.type === 'texture' && (
              <StyledField name='Albedo Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.albedo.uri} onChange={this.onMaterialPbrAlbedoTextureUriChange_} />
              </StyledField>
            )}

            {/* Reflection */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name='Reflection Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(node.material.reflection)]}
                  onSelect={this.onMaterialPbrReflectionTypeChange_}
                />
              </StyledField>
            )}

            {node.material && node.material.type === 'pbr' && node.material.reflection && node.material.reflection.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Reflection Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).r))}
                  onValueChange={this.onMaterialPbrReflectionRChange_}
                />
                <StyledValueEdit
                  name='Reflection Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).g))}
                  onValueChange={this.onMaterialPbrReflectionGChange_}
                />
                <StyledValueEdit
                  name='Reflection Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).b))}
                  onValueChange={this.onMaterialPbrReflectionBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.reflection && node.material.reflection.type === 'texture' && (
              <StyledField name='Reflection Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.reflection.uri} onChange={this.onMaterialPbrReflectionTextureUriChange_} />
              </StyledField>
            )}

            {/* Emissive */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name='Emissive Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(node.material.emissive)]}
                  onSelect={this.onMaterialPbrEmissiveTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.type === 'pbr' && node.material.emissive && node.material.emissive.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Emissive Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).r))}
                  onValueChange={this.onMaterialPbrEmissiveRChange_}
                />
                <StyledValueEdit
                  name='Emissive Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).g))}
                  onValueChange={this.onMaterialPbrEmissiveGChange_}
                />
                <StyledValueEdit
                  name='Emissive Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).b))}
                  onValueChange={this.onMaterialPbrEmissiveBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.emissive && node.material.emissive.type === 'texture' && (
              <StyledField name='Emissive Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.emissive.uri} onChange={this.onMaterialPbrEmissiveTextureUriChange_} />
              </StyledField>
            )}

            {/* Ambient */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name='Ambient Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE3_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE3_TYPE_OPTIONS_REV[NodeSettings.source3Type(node.material.ambient)]}
                  onSelect={this.onMaterialPbrAmbientTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.type === 'pbr' && node.material.ambient && node.material.ambient.type === 'color3' && (
              <>
                <StyledValueEdit
                  name='Ambient Red'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).r))}
                  onValueChange={this.onMaterialPbrAmbientRChange_}
                />
                <StyledValueEdit
                  name='Ambient Green'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).g))}
                  onValueChange={this.onMaterialPbrAmbientGChange_}
                />
                <StyledValueEdit
                  name='Ambient Blue'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).b))} 
                  onValueChange={this.onMaterialPbrAmbientBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.ambient && node.material.ambient.type === 'texture' && (
              <StyledField name='Ambient Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.ambient.uri} onChange={this.onMaterialPbrAmbientTextureUriChange_} />
              </StyledField>
            )}

            {/* Metalness */}

            {node.material && node.material.type === 'pbr' && (
              <StyledField name='Metalness Type' long theme={theme}>
                <ComboBox
                  options={MATERIAL_SOURCE1_TYPE_OPTIONS}
                  theme={theme}
                  index={MATERIAL_SOURCE1_TYPE_OPTIONS_REV[NodeSettings.source1Type(node.material.metalness)]}
                  onSelect={this.onMaterialPbrMetalnessTypeChange_}
                />
              </StyledField>
            )}
            {node.material && node.material.type === 'pbr' && node.material.metalness && node.material.metalness.type === 'color1' && (
              <>
                <StyledValueEdit
                  name='Metalness'
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(node.material.metalness.color))}
                  onValueChange={this.onMaterialPbrMetalnessChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.metalness && node.material.metalness.type === 'texture' && (
              <StyledField name='Metalness Texture URI' long theme={theme}>
                <Input theme={theme} type='text' value={node.material.metalness.uri} onChange={this.onMaterialPbrMetalnessTextureUriChange_} />
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