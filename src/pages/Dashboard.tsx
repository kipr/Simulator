import * as React from 'react';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { Card } from '../components/Card';
import MainMenu from '../components/MainMenu';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import tr from '@i18n';
import LocalizedString from '../util/LocalizedString';
import { State } from '../state';


export interface DashboardPublicProps extends RouteComponentProps, ThemeProps, StyleProps {

}

interface DashboardPrivateProps {
  onTutorialsClick: () => void;
  onSimulatorClick: () => void;
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
    const { className, style, onTutorialsClick, onSimulatorClick, locale } = props;
    const theme = DARK;

    return (
      <Container className={className} style={style} theme={theme}>
        <MainMenu theme={theme}/>
        <CardContainer theme={theme}>
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('Tutorials'), locale)}
            description={LocalizedString.lookup(tr('Learn how to get started with the simulator'), locale)}
            backgroundColor={'#6c6ca1'}
            backgroundImage={'url(../../static/Laptop_Icon_Sunscreen.png)'}
            onClick={onTutorialsClick}
          />
          <Card 
            theme={theme}
            title={LocalizedString.lookup(tr('3D Simulator'), locale)}
            description={LocalizedString.lookup(tr('A simulator for the Botball demobot.'), locale)}
            backgroundImage={'url(../../static/Simulator-Robot-Closeup.png)'}
            backgroundPosition={'center top'}
            onClick={onSimulatorClick}
          />
          <Card
            theme={theme}
            title={LocalizedString.lookup(tr('About'), locale)}
            description={LocalizedString.lookup(tr('KIPR is a 501(c) 3 organization started to make the long-term educational benefits of robotics accessible to students.'), locale)}
            backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/Botguy-Picture-Small.png)'}
            backgroundColor={'#3b3c3c'}
            backgroundSize={'80%'}
            hoverBackgroundSize={'95%'}
            onClick={this.onAboutClick_}
          />
        </CardContainer>
      </Container>
    );
  }
}

export default connect((state: State) => ({
  locale: state.i18n.locale,
}), dispatch => ({
  onTutorialsClick: () => dispatch(push('/tutorials')),
  onSimulatorClick: () => dispatch(push('/scene/jbcSandboxA')),
}))(Dashboard) as React.ComponentType<DashboardPublicProps>;