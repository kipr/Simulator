import * as React from 'react';
import { connect } from 'react-redux';
import { styled } from 'styletron-react';
import { DARK, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import tr from '@i18n';
import { WithNavigateProps, withNavigate } from '../util/withNavigate';
import db from '../db';
import { State as ReduxState } from '../state';
import User from 'state/State/User';
import { TourTarget } from '../components/Tours/TourTarget';
import { TourRegistry } from '../tours/TourRegistry';
import { completeTour, fetchTourIfNeeded, retakeTour } from '../state/reducer/tours';
import TourDoc, { getTourSteps, TourStep } from '../tours/Tours';
import { GuidedTour } from '../components/Tours/GuidedTour';

export interface ClassroomsDashboardPublicProps extends ThemeProps, StyleProps {
}

interface ClassroomsDashboardPrivateProps {
  locale: LocalizedString.Language;
  uid: string;
  tour: TourDoc;
  tourLoaded: boolean;
  tourLoading: boolean;
  tourError: string | null;
}

interface ClassroomsDashboardState {
  userId: string;
  showTour: boolean;
}

type Props = ClassroomsDashboardPublicProps & ClassroomsDashboardPrivateProps & WithNavigateProps;
type State = ClassroomsDashboardState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  //justifyContent: 'center',
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
  gap: '7em',
  paddingTop: cardContainerMargin(),
  paddingBottom: `calc(${cardContainerMargin()} + 50px)`,
  backgroundColor: props.theme.backgroundColor,
  width: `calc(100vw - 210px)`,
  //minHeight: 'calc(100vh - 210px)',
  marginTop: '5em',
}));


class ClassroomsDashboard extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      userId: '',
      showTour: false,
    };
  }
  private registry = new TourRegistry();
  private scrollRef: HTMLDivElement | null = null;

  async componentDidMount() {
    const { uid } = this.props;
    if (uid) {
      await fetchTourIfNeeded(this.props.uid, TourDoc.IDS.CLASSROOM);
    }
    this.getCurrentUser();
  }
  private getCurrentUser() {
    let currentUser: User;
    const tokenManager = db.tokenManager;
    if (tokenManager) {
      const auth_ = tokenManager.auth();
      const currentUserAuth_ = auth_.currentUser;
      currentUser = { name: currentUserAuth_.uid };

      this.setState({ userId: currentUser['name'] });

    }

    return currentUser || null;
  }

  private onCloseTour_ = () => {
    completeTour(this.props.tour, this.props.uid, TourDoc.IDS.CLASSROOM);
    this.setState({ showTour: false });
  }

  private onSkipTour_ = () => {
    completeTour(this.props.tour, this.props.uid, TourDoc.IDS.CLASSROOM, { dismissed: true });
    this.setState({ showTour: false });
  }

  private onRetakeTour_ = () => {
    console.log("triggered retake classroom tour");
    retakeTour(this.props.tour, this.props.uid, TourDoc.IDS.CLASSROOM);
    this.setState({ showTour: true });
  }
  render() {
    const { props } = this;
    const { userId } = this.state;
    const { className, style, locale } = props;
    const theme = DARK;
    const showTour = props.tourLoaded && !props.tour.completed;
    //const showTour = false;
    const classroomTourSteps: TourStep[] = getTourSteps(TourDoc.IDS.CLASSROOM);
    return (
      <Container className={className} style={style} theme={theme}>
        <MainMenu theme={theme} onRetakeTour={this.onRetakeTour_} />
        <TourTarget registry={this.registry} targetKey='classroom-overview' style={style}>
          <CardContainer theme={theme}>

            <TourTarget registry={this.registry} targetKey='student-card' style={style}>
              <Card
                theme={theme}
                title={LocalizedString.lookup(tr('Student View'), locale)}
                description={LocalizedString.lookup(tr('See the classroom you are in.'), locale)}
                backgroundColor={'#6c6ca1'}
                backgroundImage={'url(../../static/icons/Laptop_Icon_Sunscreen.png)'}
                onClick={() => this.props.navigate(`/classrooms/${userId}/studentView`)}

              />
            </TourTarget>
            <TourTarget registry={this.registry} targetKey='teacher-card' style={style}>
              <Card
                theme={theme}
                title={LocalizedString.lookup(tr('Teacher View'), locale)}
                description={LocalizedString.lookup(tr('See and manage all the classrooms you own.'), locale)}
                backgroundImage={'url(../../static/example_images/Simulator-Robot-Closeup.png)'}
                backgroundPosition={'center top'}
                onClick={() => this.props.navigate(`/classrooms/${userId}/teacherView`)}
              />
            </TourTarget>
          </CardContainer>
        </TourTarget>
        {showTour && (
          <GuidedTour
            isOpen={showTour}
            steps={classroomTourSteps}
            registry={this.registry}
            scrollContainer={this.scrollRef}
            onClose={this.onCloseTour_}
            onSkip={this.onSkipTour_}
            theme={theme} />
        )}

      </Container>
    );
  }
}

const Connected = connect((state: ReduxState) => ({
  locale: state.i18n.locale,
  uid: state.users.me,
  tour: state.tours.byId[TourDoc.IDS.CLASSROOM] ?? TourDoc.DEFAULT,
  tourLoaded: !!state.tours.loaded[TourDoc.IDS.CLASSROOM],
  tourLoading: !!state.tours.loading[TourDoc.IDS.CLASSROOM],
  tourError: state.tours.error[TourDoc.IDS.CLASSROOM],
}))(withNavigate(ClassroomsDashboard));

export default Connected as React.ComponentType<ClassroomsDashboardPublicProps>;
