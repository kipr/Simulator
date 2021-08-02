import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';

export interface WarningCharmProps extends StyleProps, ThemeProps {
  count: number;

  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

type Props = WarningCharmProps;

const Container = styled(Charm, {
  backgroundColor: charmColor(60)
});

class WarningCharm extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      theme,
      count,
      onClick
    } = props;
    
    return (
      <Container theme={theme} onClick={onClick}>
        <Fa icon='exclamation-triangle' /> {count} Warning{count === 1 ? '' : 's'}
      </Container>
    );
  }
}

export default WarningCharm;