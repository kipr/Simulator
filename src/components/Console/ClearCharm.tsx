import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';

export interface ClearCharmProps extends StyleProps, ThemeProps {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

type Props = ClearCharmProps;

const Container = styled(Charm, {
  backgroundColor: charmColor(0)
});

class ClearCharm extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      theme,
      onClick
    } = props;
    
    return (
      <Container theme={theme} onClick={onClick}>
        <Fa icon='times' /> Clear
      </Container>
    );
  }
}

export default ClearCharm;