import * as React from 'react';

import { ThemeProps } from "./theme";

import { Vector2 } from '../math';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';

export interface TooltipProps extends ThemeProps, StyleProps {
  position: Vector2;
  description: string;
}

interface TooltipState {

}

type Props = TooltipProps;
type State = TooltipState;

const Container = styled('div', (props: Props) => ({

}));

class Tooltip extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { theme, style, className, description } = props;
    return (
      <Container {...props} >
        {description}
      </Container>
    );
  }
}