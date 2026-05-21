import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';
import { DARK, Theme, ThemeProps } from '../components/constants/theme';
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { State as ReduxState } from '../state';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../state/State/Classroom';
import Dict from '../util/objectOps/Dict';
import { addStudentToClassroomAsyncRaw, ClassroomsAction, removeStudentFromClassroom, studentInClassroom } from 'state/reducer/classrooms';
import { auth } from '../firebase/firebase';
import JoinClassDialog from '../components/Dialog/JoinClassDialog';
import LeaveClassDialog from '../components/Dialog/LeaveClassDialog';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import ClassroomLeaderboard from './ClassroomLeaderboard';
import ChallengeTabView from '../components/Classrooms/ChallengeTabView';
import MainMenu from '../components/MainMenu';
import { FontAwesome } from '../components/FontAwesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ClassroomExtraMenu from '../components/ClassroomExtraMenu';
import TourDoc, { getTourSteps, getStudentViewInClassroomTourStepsForStudent, TourStep } from '../tours/Tours';
import TourTarget from '../components/Tours/TourTarget';
import { TourRegistry } from '../tours/TourRegistry';
import GuidedTour from '../components/Tours/GuidedTour';
import { completeTour, fetchTourIfNeeded, retakeTour } from '../state/reducer/tours';
import tr from '@i18n';
import StudentTabs from '../components/Classrooms/StudentTabs';
import Async from 'state/State/Async';

namespace SubMenu {
  export enum Type {
    None,
    ExtraMenu,
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface ExtraMenu {
    type: Type.ExtraMenu;
  }

  export const EXTRA_MENU: ExtraMenu = { type: Type.ExtraMenu };
}

type SubMenu =
  | SubMenu.None
  | SubMenu.ExtraMenu;

export interface ClassroomStudentViewRootRouteParams {
  classroomId: string;
  [key: string]: string;

}

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  src?: string;
  backgroundColor?: string;
}

interface Score {
  name: LocalizedString; // Challenge name
  completed: boolean;
  score?: number;
  completionTime?: number;
  code?: string;
  language?: ProgrammingLanguage;
}

interface LeaderboardUser {
  id: string;
  name: string;
  scores: Score[];
  src?: string;
  backgroundColor?: string;
  altId?: string;
}


export interface ClassroomStudentViewPublicProps extends StyleProps, ThemeProps {
  onStudentAdded: (classroomId: string, studentId: string, displayName: string) => void;
  onJoinClassroom: (classroom: AsyncClassroom) => void;
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: AsyncClassroom) => Promise<void>;
}

interface ClassroomStudentViewPrivateProps {
  locale: LocalizedString.Language;
  currentStudentClassroom: AsyncClassroom | null;
  uid: string;
  toursById: Record<string, TourDoc>;
  toursLoaded: Record<string, boolean>;
}

interface ClassroomStudentViewState {
  currentClassroom: AsyncClassroom;
  selectedStudentId: string;
  leaderboardClassroom: AsyncClassroom | null;
  users: Record<string, LeaderboardUser>;
  challenges: Record<string, Challenge>;
  showJoinClassroomDialog: boolean;
  showClassroomLeaderboardSelector: boolean;
  showSelectedClassroomLeaderboard: boolean;
  showLeaveClassroomDialog: boolean;
  currentStudentDisplayName?: string;
  subMenu: SubMenu;
  isStudentInClassroom?: boolean;
  currentTourStepIndex?: number;
  continueTour?: boolean;
  currentTab?: "Default JBC Challenges" | "Limited Challenges";
  studentViewTourSteps: TourStep[];
  tourId?: string;
  tourAutoOpenAssignmentDetails?: boolean;
  /** When set, StudentTabs switches to this tab index (0–3) so tour targets mount. */
  tourStudentTabSync?: number;
  /** Expand all assignment topic sections so the first row is visible for the tour. */
  tourExpandStudentAssignmentTopics?: boolean;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomStudentViewPublicProps & ClassroomStudentViewPrivateProps & WithNavigateProps;
type State = ClassroomStudentViewState;

const ClassroomInfoContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  padding: '0.5px',
  fontSize: '1.2em',
  overflow: 'hidden',
  flexWrap: 'nowrap',
}));

const PageContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: 'calc(100vh - 1px)',
  zIndex: 35
}));

const ClassroomsContainer = styled("div", (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ClassroomsClassroomInfoContainer = styled('div', (props: ThemeProps) => ({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'center',

}));

const ClassroomHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '3em',
  height: '88vh',
}));

const MyClassroomContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minHeight: '80vh',
  width: '100vw'

}));


const Button = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));
const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  width: '3em',
  alignItems: 'center',
  flexDirection: 'row',
  borderRight: `1px solid ${props.theme.borderColor}`,
  paddingLeft: '20px',
  paddingRight: '20px',
  height: '3em',
  opacity: props.disabled ? '0.5' : '1.0',
  ':last-child': {
    borderRight: 'none'
  },
  fontWeight: 400,
  ':hover': props.onClick && !props.disabled ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {},
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const ItemIcon = styled(FontAwesome, {
  paddingRight: '10px'
});

export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
  'python': 'customPython',
  'c': 'customCpp',
  'cpp': 'customCpp',
  'plaintext': 'plaintext',
};

class ClassroomStudentView extends React.Component<Props, State> {
  private unsubscribeChallenges: (() => void) | null = null;
  private registry = new TourRegistry();
  private scrollRef: HTMLDivElement | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      currentClassroom: null,
      selectedStudentId: '',
      users: {},
      challenges: {},
      showJoinClassroomDialog: false,
      showClassroomLeaderboardSelector: false,
      showSelectedClassroomLeaderboard: false,
      showLeaveClassroomDialog: false,
      leaderboardClassroom: null,
      subMenu: SubMenu.NONE,
      studentViewTourSteps: [],
      tourAutoOpenAssignmentDetails: false,
    };


  }

  async componentDidMount() {
    const currentUserId = auth.currentUser?.uid || '';
    const isInClassroom = await studentInClassroom(currentUserId);
    const currentUser = auth.currentUser.uid;
    const { uid } = this.props;

    if (isInClassroom.classroom) {
      if (uid) {
        await fetchTourIfNeeded(uid, TourDoc.IDS.STUDENT_VIEW_IN_CLASSROOM);
      }

      const loadedClasssroom = Async.latestValue(isInClassroom.classroom);

      this.setState({
        isStudentInClassroom: isInClassroom.inClassroom,
        currentClassroom: isInClassroom.classroom,
        currentStudentDisplayName: loadedClasssroom.studentIds[currentUserId].displayName,
        studentViewTourSteps: getStudentViewInClassroomTourStepsForStudent(
          this.props.locale,
          loadedClasssroom,
          currentUserId
        ),
        tourId: TourDoc.IDS.STUDENT_VIEW_IN_CLASSROOM,
      }, () => {
        this.props.onJoinClassroom(isInClassroom.classroom);
        this.props.navigate(`/classrooms/${currentUser}/studentView/${Async.latestValue(isInClassroom.classroom).classroomId}`);
      });
    } else {
      if (uid) {
        await fetchTourIfNeeded(this.props.uid, TourDoc.IDS.STUDENT_VIEW);
      }
      this.setState({ studentViewTourSteps: getTourSteps(TourDoc.IDS.STUDENT_VIEW, this.props.locale), tourId: TourDoc.IDS.STUDENT_VIEW });
    }

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomStudentViewState>) {

    if (prevState.currentClassroom !== this.state.currentClassroom) {
      if (this.state.currentClassroom) {
        const currentUser = auth.currentUser.uid;
        this.props.navigate(`/classrooms/${currentUser}/studentView/${Async.latestValue(this.state.currentClassroom).classroomId}`);
        this.setState({
          studentViewTourSteps: getStudentViewInClassroomTourStepsForStudent(
            this.props.locale,
            Async.latestValue(this.state.currentClassroom),
            auth.currentUser?.uid || ''
          ),
          tourId: TourDoc.IDS.STUDENT_VIEW_IN_CLASSROOM,
        });
      } else {
        this.setState({ studentViewTourSteps: getTourSteps(TourDoc.IDS.STUDENT_VIEW, this.props.locale), tourId: TourDoc.IDS.STUDENT_VIEW });
      }
    }
    if (prevProps.locale !== this.props.locale) {
      if (this.state.currentClassroom) {
        const currentUser = auth.currentUser.uid;
        this.props.navigate(`/classrooms/${currentUser}/studentView/${Async.latestValue(this.state.currentClassroom).classroomId}`);
        this.setState({
          studentViewTourSteps: getStudentViewInClassroomTourStepsForStudent(
            this.props.locale,
            Async.latestValue(this.state.currentClassroom),
            auth.currentUser?.uid || ''
          ),
          tourId: TourDoc.IDS.STUDENT_VIEW_IN_CLASSROOM,
        });
      } else {
        this.setState({ studentViewTourSteps: getTourSteps(TourDoc.IDS.STUDENT_VIEW, this.props.locale), tourId: TourDoc.IDS.STUDENT_VIEW });
      }
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeChallenges) {
      this.unsubscribeChallenges();
    }
  }

  private onStudentAssignmentAction_ = (_currentSelectedClassroom: AsyncClassroom, _action: 'edit' | 'create', _assignmentToEdit?: ClassroomAssignment) => {
    // Student view does not surface create/edit from this path; AssignmentsView still requires the callback.
  };

  private onJoinClassroomDialog_ = () => {
    this.setState({ showJoinClassroomDialog: true });
  };

  private classroomForLeave_ = (): AsyncClassroom | null =>
    this.props.currentStudentClassroom ?? this.state.currentClassroom ?? null;

  private onLeaveClassroomDialog_ = () => {
    this.setState({ showLeaveClassroomDialog: true });
  };

  private onCloseJoinClassroomDialog_ = async (returnedClassroom: AsyncClassroom, inviteCode: string, displayName: string) => {
    const classroom = await addStudentToClassroomAsyncRaw(
      returnedClassroom,
      inviteCode,
      auth.currentUser?.uid || '',
      displayName
    );

    if (classroom) {
      const docId = Async.latestValue(classroom).docId;
      if (docId) {
        this.props.onStudentAdded(docId, auth.currentUser?.uid || '', displayName);
      }
      this.props.onJoinClassroom(classroom);
      this.setState({ showJoinClassroomDialog: false, isStudentInClassroom: true, currentClassroom: classroom, currentStudentDisplayName: displayName });
    }


  };

  private onCloseLeaveClassroomDialog_ = async () => {
    const currentClassroom = this.classroomForLeave_();
    const uid = auth.currentUser?.uid;
    if (!currentClassroom || !uid) {
      throw new Error('No classroom loaded');
    }
    await this.props.onRemoveStudentFromClassroom(uid, currentClassroom);
    this.props.navigate(`/classrooms/${auth.currentUser?.uid || ''}/studentView/`);
    this.setState({ showLeaveClassroomDialog: false, isStudentInClassroom: false, currentClassroom: null, currentStudentDisplayName: undefined });
  };

  private onExitJoinClassroomDialog_ = () => {
    this.setState({ showJoinClassroomDialog: false });
  };

  private onExitLeaveClassroomDialog_ = () => {
    this.setState({ showLeaveClassroomDialog: false });
  };
  private renderClassroomLeaderboard = () => {
    const { theme } = this.props;
    const { currentClassroom } = this.state;
    return (
      <ClassroomLeaderboard
        theme={theme}
        view={"studentView"}
        currentStudentDisplayName={this.state.currentStudentDisplayName}
        currentClassroom={currentClassroom} />
    );
  };

  private renderMyClassroom = () => {
    const { isStudentInClassroom, currentTab, currentClassroom } = this.state;
    const { theme, locale, style } = this.props;
    return (

      <MyClassroomContainer theme={theme}>
        {isStudentInClassroom ? (

          // <ChallengeTabView theme={theme} locale={locale} tourRegistry={this.registry} showTab={currentTab ? currentTab : undefined} />
          <StudentTabs
            currentSelectedClassroom={currentClassroom}
            onAssignmentAction={this.onStudentAssignmentAction_}
            theme={theme}
            tourRegistry={this.registry}
            tourAutoOpenAssignmentDetails={this.state.tourAutoOpenAssignmentDetails}
            tourSyncTabIndex={this.state.tourStudentTabSync}
            tourExpandAssignmentTopics={this.state.tourExpandStudentAssignmentTopics}
            tourAssignmentDetailsStepId={this.state.studentViewTourSteps[this.state.currentTourStepIndex ?? 0]?.id}
            tourGuidedStepIndex={this.state.currentTourStepIndex}
            leaderboardChallengeShowTab={this.state.currentTab}
          />

        ) : (
          <ClassroomInfoContainer theme={theme}>
            <p>{LocalizedString.lookup(tr("You are not enrolled in any classroom."), locale)}</p>

            <TourTarget registry={this.registry} targetKey='join-classroom-button' style={{ marginLeft: '1em' }}>
              <Button style={{ marginLeft: '1em' }} theme={DARK} onClick={this.onJoinClassroomDialog_}>
                {LocalizedString.lookup(tr("Join Class"), locale)}
              </Button>
            </TourTarget>
          </ClassroomInfoContainer>
        )}
      </MyClassroomContainer>


    );

  };

  private onExtraClick_ = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const currentType = this.state.subMenu.type;
    this.setState(
      {
        subMenu:
          currentType === SubMenu.Type.ExtraMenu
            ? SubMenu.NONE
            : SubMenu.EXTRA_MENU,
      },
      () => {
        if (currentType !== SubMenu.Type.ExtraMenu) {
          window.addEventListener('click', this.onClickOutside_);
        } else {
          window.removeEventListener('click', this.onClickOutside_);
        }
      }
    );

    event.stopPropagation();
  };

  private onClickOutside_ = (event: MouseEvent) => {
    this.setState({ subMenu: SubMenu.NONE });
    window.removeEventListener('click', this.onClickOutside_);
  };
  private onCloseTour_ = () => {
    void completeTour(this.props.toursById[this.state.tourId] ?? TourDoc.DEFAULT, this.props.uid, this.state.tourId);
    this.setState({
      tourStudentTabSync: undefined,
      tourExpandStudentAssignmentTopics: false,
      tourAutoOpenAssignmentDetails: false,
      showJoinClassroomDialog: false,
      subMenu: SubMenu.NONE,
    });
  };

  private onSkipTour_ = () => {
    void completeTour(this.props.toursById[this.state.tourId] ?? TourDoc.DEFAULT, this.props.uid, this.state.tourId, { dismissed: true });
    this.setState({
      tourStudentTabSync: undefined,
      tourExpandStudentAssignmentTopics: false,
      tourAutoOpenAssignmentDetails: false,
      showJoinClassroomDialog: false,
      subMenu: SubMenu.NONE,
    });
  };

  private onNextClick_ = (stepIndex: number) => {
    this.setState(this.studentTourUiStateForStepIndex_(stepIndex));
  };
  private onBackClick_ = (stepIndex: number) => {
    const { studentViewTourSteps } = this.state;
    const step = studentViewTourSteps[stepIndex];
    const base = this.studentTourUiStateForStepIndex_(stepIndex);

    if (step?.targetKey === 'classroom-extra-options-click') {
      this.setState({ ...base, subMenu: SubMenu.NONE });
      return;
    }
    if (step?.targetKey === 'challenge-tab-view-limited-challenges-click') {
      this.setState({ ...base, currentTab: 'Default JBC Challenges' }, () => {
        this.setState({ currentTab: undefined });
      });
      return;
    }
    if (step?.targetKey === 'join-classroom-button') {
      this.setState({ ...base, showJoinClassroomDialog: false });
      return;
    }
    if (step?.id === 'default-jbc-challenges-leaderboard-tab') {
      this.setState({ ...base, currentTab: 'Default JBC Challenges' }, () => {
        this.setState({ currentTab: undefined });
      });
      return;
    }
    this.setState(base);
  };

  private onContinueTour_ = () => {
    this.setState({ continueTour: true }, () => {
      this.setState({ continueTour: false });
    });
  };

  private onRetakeTour_ = () => {
    void retakeTour(this.props.toursById[this.state.tourId] ?? TourDoc.DEFAULT, this.props.uid, this.state.tourId);
  };

  private studentTourTabIndexForStep_(step: TourStep | undefined): number | undefined {
    if (!step?.id) return undefined;
    const { id } = step;
    if (id === 'student-tab-home') return 0;
    if (id === 'student-tab-assignments') return 1;
    if (id === 'student-tab-people') return 2;
    if (id === 'student-tab-leaderboard') return 3;
    if (id === 'student-assignments-panel' || id === 'student-assignment-first-row' || id === 'student-assignment-open-details-prompt') {
      return 1;
    }
    if (id.startsWith('assignment-details')) return 1;
    const leaderboardTourIds = new Set([
      'challenge-tab-view',
      'default-jbc-challenges-leaderboard-tab',
      'export-button',
      'scroll-to-my-scores-button',
      'see-my-badges-button',
      'challenge-tab-view-limited-challenges-click',
      'challenge-tab-view-limited-challenges',
    ]);
    if (leaderboardTourIds.has(id)) return 3;
    return undefined;
  }

  /**
   * Tour UI for a given step (tab sync, assignment-details flag, join dialog, extra menu).
   * Applied from Back/Next as well as onStepIndexChange so the destination view mounts before
   * GuidedTour measures (the previous step may live in Home, Assignments, People, or Leaderboard).
   */
  private studentTourUiStateForStepIndex_(stepIndex: number): Pick<
  ClassroomStudentViewState,
  | 'currentTourStepIndex'
  | 'tourStudentTabSync'
  | 'tourExpandStudentAssignmentTopics'
  | 'tourAutoOpenAssignmentDetails'
  | 'showJoinClassroomDialog'
  | 'subMenu'
  > {
    const step = this.state.studentViewTourSteps[stepIndex];
    const id = step?.id;
    const expandAssignmentTopics =
      id === 'student-assignments-panel' ||
      id === 'student-assignment-first-row' ||
      id === 'student-assignment-open-details-prompt' ||
      (id?.startsWith('assignment-details') ?? false);
    const tourAutoOpenAssignmentDetails = !!(id && id.startsWith('assignment-details'));
    const showJoinClassroomDialog = id === 'join-classroom-dialog';

    return {
      currentTourStepIndex: stepIndex,
      tourStudentTabSync: this.studentTourTabIndexForStep_(step),
      tourExpandStudentAssignmentTopics: expandAssignmentTopics,
      tourAutoOpenAssignmentDetails,
      showJoinClassroomDialog,
      subMenu: id === 'classroom-extra-options-dropdown' ? SubMenu.EXTRA_MENU : SubMenu.NONE,
    };
  }

  /**
   * From the “Limited Challenge Tab View” click step only, Back goes to the Default JBC Challenges
   * leaderboard step so that view’s content is shown.
   */
  private resolveStudentTourBackStep_ = (currentStepIndex: number, _defaultPrevIndex: number): number | undefined => {
    const steps = this.state.studentViewTourSteps;
    const cur = steps[currentStepIndex];
    if (!cur) return undefined;
    if (cur.id !== 'challenge-tab-view-limited-challenges-click') {
      return undefined;
    }
    const jbc = steps.findIndex((s) => s.id === 'default-jbc-challenges-leaderboard-tab');
    if (jbc >= 0 && jbc < currentStepIndex) {
      return jbc;
    }
    return undefined;
  };

  private onGuidedTourStepIndexChange_ = (stepIndex: number) => {
    this.setState(this.studentTourUiStateForStepIndex_(stepIndex));
  };

  render() {
    const { props, state } = this;
    const { style, locale, toursById, toursLoaded } = props;
    const { tourId, showLeaveClassroomDialog, showJoinClassroomDialog, currentClassroom, subMenu, studentViewTourSteps } = state;
    const theme = DARK;
    const activeTour = tourId ? (toursById[tourId] ?? TourDoc.DEFAULT) : TourDoc.DEFAULT;
    const activeTourLoaded = !!(tourId && toursLoaded[tourId]);
    const showTour = !!tourId && activeTourLoaded && !activeTour.completed;
    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} tourRegistry={this.registry} onRetakeTour={this.onRetakeTour_} />

        <div style={{ width: '100%', alignItems: 'flex-end', display: 'flex', flexDirection: 'column' }}>
          <TourTarget registry={this.registry} targetKey='classroom-extra-options-click'>
            <Item
              theme={theme}
              onClick={this.onExtraClick_}
              style={{ position: 'relative' }}
            >

              <ItemIcon icon={faBars} style={{ padding: 0 }} />
              {subMenu.type === SubMenu.Type.ExtraMenu ? (
                <ClassroomExtraMenu theme={theme}
                  tourRegistry={this.registry}
                  onLeaveClass={this.onLeaveClassroomDialog_}
                />
              ) : undefined}

            </Item>
          </TourTarget>
        </div>

        <TourTarget registry={this.registry} targetKey='student-dashboard' style={style}>
          <ClassroomsContainer style={style} theme={theme}>
            <ClassroomsClassroomInfoContainer style={style} theme={theme}>
              <ClassroomHeaderContainer style={style} theme={theme}>
                {this.renderMyClassroom()}
                {showLeaveClassroomDialog && this.classroomForLeave_() && (
                  <LeaveClassDialog
                    onClose={this.onExitLeaveClassroomDialog_}
                    currentClassroom={Async.latestValue(this.classroomForLeave_())}
                    locale={locale}
                    onLeaveClassDialogClose={this.onCloseLeaveClassroomDialog_}
                    theme={DARK}

                  />
                )}
                {showJoinClassroomDialog && (
                  <JoinClassDialog
                    onClose={this.onExitJoinClassroomDialog_}
                    onContinueTour={this.onContinueTour_}
                    locale={locale}
                    onJoinClassDialogClose={this.onCloseJoinClassroomDialog_}
                    theme={DARK}
                    tourRegistry={this.registry}

                  />
                )}
              </ClassroomHeaderContainer>

            </ClassroomsClassroomInfoContainer>

          </ClassroomsContainer>
        </TourTarget>
        {showTour && (
          <GuidedTour
            continueTourFlag={this.state.continueTour}
            isOpen={showTour}
            steps={studentViewTourSteps}
            registry={this.registry}
            scrollContainer={this.scrollRef}
            onClose={this.onCloseTour_}
            onSkip={this.onSkipTour_}
            onBackClick={this.onBackClick_}
            onNextClick={this.onNextClick_}
            onStepIndexChange={this.onGuidedTourStepIndexChange_}
            resolveBackStepIndex={this.resolveStudentTourBackStep_}
            theme={theme} />
        )}
      </PageContainer>
    );
  }
}

export default connect(
  (state: ReduxState) => ({
    toursById: state.tours.byId,
    toursLoaded: state.tours.loaded,
    toursLoading: state.tours.loading,
    toursError: state.tours.error,
    classroomList: state.classrooms.entities,
    currentStudentClassroom: state.classrooms.currentStudentClassroom,
    locale: state.i18n.locale,
    uid: state.users.me,
  }),
  (dispatch) => ({
    onStudentAdded: (inviteCode: string, studentId: string, displayName: string) => {
      dispatch(ClassroomsAction.studentAdded({ classroomId: inviteCode, studentId, displayName }));
    },
    onJoinClassroom: (classroom: AsyncClassroom) => {
      dispatch(ClassroomsAction.joinClassroom({ classroom }));
    },

    onRemoveStudentFromClassroom: async (studentId: string, currentClassroom: AsyncClassroom) => {
      await removeStudentFromClassroom(studentId, currentClassroom);
      dispatch(ClassroomsAction.removeStudentFromClassroom({
        studentId,
        currentClassroom,
        persist: false,
      }));
    },
  }))(withNavigate(ClassroomStudentView));
