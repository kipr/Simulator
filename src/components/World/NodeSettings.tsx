import * as React from "react";
import { styled } from "styletron-react";
import { Vector3 as RawVector3, AxisAngle, Euler } from "../../math";
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
import { State as ReduxState } from '../../state/index';

import * as uuid from 'uuid';
import LocalizedString from '../../util/LocalizedString';
import Robot from '../../state/State/Robot';
import { connect } from 'react-redux';
import Async from '../../state/State/Async';

import tr from '@i18n';

export interface NodeSettingsPublicProps extends ThemeProps {
  onNodeChange: (node: Node) => void;
  onNodeOriginChange: (origin: ReferenceFrame) => void;
  node: Node;
  id: string;

  onGeometryAdd: (id: string, geometry: Geometry) => void;
  onGeometryChange: (id: string, geometry: Geometry) => void;
  onGeometryRemove: (id: string) => void;

  scene: Scene;
}

interface NodeSettingsPrivateProps {
  robots: Dict<Async<Record<string, never>, Robot>>;
  locale: LocalizedString.Language;
}

interface NodeSettingsState {
  collapsed: { [key: string]: boolean };
}

type Props = NodeSettingsPublicProps & NodeSettingsPrivateProps;
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

class NodeSettings extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      collapsed: {
        position: true,
        orientation: true,
        scale: true,
        material: true,
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
          orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(Rotation.toRawQuaternion(node.startingOrigin.orientation))),
        });
        break;
      case 'axis-angle':
        this.props.onNodeOriginChange({
          orientation: Rotation.AxisAngle.fromRaw(AxisAngle.fromQuaternion(Rotation.toRawQuaternion(node.startingOrigin.orientation))),
        });
        break;
    }
  };

  private onEulerOrderChange_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;
    const order = option.data as Euler.Order;

    this.props.onNodeOriginChange({
      orientation: {
        ...node.startingOrigin.orientation as Rotation.Euler,
        order,
      },
    });
  };
    

  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.onNodeChange({
      ...this.props.node,
      name: {
        ...this.props.node.name,
        [this.props.locale]: event.currentTarget.value
      }
    });
  };

  private onTypeSelect_ = (index: number, option: ComboBox.Option) => {
    const { node, locale } = this.props;
    
    // If the type didn't change, do nothing
    const selectedType = option.data as Node.Type;
    if (node.type === selectedType) {
      return;
    }

    let transmutedNode = Node.transmute(node, selectedType);

    const TEMPLATE_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Can'), locale), 'can'),
      ComboBox.option(LocalizedString.lookup(tr('Paper Ream'), locale), 'ream'),
    ];

    // If the new type is from a template, set the template ID to a default value
    if (transmutedNode.type === 'from-template') {
      const defaultTemplateId = TEMPLATE_OPTIONS[0].data as string;
      
      transmutedNode = {
        ...transmutedNode,
        templateId: defaultTemplateId,
      };
    }

    // If the new type is an object, add a new geometry and reset the physics type
    if (transmutedNode.type === 'object') {
      const defaultGeometryType: Geometry.Type = 'box';

      transmutedNode = {
        ...transmutedNode,
        geometryId: uuid.v4(),
        physics: {
          mass: Mass.kilograms(1),
          friction: 5,
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


  // private onParentSelect_ = (index: number, option: ComboBox.Option) => {
  //   const { node } = this.props;
    
  //   this.props.onNodeChange({
  //     ...node,
  //     parentId: option.data as string
  //   });
  // };

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

  private onTemplateSelect_ = (index: number, option: ComboBox.Option) => {
    const { props } = this;
    const { node } = props;

    if (node.type !== 'from-template') return;

    const templateId = option.data as string;

    this.props.onNodeChange({
      ...node,
      templateId
    });
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
    const origin = node.startingOrigin || {};

    this.props.onNodeOriginChange({
      position: {
        ...origin.position,
        x: Value.toDistance(value),
      },
    });
  };

  private onPositionYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};

    this.props.onNodeOriginChange({
      position: {
        ...origin.position,
        y: Value.toDistance(value),
      },
    });
  };

  private onPositionZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};

    this.props.onNodeOriginChange({
      position: {
        ...origin.position,
        z: Value.toDistance(value),
      },
    });
  };

  private onOrientationEulerXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};

    this.props.onNodeOriginChange({
      orientation: {
        ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
        x: Value.toAngle(value),
      },
    });
  };

  private onOrientationEulerYChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};

    this.props.onNodeOriginChange({
      orientation: {
        ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
        y: Value.toAngle(value),
      },
    });
  };

  private onOrientationEulerZChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};

    this.props.onNodeOriginChange({
      orientation: {
        ...(origin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
        z: Value.toAngle(value),
      },
    });
  };

  private onOrientationAngleAxisXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};
    const orientation: Rotation.AxisAngle = origin.orientation as Rotation.AxisAngle || Rotation.AxisAngle.identity(Angle.Type.Degrees);

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
    const origin = node.startingOrigin || {};
    const orientation: Rotation.AxisAngle = origin.orientation as Rotation.AxisAngle || Rotation.AxisAngle.identity(Angle.Type.Degrees);

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
    const origin = node.startingOrigin || {};
    const orientation: Rotation.AxisAngle = origin.orientation as Rotation.AxisAngle || Rotation.AxisAngle.identity(Angle.Type.Degrees);

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
    const origin = node.startingOrigin || {};
    const orientation: Rotation.AxisAngle = origin.orientation as Rotation.AxisAngle || Rotation.AxisAngle.identity(Angle.Type.Degrees);

    this.props.onNodeOriginChange({
      orientation: {
        ...orientation,
        angle: Value.toAngle(value),
      },
    });
  };

  private onScaleXChange_ = (value: Value) => {
    const { node } = this.props;
    const origin = node.startingOrigin || {};
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
    const origin = node.startingOrigin || {};
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
    const origin = node.startingOrigin || {};
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

  private onRobotSelect_ = (index: number, option: ComboBox.Option) => {
    const { node } = this.props;
    if (node.type !== 'robot') return;

    this.props.onNodeChange({
      ...node,
      robotId: option.data as string
    });
  };


  render() {
    const { props, state } = this;
    const { theme, node, scene, id, robots, locale } = props;
    const { collapsed } = state;

    // const { parentId } = node;

    const origin = node.startingOrigin || {};
    const orientation = origin.orientation || Rotation.Euler.identity(Angle.Type.Degrees);

    const position = origin.position || Vector3.zero('centimeters');
    const scale = origin.scale || RawVector3.ONE;
    
    let friction = UnitlessValue.create(5);
    let mass: Mass = Mass.grams(5);

    if (node.type === 'object' && node.physics) {
      if (node.physics.friction !== undefined) friction = UnitlessValue.create(node.physics.friction);
      if (node.physics.mass !== undefined) mass = node.physics.mass;
    }

    // let parentIndex = 0;
    // const parentOptions: ComboBox.Option[] = [
    //   ComboBox.option('Scene Root', undefined)
    // ];

    // let i = 0;
    // for (const nodeId of Dict.keySet(scene.nodes)) {
    //   ++i;
    //   if (nodeId === id) continue;
    //   const node = scene.nodes[nodeId];
    //   parentOptions.push(ComboBox.option(node.name, nodeId));
    //   if (parentId === nodeId) parentIndex = i;
    // }

    const geometry = node.type === 'object' ? scene.geometry[node.geometryId] : undefined;

    const robotOptions: ComboBox.Option[] = Dict.toList(robots)
      .map(([id, robot]) => ([id, Async.latestValue(robot)]))
      .filter(([, robot]: [string, Robot]) => robot !== undefined)
      .map(([id, robot]: [string, Robot]) => ComboBox.option(LocalizedString.lookup(robot.name, locale), id));

    const GEOMETRY_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Box'), locale), 'box'),
      ComboBox.option(LocalizedString.lookup(tr('Sphere'), locale), 'sphere'),
      ComboBox.option(LocalizedString.lookup(tr('Cylinder'), locale), 'cylinder'),
      ComboBox.option(LocalizedString.lookup(tr('Cone'), locale), 'cone'),
      ComboBox.option(LocalizedString.lookup(tr('Plane'), locale), 'plane'),
      ComboBox.option(LocalizedString.lookup(tr('File'), locale), 'file'),
    ];
    
    const GEOMETRY_REVERSE_OPTIONS: Dict<number> = GEOMETRY_OPTIONS.reduce((dict, option, i) => {
      dict[option.data as string] = i;
      return dict;
    }, {});
    
    
    const TEMPLATE_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Can'), locale), 'can'),
      ComboBox.option(LocalizedString.lookup(tr('Paper Ream'), locale), 'ream'),
    ];
    
    const TEMPLATE_REVERSE_OPTIONS: Dict<number> = TEMPLATE_OPTIONS.reduce((dict, option, i) => {
      dict[option.data as string] = i;
      return dict;
    }, {});
    
    const ROTATION_TYPES: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Euler'), locale), 'euler'),
      ComboBox.option(LocalizedString.lookup(tr('Axis Angle'), locale), 'angle-axis'),
    ];
    
    const EULER_ORDER_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('XYZ', 'Rotation order'), locale), 'xyz'),
      ComboBox.option(LocalizedString.lookup(tr('YZX', 'Rotation order'), locale), 'yzx'),
      ComboBox.option(LocalizedString.lookup(tr('ZXY', 'Rotation order'), locale), 'zxy'),
      ComboBox.option(LocalizedString.lookup(tr('XZY', 'Rotation order'), locale), 'xzy'),
      ComboBox.option(LocalizedString.lookup(tr('YXZ', 'Rotation order'), locale), 'yxz'),
      ComboBox.option(LocalizedString.lookup(tr('ZYX', 'Rotation order'), locale), 'zyx'),
    ];
    
    const NODE_TYPE_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Empty'), locale), 'empty'),
      ComboBox.option(LocalizedString.lookup(tr('Standard Object'), locale), 'from-template'),
      ComboBox.option(LocalizedString.lookup(tr('Custom Object'), locale), 'object'),
      // ComboBox.option('Directional Light', 'directional-light'),
      ComboBox.option(LocalizedString.lookup(tr('Point Light'), locale), 'point-light'),
      // ComboBox.option('Spot Light', 'spot-light'),
    ];
    
    const NODE_TYPE_OPTIONS_REV = (() => {
      const map: Record<string, number> = {};
      NODE_TYPE_OPTIONS.forEach((option, i) => {
        map[option.data as string] = i;
      });
      return map;
    })();
    
    const MATERIAL_TYPE_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Unset'), locale), 'unset'),
      ComboBox.option(LocalizedString.lookup(tr('Basic'), locale), 'basic'),
      // ComboBox.option('PBR', 'pbr'),
    ];
    
    const MATERIAL_TYPE_OPTIONS_REV = (() => {
      const map: Record<string, number> = {};
      MATERIAL_TYPE_OPTIONS.forEach((option, i) => {
        map[option.data as string] = i;
      });
      return map;
    })();
    
    const MATERIAL_SOURCE3_TYPE_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Unset'), locale), 'unset'),
      ComboBox.option(LocalizedString.lookup(tr('RGB', 'Red, Green, Blue'), locale), 'color3'),
      ComboBox.option(LocalizedString.lookup(tr('Texture'), locale), 'texture'),
    ];
    
    const MATERIAL_SOURCE3_TYPE_OPTIONS_REV = (() => {
      const map: Record<string, number> = {};
      MATERIAL_SOURCE3_TYPE_OPTIONS.forEach((option, i) => {
        map[option.data as string] = i;
      });
      return map;
    })();
    
    const MATERIAL_SOURCE1_TYPE_OPTIONS: ComboBox.Option[] = [
      ComboBox.option(LocalizedString.lookup(tr('Unset'), locale), 'unset'),
      ComboBox.option(LocalizedString.lookup(tr('Value'), locale), 'color1'),
      ComboBox.option(LocalizedString.lookup(tr('Texture'), locale), 'texture'),
    ];
    
    const MATERIAL_SOURCE1_TYPE_OPTIONS_REV = (() => {
      const map: Record<string, number> = {};
      MATERIAL_SOURCE3_TYPE_OPTIONS.forEach((option, i) => {
        map[option.data as string] = i;
      });
      return map;
    })();

    return (
      <Container theme={theme}>
        <Section name={LocalizedString.lookup(tr('General'), locale)} theme={theme}>
          <StyledField name={LocalizedString.lookup(tr('Name'), locale)} theme={theme} long>
            <Input
              theme={theme}
              type='text'
              value={LocalizedString.lookup(node.name, locale)}
              onChange={this.onNameChange_}
            />
          </StyledField>
          {/* <StyledField name='Parent' theme={theme} long>
            <ComboBox options={parentOptions} theme={theme} index={parentIndex} onSelect={this.onParentSelect_} />
          </StyledField> */}
          
          {node.type !== 'robot' && (
            <StyledField name={LocalizedString.lookup(tr('Type'), locale)} theme={theme} long>
              <ComboBox
                options={NODE_TYPE_OPTIONS}
                theme={theme}
                index={NODE_TYPE_OPTIONS_REV[node.type]}
                onSelect={this.onTypeSelect_}
              />
            </StyledField>
          )}

          {node.type === 'robot' && (
            <StyledField name={LocalizedString.lookup(tr('Robot'), locale)} theme={theme} long>
              <ComboBox
                options={robotOptions}
                theme={theme}
                index={robotOptions.findIndex(option => option.data === node.robotId)}
                onSelect={this.onRobotSelect_}
              />
            </StyledField>
          )}
          
          {node.type === 'object' && (
            <StyledField name={LocalizedString.lookup(tr('Geometry'), locale)} theme={theme} long>
              <ComboBox
                options={GEOMETRY_OPTIONS}
                theme={theme}
                index={GEOMETRY_REVERSE_OPTIONS[geometry.type]}
                onSelect={this.onGeometrySelect_}
              />
            </StyledField>
          )}

          {node.type === 'from-template' && (
            <StyledField name={LocalizedString.lookup(tr('Item'), locale)} theme={theme} long>
              <ComboBox
                options={TEMPLATE_OPTIONS}
                theme={theme}
                index={TEMPLATE_REVERSE_OPTIONS[node.templateId]}
                onSelect={this.onTemplateSelect_}
              />
            </StyledField>
          )}
        </Section>
        {(node.type === 'object' && geometry && geometry.type === 'box') ? (
          <Section
            name={LocalizedString.lookup(tr('Box Options'), locale)}
            theme={theme}
            collapsed={collapsed['geometry']}
            onCollapsedChange={this.onCollapsedChange_('geometry')}
          >
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Size X'), locale)}
              long
              value={Value.distance(geometry.size.x)}
              onValueChange={this.onBoxSizeXChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Size Y'), locale)}
              long
              value={Value.distance(geometry.size.y)}
              onValueChange={this.onBoxSizeYChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Size Z'), locale)}
              long
              value={Value.distance(geometry.size.z)}
              onValueChange={this.onBoxSizeZChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'sphere') ? (
          <Section
            name={LocalizedString.lookup(tr('Sphere Options'), locale)}
            theme={theme}
            collapsed={collapsed['geometry']}
            onCollapsedChange={this.onCollapsedChange_('geometry')}
          >
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Radius'), locale)}
              long
              value={Value.distance(geometry.radius)}
              onValueChange={this.onSphereRadiusChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'cylinder') ? (
          <Section
            name={LocalizedString.lookup(tr('Cylinder Options'), locale)}
            theme={theme}
            collapsed={collapsed['geometry']}
            onCollapsedChange={this.onCollapsedChange_('geometry')}
          >
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Radius'), locale)}
              long
              value={Value.distance(geometry.radius)}
              onValueChange={this.onCylinderRadiusChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Height'), locale)}
              long
              value={Value.distance(geometry.height)}
              onValueChange={this.onCylinderHeightChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'plane') ? (
          <Section name={LocalizedString.lookup(tr('Plane Options'), locale)} theme={theme} collapsed={collapsed['geometry']} onCollapsedChange={this.onCollapsedChange_('geometry')}>
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Size X'), locale)}
              long
              value={Value.distance(geometry.size.x)}
              onValueChange={this.onPlaneSizeXChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name={LocalizedString.lookup(tr('Size Y'), locale)}
              long
              value={Value.distance(geometry.size.y)}
              onValueChange={this.onPlaneSizeYChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        
        {(node.type === 'object' && geometry.type === 'file') ? (
          <Section name={LocalizedString.lookup(tr('File Options'), locale)} theme={theme} collapsed={collapsed['geometry']} onCollapsedChange={this.onCollapsedChange_('geometry')}>
            <StyledField name={LocalizedString.lookup(tr('URI'), locale)} long theme={theme}>
              <Input theme={theme} type='text' value={geometry.uri} onChange={this.onFileUriChange_(node.geometryId)} />
            </StyledField>
          </Section>
        ) : undefined}
        {node.type === 'object' ? (
          <Section name={LocalizedString.lookup(tr('Material'), locale)} theme={theme} collapsed={collapsed['material']} onCollapsedChange={this.onCollapsedChange_('material')}>
            <StyledField name={LocalizedString.lookup(tr('Type'), locale)} long theme={theme}>
              <ComboBox options={MATERIAL_TYPE_OPTIONS} theme={theme} index={MATERIAL_TYPE_OPTIONS_REV[NodeSettings.materialType(node.material)]} onSelect={this.onMaterialTypeSelect_} />
            </StyledField>

            {/* Basic Color */}
            {node.material && node.material.type === 'basic' && (
              <StyledField name={LocalizedString.lookup(tr('Color Type'), locale)} long theme={theme}>
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
                  name={LocalizedString.lookup(tr('Color Red'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.color.color).r))}
                  onValueChange={this.onMaterialBasicColorRChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Color Green'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.color.color).g))}
                  onValueChange={this.onMaterialBasicColorGChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Color Blue'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.color.color).b))}
                  onValueChange={this.onMaterialBasicColorBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'basic' && node.material.color && node.material.color.type === 'texture' && (
              <StyledField name={LocalizedString.lookup(tr('Color Texture URI'), locale)} long theme={theme}>
                <Input theme={theme} type='text' value={node.material.color.uri} onChange={this.onMaterialBasicColorTextureUriChange_} />
              </StyledField>
            )}

            {/* Albedo */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name={LocalizedString.lookup(tr('Albedo Type'), locale)} long theme={theme}>
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
                  name={LocalizedString.lookup(tr('Albedo Red'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).r))}
                  onValueChange={this.onMaterialPbrAlbedoRChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Albedo Green'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).g))}
                  onValueChange={this.onMaterialPbrAlbedoGChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Albedo Blue'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.albedo.color).b))}
                  onValueChange={this.onMaterialPbrAlbedoBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.albedo && node.material.albedo.type === 'texture' && (
              <StyledField name={LocalizedString.lookup(tr('Albedo Texture URI'), locale)} long theme={theme}>
                <Input theme={theme} type='text' value={node.material.albedo.uri} onChange={this.onMaterialPbrAlbedoTextureUriChange_} />
              </StyledField>
            )}

            {/* Reflection */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name={LocalizedString.lookup(tr('Reflection Type'), locale)} long theme={theme}>
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
                  name={LocalizedString.lookup(tr('Reflection Red'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).r))}
                  onValueChange={this.onMaterialPbrReflectionRChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Reflection Green'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).g))}
                  onValueChange={this.onMaterialPbrReflectionGChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Reflection Blue'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.reflection.color).b))}
                  onValueChange={this.onMaterialPbrReflectionBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.reflection && node.material.reflection.type === 'texture' && (
              <StyledField name={LocalizedString.lookup(tr('Reflection Texture URI'), locale)} long theme={theme}>
                <Input theme={theme} type='text' value={node.material.reflection.uri} onChange={this.onMaterialPbrReflectionTextureUriChange_} />
              </StyledField>
            )}

            {/* Emissive */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name={LocalizedString.lookup(tr('Emissive Type'), locale)} long theme={theme}>
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
                  name={LocalizedString.lookup(tr('Emissive Red'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).r))}
                  onValueChange={this.onMaterialPbrEmissiveRChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Emissive Green'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).g))}
                  onValueChange={this.onMaterialPbrEmissiveGChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Emissive Blue'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.emissive.color).b))}
                  onValueChange={this.onMaterialPbrEmissiveBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.emissive && node.material.emissive.type === 'texture' && (
              <StyledField name={LocalizedString.lookup(tr('Emissive Texture URI'), locale)} long theme={theme}>
                <Input theme={theme} type='text' value={node.material.emissive.uri} onChange={this.onMaterialPbrEmissiveTextureUriChange_} />
              </StyledField>
            )}

            {/* Ambient */}
            {node.material && node.material.type === 'pbr' && (
              <StyledField name={LocalizedString.lookup(tr('Ambient Type'), locale)} long theme={theme}>
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
                  name={LocalizedString.lookup(tr('Ambient Red'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).r))}
                  onValueChange={this.onMaterialPbrAmbientRChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Ambient Green'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).g))}
                  onValueChange={this.onMaterialPbrAmbientGChange_}
                />
                <StyledValueEdit
                  name={LocalizedString.lookup(tr('Ambient Blue'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(Color.toRgb(node.material.ambient.color).b))} 
                  onValueChange={this.onMaterialPbrAmbientBChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.ambient && node.material.ambient.type === 'texture' && (
              <StyledField name={LocalizedString.lookup(tr('Ambient Texture URI'), locale)} long theme={theme}>
                <Input theme={theme} type='text' value={node.material.ambient.uri} onChange={this.onMaterialPbrAmbientTextureUriChange_} />
              </StyledField>
            )}

            {/* Metalness */}

            {node.material && node.material.type === 'pbr' && (
              <StyledField name={LocalizedString.lookup(tr('Metalness Type'), locale)} long theme={theme}>
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
                  name={LocalizedString.lookup(tr('Metalness'), locale)}
                  long
                  theme={theme}
                  value={Value.unitless(UnitlessValue.create(node.material.metalness.color))}
                  onValueChange={this.onMaterialPbrMetalnessChange_}
                />
              </>
            )}
            {node.material && node.material.type === 'pbr' && node.material.metalness && node.material.metalness.type === 'texture' && (
              <StyledField name={LocalizedString.lookup(tr('Metalness Texture URI'), locale)} long theme={theme}>
                <Input theme={theme} type='text' value={node.material.metalness.uri} onChange={this.onMaterialPbrMetalnessTextureUriChange_} />
              </StyledField>
            )}
          </Section>
        ) : undefined}
        <Section
          name={LocalizedString.lookup(tr('Position'), locale)}
          theme={theme}
          collapsed={collapsed['position']}
          onCollapsedChange={this.onCollapsedChange_('position')}
        >
          <StyledValueEdit
            name={LocalizedString.lookup(tr('X'), locale)}
            long
            value={Value.distance(position.x)}
            onValueChange={this.onPositionXChange_}
            theme={theme}
          />
          <StyledValueEdit
            name={LocalizedString.lookup(tr('Y'), locale)}
            long
            value={Value.distance(position.y)}
            onValueChange={this.onPositionYChange_}
            theme={theme}
          />
          <StyledValueEdit
            name={LocalizedString.lookup(tr('Z'), locale)}
            long
            value={Value.distance(position.z)}
            onValueChange={this.onPositionZChange_}
            theme={theme}
          />
        </Section>
        <Section
          name={LocalizedString.lookup(tr('Orientation'), locale)}
          theme={theme}
          collapsed={collapsed['orientation']}
          onCollapsedChange={this.onCollapsedChange_('orientation')}
        >
          <StyledField name={LocalizedString.lookup(tr('Type'), locale)} long theme={theme}>
            <ComboBox options={ROTATION_TYPES} theme={theme} index={ROTATION_TYPES.findIndex(r => r.data === orientation.type)} onSelect={this.onRotationTypeChange_} />
          </StyledField>
          {orientation.type === 'euler' ? (
            <>
              <StyledValueEdit
                name={LocalizedString.lookup(tr('X'), locale)}
                long
                value={Value.angle(orientation.x)}
                onValueChange={this.onOrientationEulerXChange_}
                theme={theme}
              />
              <StyledValueEdit
                name={LocalizedString.lookup(tr('Y'), locale)}
                long
                value={Value.angle(orientation.y)}
                onValueChange={this.onOrientationEulerYChange_}
                theme={theme}
              />
              <StyledValueEdit
                name={LocalizedString.lookup(tr('Z'), locale)}
                long
                value={Value.angle(orientation.z)}
                onValueChange={this.onOrientationEulerZChange_}
                theme={theme}
              />
              <StyledField name={LocalizedString.lookup(tr('Order'), locale)} long theme={theme}>
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
                name={LocalizedString.lookup(tr('X'), locale)}
                long
                value={Value.distance(orientation.axis.x)}
                onValueChange={this.onOrientationAngleAxisXChange_}
                theme={theme}
              />
              <StyledValueEdit
                name={LocalizedString.lookup(tr('Y'), locale)}
                long
                value={Value.distance(orientation.axis.y)}
                onValueChange={this.onOrientationAngleAxisYChange_}
                theme={theme}
              />
              <StyledValueEdit
                name={LocalizedString.lookup(tr('Z'), locale)}
                long
                value={Value.distance(orientation.axis.z)}
                onValueChange={this.onOrientationAngleAxisZChange_}
                theme={theme}
              />
              <StyledValueEdit
                name={LocalizedString.lookup(tr('Angle'), locale)}
                long
                value={Value.angle(orientation.angle)}
                onValueChange={this.onOrientationAngleAxisAngleChange_}
                theme={theme}
              />
            </>
          )}
        </Section>
        <Section
          name={LocalizedString.lookup(tr('Scale'), locale)}
          theme={theme}
          collapsed={collapsed['scale']}
          onCollapsedChange={this.onCollapsedChange_('scale')}
        >
          <StyledValueEdit
            name={LocalizedString.lookup(tr('X'), locale)}
            long
            value={Value.unitless(UnitlessValue.create(scale.x))}
            onValueChange={this.onScaleXChange_}
            theme={theme}
          />
          <StyledValueEdit
            name={LocalizedString.lookup(tr('Y'), locale)}
            long
            value={Value.unitless(UnitlessValue.create(scale.y))}
            onValueChange={this.onScaleYChange_}
            theme={theme}
          />
          <StyledValueEdit
            name={LocalizedString.lookup(tr('Z'), locale)}
            long
            value={Value.unitless(UnitlessValue.create(scale.z))}
            onValueChange={this.onScaleZChange_}
            theme={theme}
          />
        </Section>
        {node.type === 'object' && (
          <Section
            name={LocalizedString.lookup(tr('Physics'), locale)}
            theme={theme}
            collapsed={collapsed['physics']}
            onCollapsedChange={this.onCollapsedChange_('physics')}
            noBorder
          >
            <StyledValueEdit name={LocalizedString.lookup(tr('Mass'), locale)} value={Value.mass(mass)} onValueChange={this.onMassChange_} theme={theme} />
            <StyledValueEdit name={LocalizedString.lookup(tr('Friction'), locale)} value={Value.unitless(friction)} onValueChange={this.onFrictionChange_} theme={theme} />
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

export default connect((state: ReduxState, ownProps: NodeSettingsPublicProps) => {
  return {
    robots: state.robots.robots,
    locale: state.i18n.locale,
  };
})(NodeSettings) as React.ComponentType<NodeSettingsPublicProps>;