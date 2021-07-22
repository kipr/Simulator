import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';

export interface PerfectCharmProps extends StyleProps, ThemeProps {
}

type Props = PerfectCharmProps;

const Container = styled(Charm, {
  backgroundColor: charmColor(120)
});

class PerfectCharm extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      theme
    } = props;
    
    return (
      <Container theme={theme}>
        <Fa icon='check' /> Perfect!
      </Container>
    );
  }
}

export default PerfectCharm;