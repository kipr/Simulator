import * as React from 'react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';

export interface SettingsDialogProp extends ThemeProps, StyleProps {
  onClose: () => void;
}

type Props = SettingsDialogProp;

export class SettingsDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { style, className, theme, onClose } = props;
    return (
      <Dialog theme={theme} name='Settings' onClose={onClose}>
        ASd
      </Dialog>
    );
  }
}