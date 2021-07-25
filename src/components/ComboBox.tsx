import * as React from "react";
import { styled } from "styletron-react";
import { StyleProps } from "../style";
import { AnyText } from "../util";
import { Color } from "../util/Color";
import { Fa } from "./Fa";
import { Text } from "./Text";
import { DARK, ThemeProps } from "./theme";

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

console.log(Color.toCss(Color.Rgb.fromHex(DARK.backgroundColor)));

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

class ComboBox extends React.PureComponent<ComboBox.Props, ComboBox.State> {
  constructor(props: ComboBox.Props) {
    super(props);
    this.state = {
      focus: false
    };
  }

  private onClick_ = () => this.setState({ focus: !this.state.focus });

  private onOptionClick_ = (index: number) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    this.setState({ focus: false }, () => {
      this.props.onSelect(index, this.props.options[index]);
    });
  };

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };

  render() {
    const { props, state } = this;

    const { options, index, style, className, theme, minimal } = props;
    const { focus } = state;


      

    return (
      <Container ref={this.bindRef_} style={style} className={className} theme={theme} onClick={this.onClick_} $focus={focus} $minimal={minimal}>
        <CurrentOptionContainer theme={theme}><Text text={options[index].text} /></CurrentOptionContainer>
        <DropIcon icon={focus ? 'caret-up' : 'caret-down'} />
        {focus && (
          <DropDown theme={theme}>
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
        )}
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

    index: number;
    onSelect: (index: number, option: Option) => void;
  }

  export interface State {
    focus: boolean;
  }
}

export default ComboBox;