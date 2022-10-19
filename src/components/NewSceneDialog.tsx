import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';
import { Fa } from './Fa';

import { faCopyright } from '@fortawesome/free-solid-svg-icons';

export interface AboutDialogProps extends ThemeProps, StyleProps {
  onClose: () => void;
}

type Props = AboutDialogProps;

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  padding: `${props.theme.itemPadding * 2}px`, 
}));

const Bold = styled('span', {
  fontWeight: 400
});

const Link = styled('a', (props: ThemeProps) => ({
  color: props.theme.color,
}));

const LogoRow = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '10px',
  alignItems: 'center',
});

const CopyrightContainer = styled('div', {
  flex: '1 1'
});

class NewSceneDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { theme, onClose } = props;

    return (
      <Dialog theme={theme} name='About' onClose={onClose}>
        <Container theme={theme}>
          
        </Container>
      </Dialog>
    );
  }
}