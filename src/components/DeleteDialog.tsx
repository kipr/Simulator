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

export interface DeleteDialogProps extends ThemeProps, StyleProps {
  name: LocalizedString;
  onClose: () => void;
  onAccept: () => void;
}

type Props = DeleteDialogProps;

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  padding: `${props.theme.itemPadding * 2}px`, 
}));

class DeleteDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { name, theme, onClose, onAccept } = props;

    return (
      <Dialog theme={theme} name={`Delete ${name[LocalizedString.EN_US]}?`} onClose={onClose}>
        <Container theme={theme}>
          Are you sure you want to delete {name[LocalizedString.EN_US] || 'this'}?
        </Container>
        <DialogBar theme={theme} onAccept={onAccept}><Fa icon={faTrash} /> Delete</DialogBar>
      </Dialog>
    );
  }
}

export default DeleteDialog;