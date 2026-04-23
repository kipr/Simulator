import * as React from 'react';
import { styled } from 'styletron-react';
import { connect, Provider } from 'react-redux';
import { DEFAULT_SETTINGS } from '../components/constants/Settings';
import { DARK, Theme, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { default as IvyGateClassroom } from "ivygate/dist/src/types/classroomTypes";
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { IvygateFileExplorer } from 'ivygate/dist/src';
import store, { State as ReduxState } from '../state';
import tr from '@i18n';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { AsyncClassroom, Classroom } from '../state/State/Classroom';
import { CreateClassroomDialog } from '../components/Dialog/CreateClassroomDialog';
import Dict from '../util/objectOps/Dict';
import { ClassroomsAction, listChallengesByStudentId, deleteClassroom } from 'state/reducer/classrooms';
import { auth } from '../firebase/firebase';
import { User } from 'ivygate/dist/src/types/user';
import Async from 'state/State/Async';
import { InterfaceMode } from 'ivygate/dist/src/types/interface';
import { SimClassroomProject } from 'ivygate/dist/src/types/project';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import ChallengeCompletion, { AsyncChallengeCompletion } from 'state/State/ChallengeCompletion';
import { DeleteDialog } from '../components/Dialog';
import ClassroomLeaderboardsDialog from '../components/Dialog/ClassroomLeaderboardsDialog';
import Challenge from '../components/Challenge';
import { AsyncChallenge } from '../state/State/Challenge';
import { Challenges, ChallengeCompletions, Classrooms } from '../state/State';
import { Project } from 'state/State/Project';
import TourTarget from '../components/Tours/TourTarget';
import { TourRegistry } from '../tours/TourRegistry';
import GuidedTour from '../components/Tours/GuidedTour';
import TourDoc, { getTeacherViewTourSteps, getTourSteps, TourStep } from '../tours/Tours';
import { completeTour, fetchTourIfNeeded, retakeTour } from '../state/reducer/tours';
import TeacherTabs from '../components/Classrooms/TeacherTabs';
import { Card } from '../components/interface/Card';
import CreateAssignmentView from '../components/Classrooms/CreateAssignmentView';
import AssignToDialog from '../components/Dialog/AssignToDialog';


export interface ClassroomTeacherViewRootRouteParams {
  classroomId: string;
  [key: string]: string;

}

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  src?: string; '../'
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

interface ChallengeProps {
  challenges: Challenges;
  challengeCompletions: ChallengeCompletions;
}


export interface ClassroomTeacherViewPublicProps extends StyleProps, ThemeProps {
  classroomList: Dict<AsyncClassroom>;
  challenge?: AsyncChallenge;

  onCreateClassroom: (classroom: Classroom) => void;
  onListOwnedClassrooms: () => void;
  onListChallengesByStudentId: (studentId: string) => void;
  onShowClassroomLeaderboard: (classroom: AsyncClassroom) => void;
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: Classroom) => void;
}

interface ClassroomTeacherViewPrivateProps {
  locale: LocalizedString.Language;
  tour: TourDoc;
  tourLoaded: boolean;
  tourLoading: boolean;
  tourError: string | null;
  uid: string;
  selectedClassroom?: AsyncClassroom | null;
  onStudentInClassroom?: (studentId: LocalizedString) => void;
  onAddStudentToClassroom?: (classroomId: string, studentId: LocalizedString) => void;
  deleteClassroom?: (classroomId: string, classroom: Classroom) => void;
}

