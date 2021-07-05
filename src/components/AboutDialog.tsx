import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';

const KIPR_LOGO_BLACK = require('../assets/KIPR-Logo-Black-Text-Clear-Large.png');
const KIPR_LOGO_WHITE = require('../assets/KIPR-Logo-White-Text-Clear-Large.png');

export interface AboutDialogProps extends ThemeProps, StyleProps {
  onClose: () => void;
}

type Props = AboutDialogProps;

const Logo = styled('img', {
  width: '200px',
  height: 'auto'
});

export class AboutDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { theme, onClose } = props;
    
    let logo: JSX.Element;

    switch (theme.foreground) {
      case 'black': {
        logo = <Logo src={KIPR_LOGO_BLACK} />;
        break;
      }
      case 'white': {
        logo = <Logo src={KIPR_LOGO_WHITE} />;
        break;
      }
    }
    
    return (
      <Dialog theme={theme} name='About' onClose={onClose}>
        {logo}
      </Dialog>
    );
  }
}