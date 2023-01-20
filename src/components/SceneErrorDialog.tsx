import * as React from 'react';
import { styled } from 'styletron-react';
import Async from '../state/State/Async';
import { Dialog } from './Dialog';
import DialogBar from './DialogBar';
import { ThemeProps } from './theme';

import tr from '@i18n';
import LocalizedString from '../util/LocalizedString';

import { connect } from 'react-redux';
import { State as ReduxState } from '../state';
import Dict from '../Dict';
import { sprintf } from 'sprintf-js';

interface SceneErrorDialogPublicProps extends ThemeProps {
  error: Async.Error;

  onClose: () => void;
}

interface SceneErrorDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = SceneErrorDialogPublicProps & SceneErrorDialogPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
}));

const Message = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  fontWeight: 400,
  fontSize: '16px',
}));

class SceneErrorDialog extends React.Component<Props> {
  render() {
    const { props } = this;
    const { error, onClose, theme, locale } = props;
    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(Dict.map(tr('Error %d'), (str: string) => sprintf(str, error.code)), locale)}
        onClose={onClose}
      >
        <Container theme={theme}>
          <Message theme={theme}>
            {error.message}
          </Message>

          <Message theme={theme}>
            {LocalizedString.lookup(tr('Closing this dialog will take you back to the last well-known state.'), locale)}
            {LocalizedString.lookup(tr('If this error persists, please submit feedback.'), locale)}
          </Message>
        </Container>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(SceneErrorDialog) as React.ComponentType<SceneErrorDialogPublicProps>;