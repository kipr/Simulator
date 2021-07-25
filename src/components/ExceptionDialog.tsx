import * as React from "react";
import { styled } from "styletron-react";
import { Dialog } from "./Dialog";
import { ThemeProps } from "./theme";

export interface ExceptionDialogProps extends ThemeProps {
  error: Error;
  info?: React.ErrorInfo;

  onClose: () => void;
}

type Props = ExceptionDialogProps;

const Container = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`
}));

const Message = styled('div', (props: ThemeProps) => ({
  fontWeight: 400,
  fontSize: '16px',
}));

const Stack = styled('div', (props: ThemeProps) => ({
  fontSize: '12px',
  fontFamily: 'monospace',
  marginTop: `${props.theme.itemPadding * 2}px`,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  padding: `${props.theme.itemPadding * 2}px`,
  borderRadius: `${props.theme.itemPadding * 2}px`
}));

const StackRow = styled('div', (props: ThemeProps) => ({
  marginLeft: `${props.theme.itemPadding * 2}px`,
  ':first-child': {
    marginLeft: 0,
  },
}));

class ExceptionDialog extends React.PureComponent<Props> {
  render() {
    const { error, theme, onClose, info } = this.props;
    return (
      <Dialog name={`Internal Error: ${error.name}`} theme={theme} onClose={onClose}>
        <Container theme={theme}>
          <Message theme={theme}>{error.message}</Message>
          {error.stack ? <Stack theme={theme}>{error.stack.split('\n').map((s, i) => <StackRow theme={theme} key={i}>{s}</StackRow>)}</Stack> : undefined}
          {info && (
            <div>
              <div>The error occurred in the following component:</div>
              <div>{info.componentStack}</div>
            </div>
          )}

        </Container>
      </Dialog>
    );
  }
}

export default ExceptionDialog;