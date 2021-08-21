import * as React from "react";
import * as ReactDom from "react-dom";
import { styled } from "styletron-react";
import { Rectangle } from "../math";
import { StyleProps } from "../style";
import { AnyText } from "../util";
import { Color } from "../util/Color";
import { Fa } from "./Fa";
import { Text } from "./Text";
import { ThemeProps } from "./theme";

const Container = styled('div', (props: ThemeProps & { $focus?: boolean; $minimal?: boolean; }) => ({
  width: !props.$minimal ? '100%' : undefined,
  minWidth: '120px',
  padding: `${props.theme.itemPadding * 2}px`,
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
  cursor: 'pointer'
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
  zIndex: 3
}));

const DropIcon = styled(Fa, {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
});

const CurrentOptionContainer = styled('div', (props: ThemeProps & { $focus?: boolean; }) => ({
  userSelect: 'none',
}));

const OptionContainer = styled('div', (props: ThemeProps & { $selected?: boolean; }) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  userSelect: 'none',
  backgroundColor: props.$selected ? `rgba(255, 255, 255, 0.1)` : undefined,
  ':hover': {
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  ':last-child': {
    borderBottomLeftRadius: `${props.theme.borderRadius}px`,
    borderBottomRightRadius: `${props.theme.borderRadius}px`,
  },
  cursor: 'pointer',
}));

const COMBO_BOX_ROOT = document.getElementById('combo-box-root');

class ComboBox extends React.PureComponent<ComboBox.Props, ComboBox.State> {
  constructor(props: ComboBox.Props) {
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

  private onComboBoxRootClick_ = (event: MouseEvent) => {
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

    const { options, index, style, className, theme, minimal, widthTweak } = props;
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
      COMBO_BOX_ROOT.onclick = this.onComboBoxRootClick_;
    } else {
      COMBO_BOX_ROOT.style.pointerEvents = 'none';
      COMBO_BOX_ROOT.onclick = undefined;
    }

    return (
      <Container ref={this.bindRef_} style={style} className={className} theme={theme} onClick={this.onClick_} $focus={focus} $minimal={minimal}>
        <CurrentOptionContainer theme={theme}><Text text={options[index].text} /></CurrentOptionContainer>
        <DropIcon icon={focus ? 'caret-up' : 'caret-down'} />
        {ReactDom.createPortal((focus && this.ref_)
          ? <DropDown theme={theme} style={dropDownStyle}>
            {options.map((option, i) => (
              <OptionContainer
                $selected={i === index}
                theme={theme}
                key={i}
                onClick={this.onOptionClick_(i)}
              >
                <Text text={option.text} />
              </OptionContainer>
            ))}
          </DropDown>
          : null
        , COMBO_BOX_ROOT)}
      </Container>
    );
  }
}

namespace ComboBox {
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

    innerRef?: (ref: ComboBox) => void;

    widthTweak?: number;

    index: number;
    onSelect: (index: number, option: Option) => void;
  }

  export interface State {
    focus: boolean;
  }
}

export default ComboBox;