import * as React from 'react';
import { styled } from 'styletron-react';
import { connect, Provider } from 'react-redux';
import { DEFAULT_SETTINGS } from '../components/constants/Settings';
import { DARK, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { default as IvyGateClassroom } from "ivygate/dist/src/types/classroomTypes";
import { StyleProps } from '../util/style';
import { faAngleUp, faAngleDown, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../util/LocalizedString';
import { IvygateFileExplorer } from 'ivygate/dist/src';
import store, { State as ReduxState } from '../state';
import tr from '@i18n';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../state/State/Classroom';
import { CreateClassroomDialog } from '../components/Dialog/CreateClassroomDialog';
import Dict from '../util/objectOps/Dict';
import { nativeScrollbarChrome } from '../util/nativeScrollbarChrome';
import { ClassroomsAction, listChallengesByStudentId, deleteClassroom } from 'state/reducer/classrooms';
import { auth } from '../firebase/firebase';
import { User } from 'ivygate/dist/src/types/user';
import Async from 'state/State/Async';
import { InterfaceMode } from 'ivygate/dist/src/types/interface';
import { SimClassroomProject } from 'ivygate/dist/src/types/project';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import ChallengeCompletion, { AsyncChallengeCompletion } from 'state/State/ChallengeCompletion';
import { DeleteDialog } from '../components/Dialog';
import RenameClassroomDialog from '../components/Dialog/RenameClassroomDialog';
import ClassroomLeaderboardsDialog from '../components/Dialog/ClassroomLeaderboardsDialog';
import Challenge from '../components/Challenge';
import { AsyncChallenge } from '../state/State/Challenge';
import { Challenges, ChallengeCompletions } from '../state/State';
import { Project } from 'state/State/Project';
import TourTarget from '../components/Tours/TourTarget';
import { TourRegistry } from '../tours/TourRegistry';
import GuidedTour from '../components/Tours/GuidedTour';
import TourDoc, { getTeacherViewTourStepsForClassroom, TourStep } from '../tours/Tours';
import { completeTour, fetchTourIfNeeded, retakeTour } from '../state/reducer/tours';
import TeacherTabs from '../components/Classrooms/TeacherTabs';
import { TeacherViewOverlayProvider } from '../components/Classrooms/TeacherViewOverlayContext';
import { Card } from '../components/interface/Card';
import CreateAssignmentView from '../components/Classrooms/CreateAssignmentView';
import { FontAwesome } from '../components/FontAwesome';

export interface ClassroomTeacherViewRootRouteParams {
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
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: AsyncClassroom) => void;
  onGetAssignments: (classroomDocId: string) => void;
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
  teacherTabIndex?: number;
  assignmentToEdit?: ClassroomAssignment | null;
  cardContainerVisible?: boolean;
  teacherTourSteps: TourStep[];
  /** Classroom id to spotlight after create (teacher tour: see-created / classroom-users). */
  tourHighlightNewClassroomId?: string;
  /** Assignment title to spotlight in Assignments after publish (teacher tour). */
  tourHighlightAssignmentTitle?: string;
  /** Open rename dialog for this loaded classroom (same ref as card list). */
  renameClassroomTarget?: AsyncClassroom | null;
  /** Tab content (Home / Assignments / …) has at least one modal open. */
  teacherSubviewHasModal?: boolean;
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
  maxWidth: '100vw',
  height: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
  overflowY: 'auto',
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
  margin: '20px 20px 0px 20px',
}));

const ClassroomCardScrollContainer = styled('div', (props: { collapsed: boolean }) => ({
  width: '100%',
  overflow: 'auto',
  height: props.collapsed ? '3%' : '33%',
  ...nativeScrollbarChrome,
}));

const CardWrapper = styled('div', (props: ThemeProps & { selected?: boolean }) => ({
  borderRadius: `${props.theme.itemPadding * 4}px`,
  cursor: 'pointer',
  backgroundColor: props.selected ? props.theme.selectedClassBackground : 'transparent',
  position: 'relative',
}));