interface ClassroomTeacherViewState {
  selectedStudentId: string;
  selectedProject?: Project | SimClassroomProject;
  leaderboardClassroom: AsyncClassroom | null;
  users: Record<string, LeaderboardUser>;
  challenges: Record<string, Challenge>;
  showCreateClassroomDialog: boolean;
  showJoinClassroomDialog: boolean;
  showClassroomLeaderboardSelector: boolean;
  showSelectedClassroomLeaderboard: boolean;
  showAreYouSureDialog: boolean;
  isStudentInClassroom?: boolean;
  deleteObject?: IvyGateClassroom | User | null;
  currentTourStepIndex?: number;
  continueTour?: boolean;
  currentSelectedClassroom?: AsyncClassroom | null;
  createAssignmentVisible?: boolean;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomTeacherViewPublicProps & ClassroomTeacherViewPrivateProps & WithNavigateProps & ChallengeProps;
type State = ClassroomTeacherViewState;

const PageContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const ClassroomsContainer = styled("div", (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  width: 'calc(100vw - 2px)',
  height: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}));

const ClassroomsTitleContainer = styled('div', (props: ThemeProps) => ({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '20px',

}));

const ClassroomsCardContainer = styled('div', (props: ThemeProps) => ({
  alignItems: 'center',
  justifyContent: 'flex-start',
  display: 'flex',
  flexDirection: 'row',
  margin: '20px',
}));

const ClassroomCardScrollContainer = styled('div', {
  width: '100%',
  overflow: 'auto',
  WebkitOverflowScrolling: 'touch',
  height: '32%',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(121,121,121,0.6) transparent',
  //backgroundColor: 'purple',
  '::-webkit-scrollbar': {
    width: '14px',
    height: '14px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(121,121,121,0.4)',
    borderRadius: '8px',
  },
  '::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(121,121,121,0.7)',
  },
});

const CardWrapper = styled('div', (props: ThemeProps & { selected?: boolean }) => ({
  borderRadius: `${props.theme.itemPadding * 4}px`,
  cursor: 'pointer',
  backgroundColor: props.selected ? 'pink' : 'transparent',
}));

const StickyButtonWrap = styled('div', {
  position: 'absolute',
  left: '20px',
  top: '6%',
  zIndex: 2,
});

const ClassroomHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: '3em',
  backgroundColor: 'pink',
  width: '90vw',
  height: '90vh'
}));

const ManageClassroomsContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  width: '100%',
  flex: 1,
  height: '100%',
}));

const Button = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  //opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));




export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
  'python': 'customPython',
  'c': 'customCpp',
  'cpp': 'customCpp',
  'plaintext': 'plaintext',
};
let teacherViewTourSteps: TourStep[];
let registry: TourRegistry;
class ClassroomTeacherView extends React.Component<Props, State> {
  private challengeCache: Record<string, Dict<ChallengeCompletion>> = {};
  private unsubscribeChallenges: (() => void) | null = null;


  private scrollRef: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStudentId: '',
      users: {},
      challenges: {},
      showCreateClassroomDialog: false,
      isStudentInClassroom: null as boolean | null,
      currentSelectedClassroom: null,

