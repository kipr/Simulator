import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';

import { DARK, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { State } from '../state';

import tr from '@i18n';
import { WithNavigateProps, withNavigate } from '../util/withNavigate';
import { DEFAULT_SCENE } from '../components/constants/defaultScene';
import TourDoc, { getTourSteps, TourStep } from '../tours/Tours';
import { fetchTourIfNeeded, completeTour, retakeTour } from '../state/reducer/tours';
import { TourRegistry } from '../tours/TourRegistry';
import { GuidedTour } from '../components/Tours/GuidedTour';
import TourTarget from '../components/Tours/TourTarget';

export interface DashboardPublicProps extends ThemeProps, StyleProps {
}

interface DashboardPrivateProps {

  locale: LocalizedString.Language;
  uid: string;
  tour: TourDoc;
  tourLoaded: boolean;
  tourLoading: boolean;
  tourError: string | null;
}

type Props = DashboardPublicProps & DashboardPrivateProps & WithNavigateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100vh',
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
  alignItems: 'flex-start',
  alignContent: 'flex-start',
  paddingLeft: cardContainerMargin(),
  paddingRight: cardContainerMargin(),
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  height: 'calc(100vh - 48px)',
  overflowY: 'auto',
  overflowX: 'hidden',
}));
class Dashboard extends React.PureComponent<Props> {
  private onAboutClick_ = (event: React.MouseEvent) => {
    window.location.href = 'https://www.kipr.org/kipr/about-kipr';
  };

  private registry = new TourRegistry();
  private scrollRef: HTMLDivElement | null = null;


  async componentDidMount() {
    const { uid } = this.props;
    if (uid) {
      await fetchTourIfNeeded(this.props.uid, TourDoc.IDS.DASHBOARD);
    }
  }

  private onCloseTour_ = () => {
    void completeTour(this.props.tour, this.props.uid, TourDoc.IDS.DASHBOARD);
  };

  private onSkipTour_ = () => {
    void completeTour(this.props.tour, this.props.uid, TourDoc.IDS.DASHBOARD, { dismissed: true });
  };
  private onRetakeTour_ = () => {
    void retakeTour(this.props.tour, this.props.uid, TourDoc.IDS.DASHBOARD);
  };
  render() {
    const { props } = this;
    const { className, style, locale, tour } = props;
    const theme = DARK;
    const dashboardTourSteps: TourStep[] = getTourSteps(TourDoc.IDS.DASHBOARD);
    const showTour = props.tourLoaded && !tour.completed;

    return (
      <Container className={className} style={style} theme={theme}>
        <MainMenu theme={theme} style={style} tourRegistry={this.registry} onRetakeTour={this.onRetakeTour_} />
        <CardContainer theme={theme} ref={(n: HTMLDivElement | null) => { this.scrollRef = n; }}>

          <TourTarget registry={this.registry} targetKey='tutorial-card' style={style}>
            <Card
              theme={theme}
              title={LocalizedString.lookup(tr('Tutorials'), locale)}
              description={LocalizedString.lookup(tr('Learn how to get started with the simulator'), locale)}
              backgroundColor={'#6c6ca1'}
              backgroundImage={'url(../../static/icons/Laptop_Icon_Sunscreen.png)'}
              onClick={() => this.props.navigate('/tutorials')}
            />
          </TourTarget>


          <TourTarget registry={this.registry} targetKey='simulator-card' style={style}>
            <Card
              theme={theme}
              title={LocalizedString.lookup(tr('3D Simulator'), locale)}
              description={LocalizedString.lookup(tr('A simulator for the Botball demobot.'), locale)}
              backgroundImage={'url(../../static/example_images/Simulator-Robot-Closeup.png)'}
              backgroundPosition={'center top'}
              onClick={() => this.props.navigate(DEFAULT_SCENE)}
            />
          </TourTarget>

          <TourTarget registry={this.registry} targetKey='classrooms-card' style={style}>
            <Card
              theme={theme}
              title={LocalizedString.lookup(tr('Classrooms'), locale)}
              description={LocalizedString.lookup(tr('See the current classrooms.'), locale)}
              backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/example_images/classroom-botguy.png)'}
              backgroundColor={'#3b3c3c'}
              onClick={() => this.props.navigate('/classrooms')}
            />
          </TourTarget>
          <TourTarget registry={this.registry} targetKey='limited-challenges-card' style={style}>
            <Card
              theme={theme}
              title={LocalizedString.lookup(tr('Limited Challenges'), locale)}
              description={LocalizedString.lookup(tr('Challenges with time limits and attempt restrictions.'), locale)}
              backgroundImage={'url(../../static/example_images/Simulator-Robot-Closeup.png)'}
              backgroundPosition={'center top'}
              onClick={() => this.props.navigate('/limited-challenges')}
            />
          </TourTarget>
          <TourTarget registry={this.registry} targetKey='leaderboard-card' style={style}>
            <Card
              theme={theme}
              title={LocalizedString.lookup(tr('Leaderboard'), locale)}
              description={LocalizedString.lookup(tr('See the current challenge leaderboard.'), locale)}
              backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/example_images/Gold_Medal_Robot.png)'}
              backgroundColor={'#3b3c3c'}
              onClick={() => this.props.navigate('/leaderboard')}
            />
          </TourTarget>
          <TourTarget registry={this.registry} targetKey='about-card' style={style}>
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
          </TourTarget>

          {showTour && (
            <GuidedTour
              isOpen={showTour}
              steps={dashboardTourSteps}
              registry={this.registry}
              scrollContainer={this.scrollRef}
              onClose={this.onCloseTour_}
              onSkip={this.onSkipTour_}
              theme={theme} />
          )}


        </CardContainer>
      </Container>
    );
  }
}

const Connected = connect((state: State) => ({
  uid: state.users.me,
  locale: state.i18n.locale,
  tour: state.tours.byId[TourDoc.IDS.DASHBOARD] ?? TourDoc.DEFAULT,
  tourLoaded: !!state.tours.loaded[TourDoc.IDS.DASHBOARD],
  tourLoading: !!state.tours.loading[TourDoc.IDS.DASHBOARD],
  tourError: state.tours.error[TourDoc.IDS.DASHBOARD],
}))(withNavigate(Dashboard));

export default Connected as React.ComponentType<DashboardPublicProps>;