const ClassroomCardShell = styled('div', {
  position: 'relative',
  display: 'inline-block',
  verticalAlign: 'top',
});

const ClassroomCardActions = styled('div', (props: { $blur?: boolean }) => ({
  position: 'absolute',
  top: '6px',
  right: '6px',
  zIndex: 6,
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
  filter: props.$blur ? 'blur(5px)' : 'none',
  opacity: props.$blur ? 0.65 : 1,
  pointerEvents: props.$blur ? 'none' : 'auto',
  transition: 'filter 0.2s ease, opacity 0.2s ease',
}));

const ClassroomCardIconBtn = styled('div', (props: ThemeProps & { $danger?: boolean }) => ({
  padding: '6px 8px',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  backgroundColor: 'rgba(0, 0, 0, 0.55)',
  color: props.theme.color,
  fontSize: '0.95em',
  lineHeight: 1,
  userSelect: 'none',
  ':hover': {
    backgroundColor: props.$danger ? 'rgba(200, 48, 48, 0.92)' : 'rgba(80, 130, 210, 0.88)',
    cursor: 'pointer',
  },
}));

const StickyButtonWrap = styled('div', {
  position: 'sticky',
  width: '3%',
  left: '98%',
  zIndex: 2,
});

const ClassroomHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: '3em',
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
  // opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const Icon = styled(FontAwesome, {
  paddingRight: "5px",
  height: "1.5em",
});


