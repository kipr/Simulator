import { Theme, ThemeProps } from './theme';

import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';

export interface ButtonProps extends StyleProps, ThemeProps {
  children: React.ReactNode;

  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

interface ButtonState {

}

type Props = ButtonProps;
type State = ButtonState;

const Container = styled('div', ({ $disabled, $theme }: { $disabled: boolean; $theme: Theme; }) => ({
  borderRadius: `${$theme.itemPadding}px`,
  paddingTop: `${$theme.itemPadding / 2}px`,
  paddingBottom: `${$theme.itemPadding / 2}px`,
  paddingLeft: `${$theme.itemPadding}px`,
  paddingRight: `${$theme.itemPadding}px`,
  ':first-child': {
    paddingLeft: 0
  },
  ':last-child': {
    paddingRight: 0
  },
  userSelect: 'none',
  ':hover': {
    backgroundColor: $theme.lighten(0.1),
  },
  transition: 'background-color 0.2s',
  cursor: !$disabled ? 'pointer' : 'default',
  opacity: $disabled ? 0.5 : 1,
}));

export class Button extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      style,
      className,
      theme,
      children,
      onClick,
      disabled
    } = props;
    return (
      <Container
        style={style}
        className={className}
        $theme={theme}
        $disabled={disabled}
        onClick={!disabled ? onClick : undefined}
      >
        {children}
      </Container>
    );
  }
}

export default Button;