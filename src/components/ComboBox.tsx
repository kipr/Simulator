import * as React from "react";
import { styled } from "styletron-react";
import { StyleProps } from "../style";
import { AnyText } from "../util";
import { Color } from "../util/Color";
import { Fa } from "./Fa";
import { Text } from "./Text";
import { ThemeProps } from "./theme";

const Container = styled('div', (props: ThemeProps & { $focus?: boolean }) => ({
  width: '100%',
  padding: `${props.theme.itemPadding * 2}px`,
  borderTopLeftRadius: `${props.theme.borderRadius}px`,
  borderTopRightRadius: `${props.theme.borderRadius}px`,
  borderBottomLeftRadius: props.$focus ? 0 : `${props.theme.borderRadius}px`,
  borderBottomRightRadius: props.$focus ? 0 : `${props.theme.borderRadius}px`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  borderTop: `1px solid ${props.theme.borderColor}`,
  borderBottom: props.$focus ? '1px solid transparent' : `1px solid ${props.theme.borderColor}`,
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

}));

const DropIcon = styled(Fa, {
  position: 'absolute',
  right: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
});

const CurrentOptionContainer = styled('div', (props: ThemeProps & { $focus?: boolean; }) => ({
  userSelect: 'none',
}));

const OptionContainer = styled('div', (props: ThemeProps & { $selected?: boolean; }) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  userSelect: 'none',
  backgroundColor: props.$selected ? `rgba(255, 255, 255, 0.2)` : undefined,
  ':hover': {
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  ':last-child': {
    borderBottomLeftRadius: `${props.theme.borderRadius}px`,
    borderBottomRightRadius: `${props.theme.borderRadius}px`,
  },
  cursor: 'pointer'
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

  render() {
    const { props, state } = this;

    const { options, index, style, className, theme } = props;
    const { focus } = state;

    return (
      <Container style={style} className={className} theme={theme} onClick={this.onClick_} $focus={focus}>
        <CurrentOptionContainer theme={theme}><Text text={options[index].text} /></CurrentOptionContainer>
        <DropIcon icon={focus ? 'caret-up' : 'caret-down'} />
        {focus && (
          <DropDown style={style} theme={theme}>
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

    index: number;
    onSelect: (index: number, option: Option) => void;
  }

  export interface State {
    focus: boolean;
  }
}

export default ComboBox;