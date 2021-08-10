import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';
import { Fa } from './Fa';

import KIPR_LOGO_BLACK from '../assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../assets/KIPR-Logo-White-Text-Clear-Large.png';

export interface AboutDialogProps extends ThemeProps, StyleProps {
  onClose: () => void;
}

type Props = AboutDialogProps;

const Logo = styled('img', {
  width: '150px',
  height: 'auto',
});

const LogoContainer = styled('div', {
  flex: '1 1'
});

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

export class AboutDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { theme, onClose } = props;
    
    let logo: JSX.Element;

    switch (theme.foreground) {
      case 'black': {
        logo = <Logo src={KIPR_LOGO_WHITE as string} />;
        break;
      }
      case 'white': {
        logo = <Logo src={KIPR_LOGO_BLACK as string} />;
        break;
      }
    }
    
    return (
      <Dialog theme={theme} name='About' onClose={onClose}>
        <Container theme={theme}>
          <LogoRow>
            {logo}
          </LogoRow>
          Version {SIMULATOR_VERSION} ({SIMULATOR_GIT_HASH})
          <br /> <br />
          <Bold>Copyright <Fa icon='copyright' /> 2021 <Link theme={theme} href="https://kipr.org/" target="_blank">KISS Institute for Practical Robotics</Link> and External Contributors</Bold>
          <br /> <br />
          This software is licensed under the terms of the <Link theme={theme} href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GNU General Public License v3</Link>.
          <br /> <br />
          Thank you to the following contributors and testers:
          <ul>
            <li>Tim Corbly</li>
            <li>Will Hawkins</li>
            <li>Braden McDorman</li>
            <li>Zachary Sasser</li>
            <li>Nafis Zaman</li>
          </ul>

          Want to help improve the simulator and get your name listed here? <br />
          Visit our <Link theme={theme} href="https://github.com/kipr/simulator" target="_blank">GitHub repository</Link>.
          We're happy to help you get started!
        </Container>
      </Dialog>
    );
  }
}