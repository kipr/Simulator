import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';


export interface WorldProps extends StyleProps, ThemeProps {

}

interface WorldState {
  
}

type Props = WorldProps;
type State = WorldState;

const Container = styled('textarea', (props: ThemeProps) => ({
  flex: '1 1',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  resize: 'none',
  border: 'none',
  ':focus': {
    outline: 'none'
  }
}));

class World extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { style, className, theme } = this.props;
    return (
      <Container theme={theme} style={style} className={className}>
        
      </Container>
    );
  }
}

export default World;