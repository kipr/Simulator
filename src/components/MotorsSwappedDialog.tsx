import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { State } from '../state';

import { StyleProps } from "../style";
import { Dialog } from './Dialog';
import { Theme, ThemeProps } from "./theme";


export interface MotorsSwappedDialogProps extends StyleProps {
  theme: Theme;
  onClose: () => void;
}

const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  padding: `${$theme.itemPadding * 2}px`,
}));

export default ({ style, className, theme, onClose }: MotorsSwappedDialogProps): JSX.Element => (
  <Dialog name="Notice: Motor Ports Changed" onClose={onClose} theme={theme}>
    <Container style={style} className={className} $theme={theme}>
      Motor 0 is now the Demobot's right wheel. <br /> <br />
      Motor 3 is now the Demobot's left wheel. <br /> <br />
      If you have an existing program using motors, you should swap motor ports 0 and 3. <br /> <br />
      This notice will not appear again.
    </Container>
  </Dialog>
);