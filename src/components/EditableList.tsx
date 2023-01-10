import { faCog, faEye, faEyeSlash, faSync, faTimes } from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { styled, withStyleDeep } from "styletron-react";
import { StyleProps } from "../style";
import { Fa } from "./Fa";
import { BLUE, BROWN, GREEN, RED, ThemeProps } from "./theme";

export interface EditableListProps<P> extends StyleProps, ThemeProps {
  items: EditableList.Item<P>[];

  onItemRemove?: (index: number, userdata?: unknown) => void;
  onItemReorder?: (fromIndex: number, toIndex: number) => void;
}

interface EditableListState {
}

type Props = EditableListProps<EditableList.ItemProps>;
type State = EditableListState;

const Container = styled('div', {
  width: '100%',
});

const ItemWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',

});

class EditableList extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  
    this.state = {};
  }

  private onRemove_ = (index: number, userdata?: unknown) => () => {
    this.props.onItemRemove(index, userdata);
  };

  render() {
    const { props } = this;
    const { items, style, className, onItemRemove } = props;



    return (
      <Container style={style} className={className}>
        {items.map((item, index) => {
          const Component = item.component;
          return (
            <Component
              {...item.props}
              onRemove={item.removable ? this.onRemove_(index, item.userdata) : undefined}
              key={index}
            />
          );
        })}
      </Container >
    );
  }
}

namespace EditableList {
  export interface ItemProps {
    onRemove?: () => void;
    onReorderStart?: () => void;
    onReorderEnd?: () => void;
  }

  export type ItemRawProps<P extends ItemProps> = Omit<P, keyof ItemProps>;

  export interface Item<P = ItemProps> {
    component: React.ComponentType<P>;
    props: ItemRawProps<P>;
    removable?: boolean;
    reorderable?: boolean;
    userdata?: unknown;
  }

  export namespace Item {
    export const standard = <P extends StyleProps>(props: ItemRawProps<StandardItem.Props<P>>, options?: Omit<Item<StandardItem.Props<P>>, 'component' | 'props'>): Item<StandardItem.Props<P>> => {
      return {
        component: StandardItem,
        props,
        removable: options ? options.removable : false,
        reorderable: options ? options.reorderable : false,
        userdata: options ? options.userdata : undefined,
      };
    };
  }
  
  export class StandardItem<P extends StyleProps> extends React.PureComponent<StandardItem.Props<P>, StandardItem.State> {
    constructor(props: StandardItem.Props<P>) {
      super(props);

      this.state = {
        hover: false,
        initialTouch: false,
      };
    }
  
    private onMouseEnter_ = (e: React.MouseEvent<HTMLDivElement>) => {
      this.setState({
        hover: true,
      });
    };

    private onMouseLeave_ = (e: React.MouseEvent<HTMLDivElement>) => {
      this.setState({
        hover: false,
        initialTouch: false,
      });
    };

    private onTouchEnd_ = (e: React.TouchEvent<HTMLDivElement>) => {
      if (!this.state.hover) {
        // Touch happened while buttons aren't visible, so set "initialTouch" to prevent buttons from rendering yet
        this.setState({
          initialTouch: true,
        });
      }
    };

    private onClick_ = (e: React.MouseEvent<HTMLDivElement>) => {
      if (this.state.initialTouch) {
        // Now that the click event has happened, reset "initialTouch" to allow buttons to render
        this.setState({
          initialTouch: false,
        });
      }
    };

    private onVisibilityChange_ = () => {
      const { visible, onVisibilityChange } = this.props;
      onVisibilityChange(!visible);
    };
      

    render() {
      const { props, state } = this;
      const {
        component: Component,
        onRemove,
        onSettings,
        onReset,
        onVisibilityChange,
        visible,
        props: componentProps
      } = props;
      const { hover, initialTouch } = state;
      return (
        <StandardItem.Container onMouseEnter={this.onMouseEnter_} onMouseLeave={this.onMouseLeave_} onTouchEnd={this.onTouchEnd_} onClick={this.onClick_}>
          <Component style={{ flex: '1 1' }} {...componentProps} />
          {(hover && !initialTouch) ? (
            <StandardItem.OptionsContainer>
              {onVisibilityChange && (
                <StandardItem.VisibilityIconContainer onClick={this.onVisibilityChange_}>
                  <StandardItem.OptionIcon icon={visible ? faEye : faEyeSlash} />
                </StandardItem.VisibilityIconContainer>
              )}
              {onReset && (
                <StandardItem.ResetIconContainer onClick={visible ? onReset : undefined} $disabled={!visible}>
                  <StandardItem.OptionIcon icon={faSync} />
                </StandardItem.ResetIconContainer>
              )}
              {onSettings && (
                <StandardItem.SettingsIconContainer onClick={onSettings}>
                  <StandardItem.OptionIcon icon={faCog} />
                </StandardItem.SettingsIconContainer>
              )}
              {onRemove && (
                <StandardItem.RemoveIconContainer onClick={onRemove}>
                  <StandardItem.OptionIcon icon={faTimes} />
                </StandardItem.RemoveIconContainer>
              )}
              
            </StandardItem.OptionsContainer>
          ) : undefined}
        </StandardItem.Container>
      );
    }
  }

  export namespace StandardItem {
    export interface ComponentProps extends StyleProps {
    }
    
    export interface Props<P extends ComponentProps> extends ItemProps {
      component: React.ComponentType<P>;
      props: ComponentRawProps<P>;
      visible?: boolean;
      onReset?: () => void;
      onSettings?: () => void;
      onVisibilityChange?: (visiblity: boolean) => void;
    }

    export type ComponentRawProps<P extends ComponentProps> = P;

    export interface State {
      hover: boolean;
      initialTouch: boolean;
    }

    export const Container = styled('div', {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      alignItems: 'stretch',
      ':nth-child(even)': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    });

    export const OptionsContainer = styled('div', {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      alignContent: 'center',
      userSelect: 'none'
    });

    export const OptionIconContainer = styled('div', (props: { $disabled?: boolean }) => ({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      cursor: props.$disabled ? 'auto' : 'pointer'
    }));

    export const OptionIcon = styled(Fa, {
      minWidth: '35px',
      padding: '5px',
      verticalAlign: 'middle',
      textAlign: 'center'
    });

    export const ResetIconContainer = withStyleDeep(OptionIconContainer, (props: { $disabled?: boolean }) => ({
      backgroundColor: props.$disabled ? BROWN.disabled : BROWN.standard,
      ':hover': !props.$disabled ? {
        backgroundColor: BROWN.hover
      } : {},
    }));

    export const VisibilityIconContainer = withStyleDeep(OptionIconContainer, {
      backgroundColor: BLUE.standard,
      ':hover': {
        backgroundColor: BLUE.hover
      }
    });

    export const SettingsIconContainer = withStyleDeep(OptionIconContainer, {
      backgroundColor: GREEN.standard,
      ':hover': {
        backgroundColor: GREEN.hover
      }
    });

    export const RemoveIconContainer = withStyleDeep(OptionIconContainer, {
      backgroundColor: RED.standard,
      ':hover': {
        backgroundColor: RED.hover
      }
    });
  }
}

export default EditableList;
