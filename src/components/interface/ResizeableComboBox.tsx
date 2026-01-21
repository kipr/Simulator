import * as React from "react";
import * as ReactDom from "react-dom";
import { styled } from "styletron-react";
import { Rectangle } from "../../util/math/math";
import { StyleProps } from '../../util/style';
import { AnyText } from "../../util";
import { Color } from "../../state/State/Scene/Color";
import { FontAwesome } from '../FontAwesome';
import { Text } from "./Text";
import { ThemeProps } from "../constants/theme";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

const Container = styled('div', (props: ThemeProps & { $focus?: boolean; $minimal?: boolean; $width?: string; $height?: string }) => ({
  // width: props.$width ?? '100%',
  height: props.$height ?? '100%',
  minWidth: props.$width ?? '100%',
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 4}px`,
  borderTopLeftRadius: !props.$minimal ? `${props.theme.borderRadius}px` : undefined,
  borderTopRightRadius: !props.$minimal ? `${props.theme.borderRadius}px` : undefined,
  borderBottomLeftRadius: props.$focus || props.$minimal ? 0 : `${props.theme.borderRadius}px`,
  borderBottomRightRadius: props.$focus || props.$minimal ? 0 : `${props.theme.borderRadius}px`,
  borderLeft: !props.$minimal ? `1px solid ${props.theme.borderColor}` : undefined,
  borderRight: !props.$minimal ? `1px solid ${props.theme.borderColor}` : undefined,
  borderTop: !props.$minimal ? `1px solid ${props.theme.borderColor}` : undefined,
  borderBottom: !props.$minimal ? (props.$focus ? '1px solid transparent' : `1px solid ${props.theme.borderColor}`) : undefined,
  backgroundColor: `rgba(0, 0, 0, 0.1)`,
  position: 'relative',
  overflow: props.$focus ? 'visible' : 'hidden',
  ':hover': {
    backgroundColor: `rgba(0, 0, 0, 0.2)`,
  },
  cursor: 'pointer',

}));

const DropDown = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: '100%',
  left: `-1px`,
  width: 'calc(100% + 2px)',
  borderBottomLeftRadius: `${props.theme.borderRadius}px`,
  borderBottomRightRadius: `${props.theme.borderRadius}px`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: Color.toCss(Color.Rgb.darken(Color.Rgb.fromHex(props.theme.backgroundColor), 0.1)),
  zIndex: -111
}));

const DropIcon = styled(FontAwesome, {
  position: 'absolute',
  width: '8px',
  right: '5px',
  top: '50%',
  transform: 'translateY(-50%)',
});

const CurrentOptionContainer = styled('div', (props: ThemeProps & { $focus?: boolean; }) => ({
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center'
}));

const OptionContainer = styled('div', (props: ThemeProps & { $selected?: boolean; $height?: string }) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  height: 'auto',
  backgroundColor: props.$selected ? `rgba(255, 255, 255, 0.1)` : undefined,
  ':hover': {
    backgroundColor: props.theme.hoverOptionBackground
  },
  ':last-child': {
    borderBottomLeftRadius: `${props.theme.borderRadius}px`,
    borderBottomRightRadius: `${props.theme.borderRadius}px`,
  },
  cursor: 'pointer',
}));

const COMBO_BOX_ROOT = document.getElementById('combo-box-root');

class ResizeableComboBox extends React.PureComponent<ResizeableComboBox.Props, ResizeableComboBox.State> {
  constructor(props: ResizeableComboBox.Props) {
    super(props);
    this.state = {
      focus: false
    };
  }

  private onFocusChange_: (focus: boolean) => void;
  public set onFocusChange(f: (focus: boolean) => void) {
    this.onFocusChange_ = f;
  }
  public get onFocusChange() {
    return this.onFocusChange_;
  }


  private onClick_ = () => {
    const nextFocus = !this.state.focus;
    this.setState({ focus: nextFocus }, () => {
      if (this.onFocusChange_) {
        this.onFocusChange_(nextFocus);
      }
    });
  };

  private onOptionClick_ = (index: number) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ focus: false }, () => {
      this.props.onSelect(index, this.props.options[index]);
    });
  };

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };

  private dropDownRef_: HTMLDivElement;
  private bindDropDownRef_ = (ref: HTMLDivElement) => {
    this.dropDownRef_ = ref;
  };

  private onResizeableComboBoxRootClick_ = (event: MouseEvent) => {
    this.setState({
      focus: false
    }, () => {
      if (this.onFocusChange_) {
        this.onFocusChange_(false);
      }
    });
  };

  componentDidMount() {
    if (this.props.innerRef) this.props.innerRef(this);
  }

  componentWillUnmount() {
    if (this.props.innerRef) this.props.innerRef(null);
  }

  render() {
    const { props, state } = this;

    const { options, index, style, className, theme, minimal, widthTweak, mainFontSize, mainWidth, mainHeight } = props;
    const { focus } = state;

    let dropDownStyle: React.CSSProperties;

    if (this.ref_ && focus) {
      const refStyle = window.getComputedStyle(this.ref_);
      const box = Rectangle.fromBoundingRect(this.ref_.getBoundingClientRect());
      dropDownStyle = {
        color: refStyle.color,
        font: refStyle.font,
        top: `${Rectangle.bottom(box)}px`,
        left: `${Rectangle.left(box) - (widthTweak ? widthTweak / 2 : 0)}px`,
        width: `${Rectangle.width(box) + (widthTweak ? widthTweak : 0)}px`,
      };
      COMBO_BOX_ROOT.style.pointerEvents = 'auto';
      COMBO_BOX_ROOT.onclick = this.onResizeableComboBoxRootClick_;
    } else if (COMBO_BOX_ROOT.onclick === this.onResizeableComboBoxRootClick_) {
      COMBO_BOX_ROOT.style.pointerEvents = 'none';
      COMBO_BOX_ROOT.onclick = undefined;
    }

    return (
      <Container ref={this.bindRef_} style={style} className={className} theme={theme} onClick={this.onClick_} $focus={focus} $minimal={minimal} $width={mainWidth} $height={mainHeight}>
        <CurrentOptionContainer theme={theme}><Text style={{ fontSize: props.mainFontSize, }} text={options[index].text} /></CurrentOptionContainer>
        <DropIcon icon={focus ? faCaretUp : faCaretDown} />
        {ReactDom.createPortal((focus && this.ref_)
          ? <DropDown theme={theme} style={dropDownStyle}>
            {options.map((option, i) => (
              <OptionContainer
                $selected={i === index}
                theme={theme}
                key={i}
                onClick={this.onOptionClick_(i)}
                $height={props.mainHeight}
              >
                <Text style={{ fontSize: props.mainFontSize, lineHeight: '1' }} text={option.text} />
              </OptionContainer>
            ))}
          </DropDown>
          : null
          , COMBO_BOX_ROOT)}
      </Container>
    );
  }
}

namespace ResizeableComboBox {
  export interface Option {
    text: AnyText;
    data?: unknown;
  }

  export const option = (text: AnyText, data?: unknown): Option => ({
    text,
    data
  });

  export interface Props extends StyleProps, ThemeProps {
    options: Option[];
    minimal?: boolean;

    innerRef?: (ref: ResizeableComboBox) => void;

    widthTweak?: number;

    index: number;
    onSelect: (index: number, option: Option) => void;
    mainWidth?: string;
    mainHeight?: string;
    mainFontSize?: string;
  }

  export interface State {
    focus: boolean;
  }
}

export default ResizeableComboBox;