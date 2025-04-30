import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { styled } from 'styletron-react';

import { DARK, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { GetBrowserLang } from '../util/GetLang';
import { State } from '../state';

import tr from '@i18n';


export interface DashboardPublicProps extends RouteComponentProps, ThemeProps, StyleProps {
}

interface DashboardPrivateProps {
  onTutorialsClick: () => void;
  onSimulatorClick: () => void;
  onLeaderboardClick: () => void;
  locale: LocalizedString.Language;
}

type Props = DashboardPublicProps & DashboardPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100vh',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const cardContainerMargin = () => {
  const windowWidth = window.innerWidth;

  const maxMargin = (windowWidth - (windowWidth * 0.8)) / 2;
  const minMargin = 40;

  return `${maxMargin > minMargin ? maxMargin : minMargin}px`;
};

const CardContainer = styled('div', (props: ThemeProps) => ({
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  justifyContent: 'center',
  paddingLeft: cardContainerMargin(),
  paddingRight: cardContainerMargin(),
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  height: 'calc(100vh - 48px)',
}));


class Dashboard extends React.PureComponent<Props> {
  private onAboutClick_ = (event: React.MouseEvent) => {
    window.location.href = 'https://www.kipr.org/kipr/about-kipr';
  };

  render() {
    const { props } = this;
    const { className, style, onTutorialsClick, onSimulatorClick, onLeaderboardClick, locale } = props;
    const theme = DARK;

    return (
      <Container className={className} style={style} theme={theme}>
        <MainMenu theme={theme} />
        <CardContainer theme={theme}>
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('Tutorials'), locale)}
            description={LocalizedString.lookup(tr('Learn how to get started with the simulator'), locale)}
            backgroundColor={'#6c6ca1'}
            backgroundImage={'url(../../static/icons/Laptop_Icon_Sunscreen.png)'}
            onClick={onTutorialsClick}
          />
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('3D Simulator'), locale)}
            description={LocalizedString.lookup(tr('A simulator for the Botball demobot.'), locale)}
            backgroundImage={'url(../../static/example_images/Simulator-Robot-Closeup.png)'}
            backgroundPosition={'center top'}
            onClick={onSimulatorClick}
          />
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('About'), locale)}
            description={LocalizedString.lookup(tr('KIPR is a 501(c) 3 organization started to make the long-term educational benefits of robotics accessible to students.'), locale)}
            backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/icons/Botguy-Picture-Small.png)'}
            backgroundColor={'#3b3c3c'}
            backgroundSize={'80%'}
            hoverBackgroundSize={'95%'}
            onClick={this.onAboutClick_}
          />
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('Leaderboard'), locale)}
            description={LocalizedString.lookup(tr('See the current challenge leaderboard.'), locale)}
            backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/example_images/Gold_Medal_Robot.png)'}
            backgroundColor={'#3b3c3c'}
            onClick={onLeaderboardClick}
          />
        </CardContainer>
      </Container>
    );
  }
}

export default connect((state: State) => ({
  locale: GetBrowserLang(),
}), dispatch => ({
  onTutorialsClick: () => dispatch(push('/tutorials')),
  onLeaderboardClick: () => dispatch(push('/leaderboard')),
  onSimulatorClick: () => dispatch(push('/scene/jbcSandboxA')),
}))(Dashboard) as React.ComponentType<DashboardPublicProps>;
