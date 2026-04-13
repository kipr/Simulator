import {
  faCog,
  faEye,
  faEyeSlash,
  faSync,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { styled, withStyleDeep } from "styletron-react";
import { StyleProps } from "../util/style";
import { FontAwesome } from "./FontAwesome";
import { BLUE, BROWN, GREEN, RED, ThemeProps } from "./constants/theme";
import TourTarget from "./Tours/TourTarget";
import { TourRegistry } from "../tours/TourRegistry";
import LocalizedString from "../util/LocalizedString";
import tr from '@i18n';
import { State as ReduxState } from '../state';
import { connect } from 'react-redux';



export interface EditableListProps<P> extends StyleProps, ThemeProps {
  items: EditableList.Item<P>[];

  onItemRemove?: (index: number, userdata?: unknown) => void;
  onItemReorder?: (fromIndex: number, toIndex: number) => void;
  tourRegistry?: TourRegistry;
  onContinueTour?: () => void;
}

interface EditableListPrivateProps {
  locale: LocalizedString.Language;
}

interface EditableListState { }

type Props = EditableListProps<EditableList.ItemProps> & EditableListPrivateProps;
type State = EditableListState;

const Container = styled("div", {
  width: "100%",
});

const ItemWrapper = styled("div", {
  display: "flex",
  flexDirection: "row",
  width: "100%",
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
          const row = (
            <div key={index} style={{ display: "flex", width: "100%" }}>
              <Component
                {...item.props}
                onRemove={
                  item.removable
                    ? () => this.onRemove_(index, item.userdata)
                    : undefined
                }
                onContinueTour={
                  item.userdata === "can1"
                    ? this.props.onContinueTour
                    : undefined
                }
                locale={props.locale}
                userData={item.userdata}
              />
            </div>
          );

          return item.userdata === "can1" && this.props.tourRegistry ? (
            <TourTarget
              key={index}
              registry={this.props.tourRegistry}
              targetKey="can1"
            >
              {row}
            </TourTarget>
          ) : (
            row
          );
        })}
      </Container>
    );
  }
}

namespace EditableList {
  export interface ItemProps {
    userData: unknown;
    onRemove?: () => void;
    onReorderStart?: () => void;
    onReorderEnd?: () => void;
    onContinueTour?: () => void;

    locale?: LocalizedString.Language;

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
    export const standard = <P extends StyleProps>(
      props: ItemRawProps<StandardItem.Props<P>>,
      options?: Omit<Item<StandardItem.Props<P>>, "component" | "props">
    ): Item<StandardItem.Props<P>> => {
      return {
        component: StandardItem,
        props,
        removable: options ? options.removable : false,
        reorderable: options ? options.reorderable : false,
        userdata: options ? options.userdata : undefined,
      };
    };
  }

