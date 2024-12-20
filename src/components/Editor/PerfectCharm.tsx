import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import Charm from '../Charm';
import { FontAwesome } from '../FontAwesome';
import { ThemeProps } from '../constants/theme';
import { charmColor } from '../constants/charm-util';

import { faCheck } from '@fortawesome/free-solid-svg-icons';

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
        <FontAwesome icon={faCheck} /> Perfect!
      </Container>
    );
  }
}

export default PerfectCharm;