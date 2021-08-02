import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame, Rotation, Vector3 } from "../../unit-math";
import { Item } from "../../state";
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
import { AngleAxis, Euler } from "../../math";


export interface ItemSettingsProps extends ThemeProps {
  onItemChange: (item: Item) => void;
  item: Item;
}

interface ItemSettingsState {
  collapsed: { [key: string]: boolean };
}

type Props = ItemSettingsProps;
type State = ItemSettingsState;

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

const TYPE_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('Can', Item.Type.Can),
  ComboBox.option('Paper Ream', Item.Type.PaperReam),
];

const ROTATION_TYPES: ComboBox.Option[] = [
  ComboBox.option('Euler', Rotation.Type.Euler),
  ComboBox.option('Axis Angle', Rotation.Type.AngleAxis),
];

const EULER_ORDER_OPTIONS: ComboBox.Option[] = [
  ComboBox.option('XYZ', 'xyz'),
  ComboBox.option('YZX', 'yzx'),
  ComboBox.option('ZXY', 'zxy'),
  ComboBox.option('XZY', 'xzy'),
  ComboBox.option('YXZ', 'yxz'),
  ComboBox.option('ZYX', 'zyx'),
];

class ItemSettings extends React.PureComponent<Props, State> {
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
    const { item } = this.props;

    const type = option.data as Rotation.Type;

    switch (type) {
      case Rotation.Type.Euler:
        this.props.onItemChange({
          ...item,
          startingOrigin: {
            ...item.startingOrigin,
            orientation: Rotation.Euler.fromRaw(Euler.fromQuaternion(Rotation.toRawQuaternion(item.startingOrigin.orientation)))
          }
        });
        break;
      case Rotation.Type.AngleAxis:
        this.props.onItemChange({
          ...item,
          startingOrigin: {
            ...item.startingOrigin,
            orientation: Rotation.AngleAxis.fromRaw(AngleAxis.fromQuaternion(Rotation.toRawQuaternion(item.startingOrigin.orientation)))
          }
        });
        break;
    }
  };

  private onEulerOrderChange_ = (index: number, option: ComboBox.Option) => {
    const { item } = this.props;
    const order = option.data as Euler.Order;

    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...item.startingOrigin.orientation as Rotation.Euler,
          order
        }
      }
    });
  };
    

  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.onItemChange({
      ...this.props.item,
      name: event.currentTarget.value
    });
  };

  private onTypeSelect_ = (index: number, option: ComboBox.Option) => {
    this.props.onItemChange({
      ...this.props.item,
      type: option.data as Item.Type
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
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        position: {
          ...item.startingOrigin.position,
          x: Value.toDistance(value)
        }
      }
    });
  };

  private onPositionYChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        position: {
          ...item.startingOrigin.position,
          y: Value.toDistance(value)
        }
      }
    });
  };

  private onPositionZChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        position: {
          ...item.startingOrigin.position,
          z: Value.toDistance(value)
        }
      }
    });
  };

  private onOrientationEulerXChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...(item.startingOrigin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
          x: Value.toAngle(value)
        }
      }
    });
  };

  private onOrientationEulerYChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...(item.startingOrigin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
          y: Value.toAngle(value)
        }
      }
    });
  };

  private onOrientationEulerZChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...(item.startingOrigin.orientation as Rotation.Euler || Rotation.Euler.identity(Angle.Type.Degrees)),
          z: Value.toAngle(value)
        }
      }
    });
  };

  private onOrientationAngleAxisXChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...item.startingOrigin.orientation as Rotation.AngleAxis,
          axis: {
            ...(item.startingOrigin.orientation as Rotation.AngleAxis).axis,
            x: Value.toDistance(value)
          }
        }
      }
    });
  };

  private onOrientationAngleAxisYChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...item.startingOrigin.orientation as Rotation.AngleAxis,
          axis: {
            ...(item.startingOrigin.orientation as Rotation.AngleAxis).axis,
            y: Value.toDistance(value)
          }
        }
      }
    });
  };

  private onOrientationAngleAxisZChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...item.startingOrigin.orientation as Rotation.AngleAxis,
          axis: {
            ...(item.startingOrigin.orientation as Rotation.AngleAxis).axis,
            z: Value.toDistance(value)
          }
        }
      }
    });
  };

  private onOrientationAngleAxisAngleChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      startingOrigin: {
        ...item.startingOrigin,
        orientation: {
          ...item.startingOrigin.orientation as Rotation.AngleAxis,
          angle: Value.toAngle(value)
        }
      }
    });
  };

  private onMassChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      mass: Value.toMass(value)
    });
  };

  private onFrictionChange_ = (value: Value) => {
    const { item } = this.props;
    this.props.onItemChange({
      ...item,
      friction: Value.toUnitless(value)
    });
  };

  render() {
    const { props, state } = this;
    const { theme, item } = props;
    const { collapsed } = state;

    const { startingOrigin } = item;

    const position = startingOrigin.position || Vector3.zero(Distance.Type.Centimeters);
    const orientation = startingOrigin.orientation || Rotation.Euler.identity(Angle.Type.Degrees);
    const friction = item.friction ? item.friction : UnitlessValue.create(5);
    const mass = item.mass ? item.mass : Mass.grams(5);

    return (
      <Container theme={theme}>
        <Section name='General' theme={theme}>
          <StyledField name='Type' theme={theme}>
            <ComboBox options={TYPE_OPTIONS} theme={theme} index={item.type} onSelect={this.onTypeSelect_} />
          </StyledField>
          <StyledField name='Name' theme={theme}>
            <Input theme={theme} type='text' value={item.name} onChange={this.onNameChange_} />
          </StyledField>
        </Section>
        <Section
          name='Starting position'
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
            <ComboBox options={ROTATION_TYPES} theme={theme} index={orientation.type} onSelect={this.onRotationTypeChange_} />
          </StyledField>
          {orientation.type === Rotation.Type.Euler ? (
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

export default ItemSettings;