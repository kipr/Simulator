import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';
import { Fa } from './Fa';
import Scene from '../state/State/Scene';
import SceneSettings from './SceneSettings';
import DialogBar from './DialogBar';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../util/LocalizedString';

import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../state';
import Dict from '../Dict';
import { sprintf } from 'sprintf-js';

export interface DeleteDialogPublicProps extends ThemeProps, StyleProps {
  name: LocalizedString;
  onClose: () => void;
  onAccept: () => void;
}

interface DeleteDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = DeleteDialogPublicProps & DeleteDialogPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  padding: `${props.theme.itemPadding * 2}px`, 
}));

class DeleteDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { name, theme, onClose, onAccept, locale } = props;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(Dict.map(tr('Delete %s?'), (str: string) => sprintf(str, LocalizedString.lookup(name, locale))), locale)}
        onClose={onClose}
      >
        <Container theme={theme}>
          {LocalizedString.lookup(Dict.map(tr('Are you sure you want to delete %s?'), (str: string) => sprintf(str, LocalizedString.lookup(name, locale))), locale)}
        </Container>
        <DialogBar theme={theme} onAccept={onAccept}><Fa icon={faTrash} /> {LocalizedString.lookup(tr('Delete'), locale)}</DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(DeleteDialog) as React.ComponentType<DeleteDialogPublicProps>;