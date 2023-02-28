import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';

import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';

import tr from '@i18n';

export interface ErrorCharmProps extends StyleProps, ThemeProps {
  count: number;

  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  locale: LocalizedString.Language;
}

type Props = ErrorCharmProps;

const Container = styled(Charm, {
  backgroundColor: charmColor(0)
});

class ErrorCharm extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const {
      theme,
      count,
      onClick,
      locale
    } = props;
    
    return (
      <Container theme={theme} onClick={onClick}>
        <Fa icon={faTimesCircle} /> {count} {LocalizedString.lookup(tr('Error(s)'), locale)}
      </Container>
    );
  }
}

export default ErrorCharm;