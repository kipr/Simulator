import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';


export interface ConsoleProps extends StyleProps, ThemeProps {

}

interface ConsoleState {
  
}

type Props = ConsoleProps;
type State = ConsoleState;

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

class Console extends React.PureComponent<Props, State> {
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

export default Console;