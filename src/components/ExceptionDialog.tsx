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

class ExceptionDialog extends React.PureComponent<Props> {
  render() {
    const { error, theme, onClose, info } = this.props;
    return (
      <Dialog name={`Internal Error: ${error.name}`} theme={theme} onClose={onClose}>
        <Container theme={theme}>
          <div>{error.message}</div>
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