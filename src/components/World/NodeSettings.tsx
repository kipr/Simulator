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

const NODE_TYPES_REV = (() => {
  const map: Record<string, number> = {};
  NODE_TYPES.forEach((type, i) => {
    map[type] = i;
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
    
    this.props.onNodeChange({
      ...Node.transmute(node, option.data as Node.Type)
    });
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
    
    const object = node as Node.Obj;

    const type = option.data as Geometry.Type;

    this.props.onGeometryChange(object.geometryId, Geometry.defaultFor(type));

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

    if (node.physics) {
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

    console.log({ node, geometry });


    return (
      <Container theme={theme}>
        <Section name='General' theme={theme}>
          <StyledField name='Name' theme={theme}>
            <Input theme={theme} type='text' value={node.name} onChange={this.onNameChange_} />
          </StyledField>
          <StyledField name='Parent' theme={theme}>
            <ComboBox options={parentOptions} theme={theme} index={parentIndex} onSelect={this.onParentSelect_} />
          </StyledField>
          <StyledField name='Type' theme={theme}>
            <ComboBox options={NODE_TYPE_OPTIONS} theme={theme} index={NODE_TYPES_REV[node.type]} onSelect={this.onTypeSelect_} />
          </StyledField>
          
          {node.type === 'object' && (
            <StyledField name='Geometry' theme={theme}>
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
              value={Value.distance(geometry.size.x)}
              onValueChange={this.onBoxSizeXChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Size Y'
              value={Value.distance(geometry.size.y)}
              onValueChange={this.onBoxSizeYChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Size Z'
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
              value={Value.distance(geometry.radius)}
              onValueChange={this.onCylinderRadiusChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Height'
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
              value={Value.distance(geometry.size.x)}
              onValueChange={this.onPlaneSizeXChange_(node.geometryId)}
              theme={theme}
            />
            <StyledValueEdit
              name='Size Y'
              value={Value.distance(geometry.size.y)}
              onValueChange={this.onPlaneSizeYChange_(node.geometryId)}
              theme={theme}
            />
          </Section>
        ) : undefined}
        {(node.type === 'object' && geometry.type === 'file') ? (
          <Section name='File Options' theme={theme} collapsed={collapsed['geometry']} onCollapsedChange={this.onCollapsedChange_('geometry')}>
            <StyledField name='URI' theme={theme}>
              <Input theme={theme} type='text' value={geometry.uri} onChange={this.onFileUriChange_(node.geometryId)} />
            </StyledField>
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
            value={Value.distance(position.x)}
            onValueChange={this.onPositionXChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Y'
            value={Value.distance(position.y)}
            onValueChange={this.onPositionYChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Z'
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
          <StyledField name='Type' theme={theme}>
            <ComboBox options={ROTATION_TYPES} theme={theme} index={ROTATION_TYPES.findIndex(r => r.data === orientation.type)} onSelect={this.onRotationTypeChange_} />
          </StyledField>
          {orientation.type === 'euler' ? (
            <>
              <StyledValueEdit
                name='X'
                value={Value.angle(orientation.x)}
                onValueChange={this.onOrientationEulerXChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Y'
                value={Value.angle(orientation.y)}
                onValueChange={this.onOrientationEulerYChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Z'
                value={Value.angle(orientation.z)}
                onValueChange={this.onOrientationEulerZChange_}
                theme={theme}
              />
              <StyledField name='Order' theme={theme}>
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
                value={Value.distance(orientation.axis.x)}
                onValueChange={this.onOrientationAngleAxisXChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Y'
                value={Value.distance(orientation.axis.y)}
                onValueChange={this.onOrientationAngleAxisYChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Z'
                value={Value.distance(orientation.axis.z)}
                onValueChange={this.onOrientationAngleAxisZChange_}
                theme={theme}
              />
              <StyledValueEdit
                name='Angle'
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
            value={Value.unitless(UnitlessValue.create(scale.x))}
            onValueChange={this.onScaleXChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Y'
            value={Value.unitless(UnitlessValue.create(scale.y))}
            onValueChange={this.onScaleYChange_}
            theme={theme}
          />
          <StyledValueEdit
            name='Z'
            value={Value.unitless(UnitlessValue.create(scale.z))}
            onValueChange={this.onScaleZChange_}
            theme={theme}
          />
        </Section>
        <Section
          name='Physics'
          theme={theme}
          collapsed={collapsed['physics']}
          onCollapsedChange={this.onCollapsedChange_('physics')}
          noBorder
        >
          <StyledValueEdit name='Mass' value={Value.mass(mass)} onValueChange={this.onMassChange_} theme={theme} />
          <StyledValueEdit name='Friction' value={Value.unitless(friction)} onValueChange={this.onFrictionChange_} theme={theme} />
        </Section>
        
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