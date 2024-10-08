import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import Charm from '../Charm';
import { FontAwesome } from '../FontAwesome';
import { ThemeProps } from '../constants/theme';

import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface SentimentCharmProps extends StyleProps, ThemeProps {
  icon: IconProp;
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface SentimentProps {
  selected?: boolean;
}

type Props = SentimentCharmProps;

const Container = styled(Charm, (props: SentimentProps) => ({
  border: 'none',
  fontSize: '3em',
  opacity: `${props.selected ? 1.0 : 0.5}`,
  ':hover': !props.selected ? {
    opacity: 0.8
  } : {},
}));

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
      <Container theme={theme} onClick={onClick} selected={props.selected}>
        <FontAwesome icon={props.icon} />
      </Container>
    );
  }
}

export default SentimentCharm;