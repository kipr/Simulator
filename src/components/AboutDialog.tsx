import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Dialog } from './Dialog';
import { ThemeProps } from './theme';
import { Fa } from './Fa';

import { faCopyright } from '@fortawesome/free-solid-svg-icons';

import KIPR_LOGO_BLACK from '../assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../assets/KIPR-Logo-White-Text-Clear-Large.png';

import tr from '@i18n';

import { connect } from 'react-redux';
import { State as ReduxState } from '../state';
import LocalizedString from '../util/LocalizedString';
import { sprintf } from 'sprintf-js';
import Dict from '../Dict';

export interface AboutDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
}

interface AboutDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = AboutDialogPublicProps & AboutDialogPrivateProps;

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

class AboutDialog extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { theme, onClose, locale } = props;
    
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
      <Dialog theme={theme} name={LocalizedString.lookup(tr('About'), locale)} onClose={onClose}>
        <Container theme={theme}>
          <LogoRow>
            {logo}
          </LogoRow>
          {LocalizedString.lookup(Dict.map(tr('Version %s (%s)'), (str: string) => sprintf(str, SIMULATOR_VERSION, SIMULATOR_GIT_HASH)), locale)}
          <br /> <br />
          <Bold>{LocalizedString.lookup(tr('Copyright'), locale)} <Fa icon={faCopyright} /> 2023 <Link theme={theme} href="https://kipr.org/" target="_blank">KISS Institute for Practical Robotics</Link> {LocalizedString.lookup(tr('and External Contributors', 'Part of copyright notice, after KIPR is listed'), locale)}</Bold>
          <br /> <br />
          {LocalizedString.lookup(tr('This software is licensed under the terms of the'), locale)} <Link theme={theme} href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GNU General Public License v3</Link>.
          <br /> <br />
          {LocalizedString.lookup(tr('Thank you to the following contributors and testers:'), locale)}
          <ul>
            <li>Tim Corbly</li>
            <li>Will Hawkins</li>
            <li>Braden McDorman</li>
            <li>Zachary Sasser</li>
            <li>Jack Williams</li>
            <li>Nafis Zaman</li>
          </ul>

          {LocalizedString.lookup(tr('Want to help improve the simulator and get your name listed here?'), locale)} <br />
          {LocalizedString.lookup(tr('Visit our', 'URL link to github repository follows'), locale)} <Link theme={theme} href="https://github.com/kipr/simulator" target="_blank">{LocalizedString.lookup(tr('GitHub repository'), locale)}</Link>.
          {LocalizedString.lookup(tr('We\'re happy to help you get started!'), locale)}
        </Container>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(AboutDialog) as React.ComponentType<AboutDialogPublicProps>;