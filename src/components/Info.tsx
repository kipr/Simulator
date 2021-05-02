import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';


export interface InfoProps extends StyleProps, ThemeProps {

}

interface InfoState {
  
}

type Props = InfoProps;
type State = InfoState;

const Container = styled('div', (props: ThemeProps) => ({
  flex: '1 1',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color
}));

class Info extends React.PureComponent<Props, State> {
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

export default State;