      showJoinClassroomDialog: false,
      showClassroomLeaderboardSelector: false,
      showSelectedClassroomLeaderboard: false,
      showAreYouSureDialog: false,
      leaderboardClassroom: null
    };

    teacherViewTourSteps = getTeacherViewTourSteps(props.locale);

  }
  registry = new TourRegistry();

  async componentDidMount() {
    this.props.onListOwnedClassrooms();
    const { uid } = this.props;
    if (uid) {
      await fetchTourIfNeeded(this.props.uid, TourDoc.IDS.TEACHER_VIEW);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    console.log("componentDidUpdate called with props: ", this.props, " and state: ", this.state);
    if (prevProps.classroomList !== this.props.classroomList) {
      this.getIvygateClassrooms();
    }
    if (this.props.locale !== prevProps.locale) {
      teacherViewTourSteps = getTeacherViewTourSteps(this.props.locale);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeChallenges) {
      this.unsubscribeChallenges();
    }
  }


  private onAddNewClassroom_ = (classroom: IvyGateClassroom) => {
    this.setState({ showCreateClassroomDialog: true });
  };

  private onDeleteClassroom_ = (classroom: IvyGateClassroom) => {
    this.setState({ showAreYouSureDialog: true, deleteObject: classroom });
  };

  private onDeleteUser_ = (user: User) => {
    this.setState({ showAreYouSureDialog: true, deleteObject: user });
  };

  private onSeeLeaderboards = () => {
    this.setState({
      showClassroomLeaderboardSelector: true
    });
  };
  private onCloseClassroomDialog_ = (teacherDisplayName: string, classroomName: string, classroomInviteCode: string) => {
    this.props.onCreateClassroom({
      teacherId: auth.currentUser?.uid || '',
      classroomId: classroomName,
      code: classroomInviteCode,
      studentIds: {},
      docId: '',
      type: 'classroom',
      teacherDisplayName: teacherDisplayName
    });
    this.props.onListOwnedClassrooms();
    this.setState({ showCreateClassroomDialog: false });
  };

  private onCloseClassroomLeaderboardDialog_ = (classroomId: string) => {
    Object.values(this.props.classroomList).forEach((asyncClassroom) => {
      if (asyncClassroom.type === Async.Type.Loaded) {
        const classroom = asyncClassroom.value;
        if (classroom.classroomId === classroomId) {
          this.props.navigate(`/classrooms/${classroomId}`);
          this.setState({
            leaderboardClassroom: asyncClassroom, showSelectedClassroomLeaderboard: true,
            showClassroomLeaderboardSelector: false
          });
        }
      }
    });

  };

  private onCloseDeleteDialog_ = async () => {
    const { deleteObject } = this.state;
    if (deleteObject.type === "classroom") {
      for (const [classroomKey, asyncClassroom] of Object.entries(this.props.classroomList)) {
        if (asyncClassroom.type === Async.Type.Loaded && asyncClassroom.value.classroomId === `${deleteObject.name}`) {
          await deleteClassroom(classroomKey, Async.deleting(asyncClassroom));
        }
      }
    } else if (deleteObject.type === "user") {
      // Deleting a user from a classroom is not implemented in this snippet.
      const userClassroom = Object.values(this.props.classroomList).find((asyncClassroom) => {
        if (asyncClassroom.type === Async.Type.Loaded) {
          const classroom = asyncClassroom.value;
          return Object.values(classroom.studentIds).some(student => student.id === `${deleteObject.userName}`);
        }
        return false;
      });

      if (userClassroom && userClassroom.type === Async.Type.Loaded) {
        const classroom = userClassroom.value;
        this.props.onRemoveStudentFromClassroom(`${deleteObject.userName}`, classroom);
      } else {
        console.log(`User ${deleteObject.userName} not found in any classroom.`);
      }

    }
    this.props.onListOwnedClassrooms();
    this.setState({ showAreYouSureDialog: false, deleteObject: null });
  };

  private onExitDeleteDialog_ = () => {
    this.setState({ showAreYouSureDialog: false });
  };

  private onExitClassLeaderboardsDialog_ = () => {
    this.setState({ showClassroomLeaderboardSelector: false });
  };

  private onExitCreateClassroomDialog_ = () => {
    this.setState({ showCreateClassroomDialog: false });
  };

  private onSelectStudent = async (student: User) => {
    if (this.challengeCache[student.userName]) {
      this.setState({
        selectedStudentId: student.userName
      });
      return;
    }
    const challenges = await listChallengesByStudentId(student.userName);
    this.challengeCache[student.userName] = challenges;
    this.getIvygateClassrooms();
    this.setState({
      selectedStudentId: student.userName
    });
  };
  private onProjectSelected = (user: User, project: SimClassroomProject, fileName: string, activeLanguage: ProgrammingLanguage) => {
    this.setState({ selectedProject: project });
  };

  private memoIvygateClassrooms: IvyGateClassroom[] | null = null;
  private memoSource: Props['classroomList'] | undefined;

  private getIvygateClassrooms = () => {
    const { classroomList } = this.props;

    if (this.memoSource === classroomList && this.memoIvygateClassrooms !== null) {
      return this.memoIvygateClassrooms;
    }

    this.memoSource = classroomList;
    this.memoIvygateClassrooms = this.updateIvygateClassrooms();
    return this.memoIvygateClassrooms;
  };


  private updateIvygateClassrooms = (): IvyGateClassroom[] => {
    const { classroomList, locale } = this.props;
    const { selectedStudentId } = this.state;
    const ivygateClassrooms: IvyGateClassroom[] = [];

    for (const [id, asyncClassroom] of Object.entries(classroomList)) {

      if (asyncClassroom.type === Async.Type.Loaded && classroomList !== null) {

        const classroom = asyncClassroom.value;
        // map studentIds to match IvygateFileExplorer's User objects
        const classroomUsers: User[] = Object.values(classroom.studentIds).map((studentId) => {
          const studentChallenges = this.challengeCache[selectedStudentId];
          const userProjects: SimClassroomProject[] = studentChallenges
            ? Object.entries(studentChallenges).map(([challengeId, score]) => {
              const asyncChallengeFromStore = this.props.challenges[challengeId];
              const asyncChallenge: AsyncChallenge = asyncChallengeFromStore;
              const asyncCompletion: AsyncChallengeCompletion = {
                type: Async.Type.Loaded,
                brief: {},
                value: {
                  code: score.code,
                  currentLanguage: score.currentLanguage,
                  serializedSceneDiff: score.serializedSceneDiff,
                  eventStates: score.eventStates,
                  robotLinkOrigins: score.robotLinkOrigins,
                  success: score.success,
                  failure: score.failure,

                }
              };
              return {
                projectName: challengeId,
                projectLanguage: `${score.currentLanguage}`,
                type: challengeId,
                code: score.code[`${score.currentLanguage}`] || '',
                eventStates: Object.fromEntries(
                  Object.entries(score.eventStates ?? {}).map(([eventName, completed]) => [
                    eventName,
                    { eventName, completed },
                  ])
                ),
                challenge: asyncChallenge,
                challengeCompletion: asyncCompletion,
              };
            })
            : [];

          return {
            userName: studentId.id || 'Unknown',
            interfaceMode: InterfaceMode.SIMPLE,
            projects: userProjects,
            classroomName: classroom.classroomId,
            displayName: studentId.displayName ? studentId.displayName : 'Unknown',
            type: 'user',

          };

        });

        const ivygateClassroom: IvyGateClassroom = {
          name: classroom.classroomId,
          users: classroomUsers,
          classroomInvitationCode: classroom.code,
          type: 'classroom'
        };

        ivygateClassrooms.push(ivygateClassroom);
      }
    }
    return ivygateClassrooms;
  };


  private renderManageClassrooms = () => {
    const { showCreateClassroomDialog, showClassroomLeaderboardSelector } = this.state;
    const { classroomList, style, theme, locale } = this.props;

    return (
      <ManageClassroomsContainer theme={theme} style={style}>
        <Provider store={store}>
          <IvygateFileExplorer
            ChallengeComponent={Challenge}
            config={{ appName: "Simulator", component: "SimClassrooms" }}
            propUsers={[]}
            propClassrooms={this.updateIvygateClassrooms()}
            propSettings={{ ...DEFAULT_SETTINGS, classroomView: true }}
            onProjectSelected={this.onProjectSelected}
            onUserSelected={this.onSelectStudent}
            onAddNewClassroom={this.onAddNewClassroom_}
            onDeleteClassroom={this.onDeleteClassroom_}
            onDeleteUser={this.onDeleteUser_}
            theme={DARK}
            style={style}
            locale={locale}
            ivygateLanguageMapping={IVYGATE_LANGUAGE_MAPPING}
            activeTourStepId={teacherViewTourSteps[this.state.currentTourStepIndex || 0]?.id}
            tour={{
              registry: this.registry,
              targets: {
                createClassroomDropdown: 'create-classroom-dropdown',
                createClassroomDropdownMenu: 'create-classroom-dropdown-menu',
                seeCreatedClassroom: 'see-created-classroom',
                classroomUsers: 'classroom-users',
                inviteCode: 'invite-code',
              },
            }}
            onContinueTour={this.onContinueTour_}
          />
        </Provider>
        {
          showCreateClassroomDialog && (
            <CreateClassroomDialog
              onClose={this.onExitCreateClassroomDialog_}
              onContinueTour={this.onContinueTour_}
              onCloseClassroomDialog={this.onCloseClassroomDialog_}
              theme={DARK}
              locale={locale}
              tourRegistry={this.registry}
            />
          )}
        {showClassroomLeaderboardSelector &&
          (<ClassroomLeaderboardsDialog
            classrooms={classroomList}
            onClose={this.onExitClassLeaderboardsDialog_}
            onCloseClassroomLeaderboardDialog={this.onCloseClassroomLeaderboardDialog_}
            theme={theme}
            locale={locale}>

          </ClassroomLeaderboardsDialog>)}

      </ManageClassroomsContainer>

    );

  };

  private onCloseTour_ = () => {
    void completeTour(this.props.tour, this.props.uid, TourDoc.IDS.TEACHER_VIEW, { step: this.state.currentTourStepIndex });
  };

  private onSkipTour_ = () => {
    void completeTour(this.props.tour, this.props.uid, TourDoc.IDS.TEACHER_VIEW, { dismissed: true });
  };

  private onBackClick_ = (stepIndex: number) => {

    if (teacherViewTourSteps[stepIndex].targetKey === 'create-classroom-dropdown-menu') {
      this.setState({ showCreateClassroomDialog: false, currentTourStepIndex: stepIndex });
    }
    this.setState({ currentTourStepIndex: stepIndex });
  };

  private onNextClick_ = (stepIndex: number) => {
    this.setState({ currentTourStepIndex: stepIndex });
  };

  private onContinueTour_ = () => {
    this.setState({ continueTour: true }, () => {
      this.setState({ continueTour: false });
    });
  };

  private onRetakeTour_ = () => {
    void retakeTour(this.props.tour, this.props.uid, TourDoc.IDS.TEACHER_VIEW);
  };

  private exisitingClassroomCards = () => {
    const { classroomList, theme, locale } = this.props;

    console.log("existingClassroomCards: ", classroomList);
    console.log("Object.entries(classroomList): ", Object.entries(classroomList));
    return Object.entries(classroomList).map(([id, asyncClassroom]) => {
      console.log("Checking classroom: ", id, asyncClassroom);
      if (asyncClassroom.type === Async.Type.Loaded && classroomList !== null) {
        const classroom = asyncClassroom.value;
        return (
          <CardWrapper theme={theme} key={`${id}-wrapper`} selected={Async.latestValue(this.state.currentSelectedClassroom)?.classroomId === classroom.classroomId} onClick={() => this.setState({ currentSelectedClassroom: asyncClassroom })}>
            <Card
              key={id}
              onClick={() => this.setState({ currentSelectedClassroom: asyncClassroom })}
              title={classroom.classroomId}
              theme={theme}
              customheight='150px'
              customwidth='200px'
              backgroundImage={'linear-gradient(#3b3c3c, transparent), url(../../static/example_images/classroom-botguy.png)'}
              backgroundPosition={'center top'}
              custommargin='10px'
            />
          </CardWrapper>
        );
      }
      return null;
    }).filter(card => card !== null);

  };

  private handleAssignemntAction = (currentSelectedClassroom: AsyncClassroom | null, action: 'edit' | 'delete') => {
    console.log("handleAssignmentAction called with classroom: ", currentSelectedClassroom, " and action: ", action);
    this.setState({ createAssignmentVisible: true });
  };
  render() {
    const { props, state } = this;
    const { style, locale } = props;
    const { showAreYouSureDialog, deleteObject, showCreateClassroomDialog, createAssignmentVisible } = state;
    const theme = DARK;
    const showTour = props.tourLoaded && !props.tour.completed;
    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} tourRegistry={this.registry} onRetakeTour={this.onRetakeTour_} />
        <TourTarget registry={this.registry} targetKey='teacher-dashboard' style={style}>
          {createAssignmentVisible ? (
            <ClassroomsContainer style={style} theme={theme}>
              <CreateAssignmentView
                onClose={() => this.setState({ createAssignmentVisible: false })}
                theme={theme}
                classroom={state.currentSelectedClassroom}

              />
            </ClassroomsContainer>) : (
            <ClassroomsContainer style={style} theme={theme}>
              <StickyButtonWrap>
                <Button
                  theme={theme}
                  onClick={() => this.setState({ showCreateClassroomDialog: true })}
                >
                  Add New Classroom
                </Button>
              </StickyButtonWrap>
              <ClassroomCardScrollContainer>

                <ClassroomsCardContainer style={style} theme={theme}>

                  {this.exisitingClassroomCards()}

                </ClassroomsCardContainer>
              </ClassroomCardScrollContainer>
              <TeacherTabs theme={theme} currentSelectedClassroom={this.state.currentSelectedClassroom} onAssignmentAction={this.handleAssignemntAction} />


              {showAreYouSureDialog && (
                <DeleteDialog
                  name={tr(deleteObject && deleteObject.type === "classroom" ? `${deleteObject.name}` : deleteObject && deleteObject.type === "user" ? `${deleteObject.displayName}` : '')}
                  onClose={this.onExitDeleteDialog_}
                  onAccept={this.onCloseDeleteDialog_}
                  theme={theme}>

                </DeleteDialog>)}
              {
                showCreateClassroomDialog && (
                  <CreateClassroomDialog
                    onClose={this.onExitCreateClassroomDialog_}
                    onContinueTour={this.onContinueTour_}
                    onCloseClassroomDialog={this.onCloseClassroomDialog_}
                    theme={DARK}
                    locale={locale}
                    tourRegistry={this.registry}
                  />
                )}

            </ClassroomsContainer>)
          }

        </TourTarget>

        {showTour && (
          <GuidedTour
            continueTourFlag={this.state.continueTour}
            isOpen={showTour}
            steps={teacherViewTourSteps}
            registry={this.registry}
            scrollContainer={this.scrollRef}
            onClose={this.onCloseTour_}
            onSkip={this.onSkipTour_}
            onBackClick={this.onBackClick_}
            onNextClick={this.onNextClick_}
            theme={theme} />
        )}
      </PageContainer>
    );
  }
}

