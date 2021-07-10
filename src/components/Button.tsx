import { ThemeProps } from './theme';

import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';

export interface ButtonProps extends StyleProps, ThemeProps {
  children: React.ReactNode;

  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface ButtonState {

}

type Props = ButtonProps;
type State = ButtonState;

const Container = styled('div', (props: ThemeProps) => ({
  borderRadius: `${props.theme.itemPadding}px`,
  paddingTop: `${props.theme.itemPadding / 2}px`,
  paddingBottom: `${props.theme.itemPadding / 2}px`,
  paddingLeft: `${props.theme.itemPadding}px`,
  paddingRight: `${props.theme.itemPadding}px`,
  ':first-child': {
    paddingLeft: 0
  },
  ':last-child': {
    paddingRight: 0
  },
  userSelect: 'none',
  ':hover': {
    backgroundColor: props.theme.lighten(0.1),
  },
  transition: 'background-color 0.2s',
  cursor: 'pointer'
}));

export class Button extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { style, className, theme, children, onClick } = props;
    return (
      <Container style={style} className={className} theme={theme} onClick={onClick}>
        {children}
      </Container>
    );
  }
}

export default Button;