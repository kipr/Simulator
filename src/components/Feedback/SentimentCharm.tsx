import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';

export interface SentimentCharmProps extends StyleProps, ThemeProps {
  icon: string;
  // TODO: highlight on selected
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  // TODO: highlight on hover
  // onHover: (event: React.MouseEvent<HTMLDivElement>) => void;
}

type Props = SentimentCharmProps;

const Container = styled(Charm, {
  backgroundColor: charmColor(0)
});

class SentimentCharm extends React.PureComponent<Props> {
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
        <Fa icon={props.icon} />
      </Container>
    );
  }
}

export default SentimentCharm;