const DashboardWithNavigate = withNavigate(ClassroomTeacherView);

export default connect(
  (state: ReduxState) => ({
    locale: state.i18n.locale,
    uid: state.users.me,
    classroomList: state.classrooms.entities,
    challenges: state.challenges,
    challengeCompletions: state.challengeCompletions,
    tour: state.tours.byId[TourDoc.IDS.TEACHER_VIEW] ?? TourDoc.DEFAULT,
    tourLoaded: !!state.tours.loaded[TourDoc.IDS.TEACHER_VIEW],
    tourLoading: !!state.tours.loading[TourDoc.IDS.TEACHER_VIEW],
    tourError: state.tours.error[TourDoc.IDS.TEACHER_VIEW],

  }),
  (dispatch) => ({
    onCreateClassroom: (classroom: Classroom) =>
      dispatch(ClassroomsAction.createClassroom({ classroom })),
    onListOwnedClassrooms: () =>
      dispatch(ClassroomsAction.listOwnedClassrooms({})),
    onListChallengesByStudentId: (studentId: string) =>
      dispatch(ClassroomsAction.listChallengesByStudentId({ studentId })),
    onShowClassroomLeaderboard: (classroom: AsyncClassroom) =>
      dispatch(ClassroomsAction.showClassroomLeaderboard({ classroom })),
    onDeleteClassroom: (classroomId: string, classroom: Classroom) =>
      dispatch(ClassroomsAction.deleteClassroom({ classroomId, classroom })),

    onRemoveStudentFromClassroom: (studentId: string, currentClassroom: Classroom) =>
      dispatch(ClassroomsAction.removeStudentFromClassroom({ studentId, currentClassroom })),
  })
)(DashboardWithNavigate);
