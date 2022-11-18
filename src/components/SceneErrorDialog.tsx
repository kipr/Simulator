import * as React from 'react';
import { styled } from 'styletron-react';
import Async from '../state/State/Async';
import { Dialog } from './Dialog';
import DialogBar from './DialogBar';
import { ThemeProps } from './theme';

interface SceneErrorDialogProps extends ThemeProps {
  error: Async.Error;

  onClose: () => void;
}

type Props = SceneErrorDialogProps;

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
    const { error, onClose, theme } = props;
    return (
      <Dialog theme={theme} name={`Error ${error.code}`} onClose={onClose}>
        <Container theme={theme}>
          <Message theme={theme}>
            {error.message}
          </Message>

          <Message theme={theme}>
            Closing this dialog will take you back to the last well-known state.
            If this error persists, please submit feedback.
          </Message>
        </Container>
      </Dialog>
    );
  }
}

export default SceneErrorDialog;