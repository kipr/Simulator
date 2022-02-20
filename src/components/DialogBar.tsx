import * as React from "react";
import { styled } from "styletron-react";
import { Spacer } from "./common";
import { ThemeProps, GREEN } from "./theme";

export interface DialogBarProps extends ThemeProps {
  onAccept: () => void;
}

type Props = DialogBarProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderTop: `1px solid ${props.theme.borderColor}`
}));

const Button = styled('div', (props: ThemeProps & { disabled?: boolean }) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  ':hover': !props.disabled && {
    backgroundColor: GREEN.hover
  },
  backgroundColor: props.disabled ? GREEN.disabled : GREEN.standard,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  opacity: props.disabled ? 0.5 : 1,
  transition: 'background-color 0.2s, opacity 0.2s',
  borderLeft: `1px solid ${props.theme.borderColor}`,
  ':first-child': {
    borderLeft: 'none'
  }
}));

class DialogBar extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { theme, children } = props;
    return (
      <Container theme={theme}>
        <Spacer />
        <Button theme={theme} onClick={this.props.onAccept}>
          {children}
        </Button>
      </Container>
    );
  }
}

export default DialogBar;