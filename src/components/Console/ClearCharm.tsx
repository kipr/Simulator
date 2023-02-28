import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';

import tr from '@i18n';

export interface ClearCharmProps extends StyleProps, ThemeProps {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  locale: LocalizedString.Language;
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
      onClick,
      locale
    } = props;
    
    return (
      <Container theme={theme} onClick={onClick}>
        <Fa icon={faTimes} /> {LocalizedString.lookup(tr('Clear'), locale)}
      </Container>
    );
  }
}

export default ClearCharm;