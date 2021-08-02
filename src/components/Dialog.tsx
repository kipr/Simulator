import * as React from 'react';

import { Modal } from './Modal';

import { StyleProps } from '../style';

import { styled } from 'styletron-react';
import Widget, { Mode, Size } from './Widget';
import { ThemeProps } from './theme';

export interface DialogProps extends ThemeProps, StyleProps {
  name: string;
  children: React.ReactNode;

  onClose: () => void;
}

type Props = DialogProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '640px',
  maxHeight: '480px',
  color: props.theme.color,
}));

class Dialog_ extends React.PureComponent<Props> {

  private onSizeChange_ = (index: number) => {
    this.props.onClose();
  };

  render() {
    const { props } = this;
    const { className, style, children, theme, name } = props;
    return (
      <Modal>
        <Container theme={theme}>
          <Widget theme={theme} size={0} sizes={[Size.MAXIMIZED, Size.MINIMIZED]} onSizeChange={this.onSizeChange_} mode={Mode.Floating} name={name}>
            {children}
          </Widget>
        </Container>
      </Modal>
    );
  }
}

export const Dialog = styled(Dialog_, {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)'
});