export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
  'python': 'customPython',
  'c': 'customCpp',
  'cpp': 'customCpp',
  'plaintext': 'plaintext',
};
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
      leaderboardClassroom: null,
      cardContainerVisible: true,
      teacherTourSteps: getTeacherViewTourStepsForClassroom(props.locale, null, {
        ownedClassroomCount: ClassroomTeacherView.countOwnedClassrooms_(props.classroomList),
      }),
      teacherSubviewHasModal: false,
    };

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

    if (prevProps.selectedClassroom !== this.props.selectedClassroom && this.props.selectedClassroom) {
      this.setState({ currentSelectedClassroom: this.props.selectedClassroom || null });
    }
    // Keep the in-memory selection aligned with Redux (e.g. challenge point overrides update entities only).
    const cur = this.state.currentSelectedClassroom;
    if (cur?.type === Async.Type.Loaded && cur.value.docId) {
      const id = cur.value.docId;
      const fromStore = this.props.classroomList[id];
      if (fromStore && fromStore !== cur) {
        this.setState({ currentSelectedClassroom: fromStore });
      }
    }
    if (prevProps.classroomList !== this.props.classroomList) {
      this.getIvygateClassrooms();
    }
    if (
      prevProps.locale !== this.props.locale ||
      prevProps.classroomList !== this.props.classroomList ||
      prevProps.selectedClassroom !== this.props.selectedClassroom ||
      prevState.currentSelectedClassroom !== this.state.currentSelectedClassroom
    ) {
      this.syncTeacherTourSteps_();
    }
  }

  private computeSyncedLoadedClassroom_(): Classroom | undefined {
    const cur =
      this.state.currentSelectedClassroom ??
      this.props.selectedClassroom ??
      undefined;
    if (!cur || cur.type !== Async.Type.Loaded) return undefined;
    const id = cur.value.docId;
    if (!id) return cur.value;
    const fromStore = this.props.classroomList[id];
    if (fromStore?.type === Async.Type.Loaded) return fromStore.value;
    return cur.value;
  }

  private static countOwnedClassrooms_(classroomList: Props['classroomList']): number {
    if (!classroomList) return 0;
    return Object.values(classroomList).filter(c => c.type === Async.Type.Loaded).length;
  }

  private syncTeacherTourSteps_(): void {
    const classroom = this.computeSyncedLoadedClassroom_();
    const ownedClassroomCount = ClassroomTeacherView.countOwnedClassrooms_(this.props.classroomList);
    const next = getTeacherViewTourStepsForClassroom(this.props.locale, classroom ?? null, {
      ownedClassroomCount,
    });
    const prev = this.state.teacherTourSteps;
    if (
      prev.length === next.length &&
      prev.every((s, i) => s.id === next[i].id && s.placement === next[i].placement)
    ) {
      return;
    }
    this.setState({ teacherTourSteps: next });
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

  private onRequestDeleteClassroomFromCard_ = (e: React.MouseEvent | React.KeyboardEvent, classroom: Classroom) => {
    e.stopPropagation();
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    this.setState({
      showAreYouSureDialog: true,
      deleteObject: { type: 'classroom', name: classroom.classroomId } as IvyGateClassroom,
    });
  };

  private onRequestRenameClassroomFromCard_ = (e: React.MouseEvent | React.KeyboardEvent, asyncClassroom: AsyncClassroom) => {
    e.stopPropagation();
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    this.setState({ renameClassroomTarget: asyncClassroom });
  };

  private onExitRenameClassroomDialog_ = () => {
    this.setState({ renameClassroomTarget: null });
  };

  private onClassroomRenamedFromCard_ = (updated: Classroom) => {
    const prevTarget = this.state.renameClassroomTarget;
    const oldName = prevTarget?.type === Async.Type.Loaded ? prevTarget.value.classroomId : undefined;
    const prevDoc = prevTarget?.type === Async.Type.Loaded ? prevTarget.value.docId : undefined;

    this.props.onListOwnedClassrooms();
    const cur = this.state.currentSelectedClassroom;
    const patch: Partial<State> = { renameClassroomTarget: null };
    if (
      oldName &&
      this.state.tourHighlightNewClassroomId === oldName &&
      prevDoc &&
      updated.docId === prevDoc
    ) {
      patch.tourHighlightNewClassroomId = updated.classroomId;
    }
    if (cur?.type === Async.Type.Loaded && cur.value.docId === updated.docId) {
      this.setState(prev => ({
        ...prev,
        ...patch,
        currentSelectedClassroom: Async.loaded({ brief: {}, value: updated }),
      }));
      return;
    }
    this.setState(prev => ({ ...prev, ...patch }));
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
    this.setState({ showCreateClassroomDialog: false, tourHighlightNewClassroomId: classroomName });
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
    if (!deleteObject) {
      this.setState({ showAreYouSureDialog: false, deleteObject: null });
      return;
    }
    let clearSelectedClassroom = false;
    if (deleteObject.type === "classroom") {
      const deletedId = `${deleteObject.name}`;
      for (const [classroomKey, asyncClassroom] of Object.entries(this.props.classroomList)) {
        if (asyncClassroom.type === Async.Type.Loaded && asyncClassroom.value.classroomId === deletedId) {
          await deleteClassroom(classroomKey, Async.deleting(asyncClassroom));
        }
      }
      const cur = this.state.currentSelectedClassroom;
      if (cur?.type === Async.Type.Loaded && cur.value.classroomId === deletedId) {
        clearSelectedClassroom = true;
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
        this.props.onRemoveStudentFromClassroom(`${deleteObject.userName}`, userClassroom);
      }

    }
    this.props.onListOwnedClassrooms();
    this.setState({
      showAreYouSureDialog: false,
      deleteObject: null,
      ...(clearSelectedClassroom ? { currentSelectedClassroom: null } : {}),
    });
  };

  private onExitDeleteDialog_ = () => {
    this.setState({ showAreYouSureDialog: false, deleteObject: null });
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

    for (const [id, asyncClassroom] of Object.entries(classroomList ?? {})) {

      if (asyncClassroom.type === Async.Type.Loaded) {

        const classroom = asyncClassroom.value;
        // map studentIds to match IvygateFileExplorer's User objects
        const classroomUsers: User[] = Object.values(classroom.studentIds ?? {}).map((studentId) => {
          const studentChallenges = this.challengeCache[selectedStudentId];
          const userProjects: SimClassroomProject[] = studentChallenges
            ? Object.entries(studentChallenges).flatMap(([challengeId, score]) => {
              const asyncChallengeFromStore = this.props.challenges[challengeId];
              if (asyncChallengeFromStore === undefined) {
                return [];
              }
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
              return [
                {
                  projectName: challengeId,
                  projectLanguage: `${score.currentLanguage}`,
                  type: challengeId,
                  code: score.code[score.currentLanguage] ?? '',
                  eventStates: Object.fromEntries(
                    Object.entries(score.eventStates ?? {}).map(([eventName, completed]) => [
                      eventName,
                      { eventName, completed },
                    ])
                  ),
                  challenge: asyncChallenge,
                  challengeCompletion: asyncCompletion,
                },
              ];
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


  private onCloseTour_ = () => {
    void completeTour(this.props.tour, this.props.uid, TourDoc.IDS.TEACHER_VIEW, { step: this.state.currentTourStepIndex });
    this.setState({ tourHighlightNewClassroomId: undefined, tourHighlightAssignmentTitle: undefined });
  };

  private onSkipTour_ = () => {
    void completeTour(this.props.tour, this.props.uid, TourDoc.IDS.TEACHER_VIEW, { dismissed: true });
    this.setState({ tourHighlightNewClassroomId: undefined, tourHighlightAssignmentTitle: undefined });
  };

  private onBackClick_ = (stepIndex: number) => {
    const stepId = this.state.teacherTourSteps[stepIndex]?.id;
    const closeCreateDialog =
      stepId === 'teacher-dashboard' ||
      stepId === 'teacher-classroom-cards-strip' ||
      stepId === 'teacher-create-classroom-card';
    const seeIdx = this.state.teacherTourSteps.findIndex(s => s.id === 'see-created-classroom');
    const clearHighlight = seeIdx >= 0 && stepIndex < seeIdx;

    this.setState(prev => ({
      ...prev,
      currentTourStepIndex: stepIndex,
      ...(closeCreateDialog ? { showCreateClassroomDialog: false } : {}),
      ...(clearHighlight ? { tourHighlightNewClassroomId: undefined } : {}),
    }));
  };

  private onNextClick_ = (stepIndex: number) => {
    const usersIdx = this.state.teacherTourSteps.findIndex(s => s.id === 'classroom-users');
    const clearHighlight = usersIdx >= 0 && stepIndex > usersIdx;
    this.setState({
      currentTourStepIndex: stepIndex,
      ...(clearHighlight ? { tourHighlightNewClassroomId: undefined } : {}),
    });
  };

  private teacherTourTabIndexForStep_(step: TourStep | undefined): number | undefined {
    if (!step?.id) return undefined;
    if (step.id.startsWith('teacher-create-assignment-')) {
      return 1;
    }
    switch (step.id) {
      case 'teacher-tab-home':
        return 0;
      case 'teacher-tab-assignments':
      case 'teacher-assignments-workspace':
      case 'teacher-assignment-in-class-list':
      case 'teacher-assignment-select-row':
      case 'teacher-assignment-see-assigned-challenges':
      case 'teacher-assignment-go-to-challenge':
        return 1;
      case 'teacher-tab-people':
        return 2;
      case 'teacher-tab-grades':
        return 3;
      case 'teacher-tab-leaderboard':
        return 4;
      default:
        return undefined;
    }
  }

  private onGuidedTourStepIndexChange_ = (stepIndex: number) => {
    const step = this.state.teacherTourSteps[stepIndex];
    const tab = this.teacherTourTabIndexForStep_(step);
    const stepId = step?.id;
    const wantCreateAssignmentEditor =
      !!stepId &&
      stepId.startsWith('teacher-create-assignment-') &&
      stepId !== 'teacher-create-assignment-open';
    const patch: Partial<State> = {};
    patch.currentTourStepIndex = stepIndex;
    if (tab !== undefined) {
      patch.teacherTabIndex = tab;
    }
    if (wantCreateAssignmentEditor) {
      if (!this.state.createAssignmentVisible) {
        patch.createAssignmentVisible = true;
      }
    } else {
      if (this.state.createAssignmentVisible) {
        patch.createAssignmentVisible = false;
      }
      if (this.state.assignmentToEdit !== undefined && this.state.assignmentToEdit !== null) {
        patch.assignmentToEdit = undefined;
      }
    }
    const teacherAssignmentSpotlightSteps = new Set([
      'teacher-assignment-in-class-list',
      'teacher-assignment-select-row',
      'teacher-assignment-see-assigned-challenges',
      'teacher-assignment-go-to-challenge',
    ]);
    if ((!stepId || !teacherAssignmentSpotlightSteps.has(stepId)) && this.state.tourHighlightAssignmentTitle !== undefined) {
      patch.tourHighlightAssignmentTitle = undefined;
    }
    if (Object.keys(patch).length > 0) {
      this.setState(prev => ({ ...prev, ...patch }));
    }
  };

  private onContinueTour_ = () => {
    this.setState({ continueTour: true }, () => {
      this.setState({ continueTour: false });
    });
  };

  private onRetakeTour_ = () => {
    void retakeTour(this.props.tour, this.props.uid, TourDoc.IDS.TEACHER_VIEW);
    this.setState({ tourHighlightNewClassroomId: undefined });
  };

  private onTeacherSubviewOverlayDepth_ = (depth: number) => {
    const open = depth > 0;
    if (open !== !!this.state.teacherSubviewHasModal) {
      this.setState({ teacherSubviewHasModal: open });
    }
  };

  private exisitingClassroomCards = () => {
    const { classroomList, theme, locale } = this.props;
    const highlightId = this.state.tourHighlightNewClassroomId;
    const { renameClassroomTarget, showAreYouSureDialog, showCreateClassroomDialog, teacherSubviewHasModal } = this.state;
    const blurCardActionIcons =
      !!teacherSubviewHasModal ||
      renameClassroomTarget?.type === Async.Type.Loaded ||
      showAreYouSureDialog ||
      showCreateClassroomDialog;
    return Object.entries(classroomList ?? {}).map(([id, asyncClassroom]) => {
      if (asyncClassroom.type === Async.Type.Loaded) {
        const classroom = asyncClassroom.value;
        const cardBody = (
          <CardWrapper theme={theme} selected={Async.latestValue(this.state.currentSelectedClassroom)?.classroomId === classroom.classroomId} onClick={() => this.setState({ currentSelectedClassroom: asyncClassroom })}>
            <Card
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
        const deleteLabel = LocalizedString.lookup(tr('Delete classroom'), locale);
        const renameLabel = LocalizedString.lookup(tr('Rename classroom'), locale);
        const card = (
          <ClassroomCardShell>
            {highlightId && classroom.classroomId === highlightId ? (
              <TourTarget registry={this.registry} targetKey="teacher-newest-classroom-card" style={{ display: 'contents' }}>
                {cardBody}
              </TourTarget>
            ) : (
              cardBody
            )}
            <ClassroomCardActions $blur={blurCardActionIcons}>
              <ClassroomCardIconBtn
                theme={theme}
                role="button"
                tabIndex={0}
                title={renameLabel}
                aria-label={renameLabel}
                onClick={(e) => this.onRequestRenameClassroomFromCard_(e, asyncClassroom)}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    this.onRequestRenameClassroomFromCard_(e, asyncClassroom);
                  }
                }}
              >
                <Icon icon={faPen} style={{ paddingRight: 0 }} />
              </ClassroomCardIconBtn>
              <ClassroomCardIconBtn
                theme={theme}
                $danger
                role="button"
                tabIndex={0}
                title={deleteLabel}
                aria-label={deleteLabel}
                onClick={(e) => this.onRequestDeleteClassroomFromCard_(e, classroom)}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    this.onRequestDeleteClassroomFromCard_(e, classroom);
                  }
                }}
              >
                <Icon icon={faTrash} style={{ paddingRight: 0 }} />
              </ClassroomCardIconBtn>
            </ClassroomCardActions>
          </ClassroomCardShell>
        );
        return <React.Fragment key={`${id}-wrapper`}>{card}</React.Fragment>;
      }
      return null;
    })
      .filter(card => card !== null);

  };

  private handleAssignemntAction = (currentSelectedClassroom: AsyncClassroom | null, action: 'edit' | 'create', assignmentToEdit?: ClassroomAssignment) => {
    if (!currentSelectedClassroom) {
      return;
    }
    if (assignmentToEdit && action === 'edit') {
      this.setState({ createAssignmentVisible: true, assignmentToEdit: assignmentToEdit });
    } else if (action === 'create') {
      this.setState({ createAssignmentVisible: true, assignmentToEdit: undefined });
    }
  };

  private onAssignComplete_ = (students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>, assignment: ClassroomAssignment) => {
    const stepId = this.state.teacherTourSteps[this.state.currentTourStepIndex ?? 0]?.id;
    const advanceTeacherTourAfterPublish =
      this.props.tourLoaded &&
      !this.props.tour.completed &&
      stepId === 'teacher-create-assignment-assign';

    this.setState(
      {
        teacherTabIndex: 1,
        ...(advanceTeacherTourAfterPublish ? { tourHighlightAssignmentTitle: assignment.title } : {}),
      },
      () => {
        if (advanceTeacherTourAfterPublish) {
          this.onContinueTour_();
        }
      }
    );
  };

  private onEditComplete_ = (students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>, assignment: ClassroomAssignment) => {
    this.setState({ teacherTabIndex: 1 });
  };

  render() {
    const { props, state } = this;
    const { style, locale } = props;
    const { assignmentToEdit, showAreYouSureDialog, deleteObject, showCreateClassroomDialog, createAssignmentVisible, renameClassroomTarget } = state;
    const theme = DARK;
    const showTour = props.tourLoaded && !props.tour.completed;
    const activeTourStepId =
      showTour ? state.teacherTourSteps[state.currentTourStepIndex ?? 0]?.id : undefined;
    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} tourRegistry={this.registry} onRetakeTour={this.onRetakeTour_} />
        <TourTarget registry={this.registry} targetKey='teacher-dashboard' style={style}>
          {createAssignmentVisible && state.currentSelectedClassroom ? (
            <ClassroomsContainer style={style} theme={theme}>
              <CreateAssignmentView
                onClose={() => this.setState({ createAssignmentVisible: false, teacherTabIndex: 1 })}
                theme={theme}
                classroom={state.currentSelectedClassroom}
                onAssignComplete={this.onAssignComplete_}
                onEditComplete={this.onEditComplete_}
                originalAssignment={assignmentToEdit}
                tourRegistry={this.registry}
                activeTourStepId={activeTourStepId}
              />
            </ClassroomsContainer>) : (
            <TeacherViewOverlayProvider onDepthChange={this.onTeacherSubviewOverlayDepth_}>
              <ClassroomsContainer style={style} theme={theme}>

                {this.state.cardContainerVisible
                  ? (<ClassroomCardScrollContainer collapsed={!this.state.cardContainerVisible}>

                    <TourTarget registry={this.registry} targetKey="teacher-classroom-cards-strip" style={{ display: 'contents' }}>
                      <ClassroomsCardContainer style={style} theme={theme}>
                        <TourTarget registry={this.registry} targetKey="teacher-create-classroom-card" style={{ display: 'contents' }}>
                          <Card
                            onClick={() => this.setState({ showCreateClassroomDialog: true })}
                            title={LocalizedString.lookup(tr('Create New Classroom'), locale)}
                            theme={theme}
                            customheight='150px'
                            customwidth='200px'
                            backgroundPosition={'center top'}
                            custommargin='10px'
                          />
                        </TourTarget>
                        <TourTarget
                          registry={this.registry}
                          targetKey="teacher-classroom-cards-list"
                          style={{ display: 'contents' }}
                        >
                          {this.exisitingClassroomCards()}
                        </TourTarget>
                      </ClassroomsCardContainer>
                    </TourTarget>
                    <StickyButtonWrap>
                      <Icon icon={this.state.cardContainerVisible ? faAngleUp : faAngleDown} onClick={() => this.setState({ cardContainerVisible: !this.state.cardContainerVisible })} />
                    </StickyButtonWrap>
                  </ClassroomCardScrollContainer>) : (
                    <div style={{ height: '3%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <div>{LocalizedString.lookup(tr('See Classroom Cards'), locale)}</div>
                      <Icon icon={faAngleDown} onClick={() => this.setState({ cardContainerVisible: true })} style={{ marginLeft: '10px' }} />
                    </div>
                  )}


                <TeacherTabs theme={theme} tabIndex={this.state.teacherTabIndex ?? 0} currentSelectedClassroom={this.state.currentSelectedClassroom} onAssignmentAction={this.handleAssignemntAction} tourRegistry={this.registry}
                  activeTourStepId={activeTourStepId}
                  tourHighlightAssignmentTitle={this.state.tourHighlightAssignmentTitle}
                />


                {showAreYouSureDialog && deleteObject ? (
                  <DeleteDialog
                    name={tr(
                      deleteObject.type === 'classroom'
                        ? `${deleteObject.name}`
                        : deleteObject.type === 'user'
                          ? `${deleteObject.displayName ?? ''}`
                          : '',
                    )}
                    onClose={this.onExitDeleteDialog_}
                    onAccept={this.onCloseDeleteDialog_}
                    theme={theme}
                  />
                ) : null}
                {renameClassroomTarget?.type === Async.Type.Loaded && (
                  <RenameClassroomDialog
                    theme={theme}
                    classroom={renameClassroomTarget.value}
                    onClose={this.onExitRenameClassroomDialog_}
                    onRenamed={this.onClassroomRenamedFromCard_}
                  />
                )}
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

              </ClassroomsContainer>
            </TeacherViewOverlayProvider>)}

        </TourTarget>

        {showTour && (
          <GuidedTour
            continueTourFlag={this.state.continueTour}
            isOpen={showTour}
            steps={this.state.teacherTourSteps}
            registry={this.registry}
            scrollContainer={this.scrollRef}
            onClose={this.onCloseTour_}
            onSkip={this.onSkipTour_}
            onBackClick={this.onBackClick_}
            onNextClick={this.onNextClick_}
            onStepIndexChange={this.onGuidedTourStepIndexChange_}
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
    selectedClassroom: state.classrooms.selectedClassroom,
    challenges: state.challenges,
    challengeCompletions: state.challengeCompletions,
    tour: state.tours.byId[TourDoc.IDS.TEACHER_VIEW] ?? TourDoc.DEFAULT,
    tourLoaded: !!state.tours.loaded[TourDoc.IDS.TEACHER_VIEW],
    tourLoading: !!state.tours.loading[TourDoc.IDS.TEACHER_VIEW],
    tourError: state.tours.error[TourDoc.IDS.TEACHER_VIEW],

  }),
  (dispatch) => ({
    onGetAssignments: (classroomDocId: string) =>
      dispatch(ClassroomsAction.getAssignments({ classroomDocId })),
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

    onRemoveStudentFromClassroom: (studentId: string, currentClassroom: AsyncClassroom) =>
      dispatch(ClassroomsAction.removeStudentFromClassroom({ studentId, currentClassroom })),
  })
)(DashboardWithNavigate);
