import * as React from 'react';

import { Modal } from './Modal';

import { StyleProps } from '../style';

import { styled } from 'styletron-react';

export interface DialogProps extends StyleProps {
  children: any;
}

type Props = DialogProps;

class Dialog_ extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { className, style, children } = props;
    return (
      <Modal>
        <div className={className} style={style}>
          {children}
        </div>
      </Modal>
    )
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