  export class StandardItem<P extends StyleProps> extends React.PureComponent<
    StandardItem.Props<P>,
    StandardItem.State
  > {
    constructor(props: StandardItem.Props<P>) {
      super(props);

      this.state = {
        hover: false,
        initialTouch: false,
      };
    }

    private onMouseEnter_ = (e: React.MouseEvent<HTMLDivElement>) => {
      this.setState(
        {
          hover: true,
        },
      );
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
      const { visible, onVisibilityChange, onContinueTour } = this.props;
      onVisibilityChange(!visible);
      if (onContinueTour) {
        onContinueTour();
      }
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
        tourRegistry,

        props: componentProps,
      } = props;

      const { hover, initialTouch } = state;
      const tourCan1 = !!tourRegistry && props.userData === "can1";

      const showOptions = tourCan1;

      const tourContent_ = (
        <StandardItem.OptionsContainer>
          <TourTarget
            registry={this.props.tourRegistry}
            targetKey={"can1-visibility"}
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <StandardItem.VisibilityIconContainer
              onClick={this.onVisibilityChange_}
            >
              <StandardItem.OptionIcon
                icon={visible ? faEye : faEyeSlash}
              />
            </StandardItem.VisibilityIconContainer>
          </TourTarget>
          <TourTarget registry={this.props.tourRegistry} targetKey={"can1-reset"} style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            minHeight: 0,
          }}>
            <StandardItem.ResetIconContainer
              onClick={visible ? onReset : undefined}
              $disabled={!visible}
            >
              <StandardItem.OptionIcon icon={faSync} />
            </StandardItem.ResetIconContainer>
          </TourTarget>
          <TourTarget registry={this.props.tourRegistry} targetKey={"can1-settings"} style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            minHeight: 0,
          }}>
            <StandardItem.SettingsIconContainer onClick={onSettings}>
              <StandardItem.OptionIcon icon={faCog} />
            </StandardItem.SettingsIconContainer>
          </TourTarget>
          <TourTarget registry={this.props.tourRegistry} targetKey={"can1-remove"} style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            minHeight: 0,
          }}>
            <StandardItem.RemoveIconContainer onClick={onRemove}>
              <StandardItem.OptionIcon icon={faTimes} />
            </StandardItem.RemoveIconContainer>
          </TourTarget>
        </StandardItem.OptionsContainer>
      );
      return (
        <StandardItem.Container
          onMouseEnter={this.onMouseEnter_}
          onMouseLeave={this.onMouseLeave_}
          onTouchEnd={this.onTouchEnd_}
          onClick={this.onClick_}
        >
          <Component style={{ flex: "1 1" }} {...componentProps} />

          {tourRegistry && showOptions ? (tourContent_) : ((hover && !initialTouch) ? (
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
          ) : undefined)}
        </StandardItem.Container>
      );
    }
  }

  export namespace StandardItem {
    export interface ComponentProps extends StyleProps { }

    export interface Props<P extends ComponentProps> extends ItemProps {
      component: React.ComponentType<P>;
      locale: LocalizedString.Language;
      props: ComponentRawProps<P>;
      userData: EditableList.ItemProps["userData"];
      visible?: boolean;
      onReset?: () => void;
      onSettings?: () => void;
      onVisibilityChange?: (visiblity: boolean) => void;
      tourRegistry?: TourRegistry;

      onContinueTour?: () => void;
    }

    export type ComponentRawProps<P extends ComponentProps> = P;

    export interface State {
      hover: boolean;
      initialTouch: boolean;
    }

    export const Container = styled("div", {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "stretch",
      ":nth-child(even)": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      },
    });

    export const OptionsContainer = styled("div", {
      display: "flex",
      flexDirection: "row",
      alignItems: "stretch",
      alignContent: "center",
      userSelect: "none",
    });

    export const OptionIconContainer = styled(
      "div",
      (props: { $disabled?: boolean }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        cursor: props.$disabled ? "auto" : "pointer",
      })
    );

    export const OptionIcon = styled(FontAwesome, {
      minWidth: "35px",
      padding: "5px",
      verticalAlign: "middle",
      textAlign: "center",
    });

    export const ResetIconContainer = withStyleDeep(
      OptionIconContainer,
      (props: { $disabled?: boolean }) => ({
        backgroundColor: props.$disabled ? BROWN.disabled : BROWN.standard,
        ":hover": !props.$disabled
          ? {
            backgroundColor: BROWN.hover,
          }
          : {},
      })
    );

    export const VisibilityIconContainer = withStyleDeep(OptionIconContainer, {
      backgroundColor: BLUE.standard,
      ":hover": {
        backgroundColor: BLUE.hover,
      },
    });

    export const SettingsIconContainer = withStyleDeep(OptionIconContainer, {
      backgroundColor: GREEN.standard,
      ":hover": {
        backgroundColor: GREEN.hover,
      },
    });

    export const RemoveIconContainer = withStyleDeep(OptionIconContainer, {
      backgroundColor: RED.standard,
      ":hover": {
        backgroundColor: RED.hover,
      },
    });
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(EditableList) as React.ComponentType<EditableListProps<EditableList.ItemProps>>;
