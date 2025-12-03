import * as React from 'react';
import { styled } from 'styletron-react';
import { connect, Provider } from 'react-redux';
import { DEFAULT_SETTINGS } from '../components/constants/Settings';
import { DARK, Theme, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { default as IvyGateClassroom } from "ivygate/dist/types/classroomTypes";
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { IvygateFileExplorer } from 'ivygate';
import { State as ReduxState } from '../state';
import tr from '@i18n';
import { jsPDF } from "jspdf";
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { withParams } from '../util/withParams';
import db from '../db';
import { createRef } from 'react';
import { AsyncClassroom, Classroom } from '../state/State/Classroom';
import { CreateClassroomDialog } from '../components/Dialog/CreateClassroomDialog';
import Dict from '../util/objectOps/Dict';
import { ClassroomsAction, listChallengesByStudentId } from 'state/reducer/classrooms';
import { auth } from '../firebase/firebase';
import { default as IvygateClassroomType } from 'ivygate/dist/types/classroomTypes';
import { User } from 'ivygate/dist/types/user';
import Async from 'state/State/Async';
import { InterfaceMode } from 'ivygate/dist/types/interface';
import { SimClassroomProject } from 'ivygate/dist/types/project';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import { CHALLENGE_LIST, ChallengeName } from '../simulator/definitions/challenges/challengeList';
import config from '../../config.client';
import ChallengeCompletion, { AsyncChallengeCompletion } from 'state/State/ChallengeCompletion';
import { DeleteDialog } from '../components/Dialog';
import ClassroomLeaderboardsDialog from '../components/Dialog/ClassroomLeaderboardsDialog';
import Challenge from '../components/Challenge';
import store from '../state';
import { AsyncChallenge } from '../state/State/Challenge';
import { ChallengeBrief } from '../state/State/Challenge';
import rawChallenge from '../simulator/definitions/challenges/jbc0-Drive-Straight';
import { Challenges, ChallengeCompletions } from '../state/State';
export interface ClassroomTeacherViewRootRouteParams {
  classroomId: string;
  [key: string]: string;

}
const SELFIDENTIFIER = "My Scores!";

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
  selectedClassroom: AsyncClassroom | null;
  onCreateClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (classroomId: string, classroom: Classroom) => void;
  onListOwnedClassrooms: () => void;
  onListChallengesByStudentId: (studentId: string) => void;
  onStudentInClassroom: (studentId: LocalizedString) => void;
  onShowClassroomLeaderboard: (classroom: AsyncClassroom) => void;
  onAddStudentToClassroom: (classroomId: string, studentId: LocalizedString) => void;
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: Classroom) => void;
}

interface ClassroomTeacherViewPrivateProps {
  locale: LocalizedString.Language;
}

interface ClassroomTeacherViewState {
  selectedStudentId: string;
  leaderboardClassroom: AsyncClassroom | null;
  users: Record<string, LeaderboardUser>;
  challenges: Record<string, Challenge>;
  showCreateClassroomDialog: boolean;
  showJoinClassroomDialog: boolean;
  showClassroomLeaderboardSelector: boolean;
  showSelectedClassroomLeaderboard: boolean;
  showAreYouSureDialog: boolean;
  isStudentInClassroom?: boolean;
  deleteObject?: IvygateClassroomType | User | null;
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

const ClassroomHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: '3em',
  backgroundColor: 'darkred',
  width: '90vw'

}));

const ManageClassroomsContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  width: '100%',
  flex: 1,
  height: '100%',
  backgroundColor: 'darkorchid',

}));
const TableHeaderContainer = styled('div', {
  display: 'inline-block',
  transform: 'rotate(-45deg)',
  transformOrigin: 'bottom left',
  whiteSpace: 'nowrap',
  width: '50px',
});

const UserHeaderContainer = styled('div', {
  display: 'inline-block',
  whiteSpace: 'nowrap',
  width: '100px',
});

const Table = styled('table', {
  width: '80%',
  borderCollapse: 'collapse',
  marginTop: '50px',
  marginLeft: '20px',
  padding: '8px',
});

const TableHeader = styled('th', {
  borderBottom: '2px solid #ddd',
  padding: '8px',
  textAlign: 'center',
  width: '50px',
});
const StyledTableRow = styled('tr', (props: { key: string, self: string, ref: React.Ref<HTMLTableRowElement> }) => ({
  borderBottom: '1px solid #ddd',
  backgroundColor: props.self === SELFIDENTIFIER ? '#555' : '#000',
}));

const TableCell = styled('td', {
  padding: '6px',
  textAlign: 'center',
});

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
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStudentId: '',
      users: {},
      challenges: {},
      showCreateClassroomDialog: false,
      isStudentInClassroom: null as boolean | null,
      showJoinClassroomDialog: false,
      showClassroomLeaderboardSelector: false,
      showSelectedClassroomLeaderboard: false,
      showAreYouSureDialog: false,
      leaderboardClassroom: null
    };

    this.props.onListOwnedClassrooms();
  }


  componentDidUpdate(prevProps) {
    console.log("ClassroomTeacherView componentDidUpdate prevProps: ", prevProps);
    console.log("ClassroomTeacherView componentDidUpdate props: ", this.props);

    if (prevProps.classroomList !== this.props.classroomList) {
      console.log("Classrooms updated → recalculating once");
      this.getIvygateClassrooms();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeChallenges) {
      this.unsubscribeChallenges();
    }
  }


  private onAddNewClassroom_ = (classroom: IvyGateClassroom) => {
    console.log('Add new classroom clicked!', classroom);
    this.setState({ showCreateClassroomDialog: true });
  }

  private onDeleteClassroom_ = (classroom: IvygateClassroomType) => {
    console.log('Delete classroom clicked for classroom:', classroom);
    console.log("this.props.selectedClassroom:", this.props.selectedClassroom);
    this.setState({ showAreYouSureDialog: true, deleteObject: classroom });

  }

  private onDeleteUser_ = (user: User) => {
    console.log('Delete user clicked for user:', user);
    this.setState({ showAreYouSureDialog: true, deleteObject: user });
  }

  private onSeeLeaderboards = () => {
    this.setState({
      showClassroomLeaderboardSelector: true
    })
  }
  private onCloseClassroomDialog_ = async (teacherDisplayName: string, classroomName: string, classroomInviteCode: string) => {
    this.props.onCreateClassroom({
      teacherId: auth.currentUser?.uid || '',
      classroomId: classroomName,
      code: classroomInviteCode,
      studentIds: {},
      docId: '',
      type: 'classroom',
      teacherDisplayName: teacherDisplayName
    });
    await this.props.onListOwnedClassrooms();
    this.setState({ showCreateClassroomDialog: false });
  }

  private onCloseClassroomLeaderboardDialog_ = (classroomId: string) => {
    Object.values(this.props.classroomList).forEach((asyncClassroom) => {
      if (asyncClassroom.type === Async.Type.Loaded) {
        const classroom = asyncClassroom.value;
        if (classroom.classroomId === classroomId) {
          //this.props.onShowClassroomLeaderboard(asyncClassroom);
          this.props.navigate(`/classrooms/${classroomId}`);
          this.setState({
            leaderboardClassroom: asyncClassroom, showSelectedClassroomLeaderboard: true,
            showClassroomLeaderboardSelector: false
          });
        }
      }
    });

  }

  private onCloseDeleteDialog_ = () => {
    const { deleteObject } = this.state;
    console.log("onCloseDeleteDialog_ state:", this.state);
    console.log("onCloseDeleteDialog_ props.classroomList:", this.props.classroomList);
    console.log("onCloseDeleteDialog_ state.deleteObject:", this.state.deleteObject);
    if (deleteObject.type === "classroom") {
      for (const [classroomKey, asyncClassroom] of Object.entries(this.props.classroomList)) {
        if (asyncClassroom.type === Async.Type.Loaded && asyncClassroom.value.classroomId === `${deleteObject.name}`) {
          this.props.onDeleteClassroom(classroomKey, asyncClassroom.value);
        }
      }
    }
    else if (deleteObject.type === "user") {
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

      //this.props.onRemoveStudentFromClassroom(`${deleteObject.userName}`,);

    }
    this.props.onListOwnedClassrooms();
    this.setState({ showAreYouSureDialog: false, deleteObject: null });
  }

  private onExitDeleteDialog_ = () => {
    this.setState({ showAreYouSureDialog: false });
  }

  private onExitClassLeaderboardsDialog_ = () => {
    this.setState({ showClassroomLeaderboardSelector: false });
  }

  private onExitCreateClassroomDialog_ = () => {
    this.setState({ showCreateClassroomDialog: false });
  }

  private onSelectStudent = async (student: User) => {
    if (this.challengeCache[student.userName]) {
      this.setState({
        selectedStudentId: student.userName
      });
      return;
    }


    const challenges = await listChallengesByStudentId(student.userName);
    console.log("onSelectStudent() fetched challenges for student:", student, "challenges:", challenges);
    this.challengeCache[student.userName] = challenges;
    this.getIvygateClassrooms();
    this.setState({
      selectedStudentId: student.userName
    });
  }

  private onProjectSelected = (student: User, project: SimClassroomProject) => {
    console.log("onProjectSelected() student:", student, "project:", project);
  }

  private onClassroomSelected_ = (classroom: IvygateClassroomType) => {
    console.log("onClassroomSelected_() classroom:", classroom);
  }



  private memoIvygateClassrooms: IvygateClassroomType[] | null = null;
  private memoSource: any = null;

  private getIvygateClassrooms = () => {
    const { classroomList } = this.props;

    if (this.memoSource === classroomList && this.memoIvygateClassrooms !== null) {
      console.log("Returning memoized Ivygate classrooms:", this.memoIvygateClassrooms);
      return this.memoIvygateClassrooms;
    }

    this.memoSource = classroomList;
    this.memoIvygateClassrooms = this.updateIvygateClassrooms();
    return this.memoIvygateClassrooms;
  }


  private updateIvygateClassrooms = (): IvygateClassroomType[] => {
    const { classroomList, locale } = this.props;
    const { selectedStudentId } = this.state;
    const ivygateClassrooms = [];

    console.log("updateIvygateClassrooms this.props.classroomList:", classroomList);

    for (const [id, asyncClassroom] of Object.entries(classroomList)) {

      if (asyncClassroom.type === Async.Type.Loaded && classroomList != null) {

        const classroom = asyncClassroom.value;
        // map studentIds to match IvygateFileExplorer's User objects
        const classroomUsers: User[] = Object.values(classroom.studentIds).map((studentId) => {
          console.log("updateIvygateClassrooms mapping studentId:", studentId);
          const studentChallenges = this.challengeCache[selectedStudentId];
          console.log("updateIvygateClassrooms for studentId:", studentId, "challenges:", studentChallenges);
          const userProjects: SimClassroomProject[] = studentChallenges
            ? Object.entries(studentChallenges).map(([challengeId, score]) => {
              console.log("Mapping challengeId:", challengeId, "with score:", score);

              const asyncChallengeFromStore = this.props.challenges[challengeId] as AsyncChallenge;
              const asyncChallenge: AsyncChallenge = asyncChallengeFromStore;
              console.log("asyncChallengeFromStore:", asyncChallengeFromStore);
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
              }
              console.log("asyncChallengeCompletion:", asyncCompletion);
              return {
                projectName: challengeId,
                projectLanguage: `${score.currentLanguage}` as ProgrammingLanguage,
                type: challengeId,
                code: score.code[`${score.currentLanguage}`] || '',
                eventStates: score.eventStates,
                challenge: asyncChallenge,
                challengeCompletion: asyncCompletion,
              };
            })
            : [];


          console.log("Mapped userProjects for studentId", studentId, ":", userProjects);

          return {
            userName: studentId.id || 'Unknown',
            interfaceMode: InterfaceMode.SIMPLE,
            projects: userProjects,
            classroomName: classroom.classroomId,
            displayName: studentId.displayName ? studentId.displayName : 'Unknown',
            type: 'user',

          };

        });

        const ivygateClassroom: IvygateClassroomType = {
          name: classroom.classroomId,
          users: classroomUsers,
          classroomInvitationCode: classroom.code,
          type: 'classroom'
        };

        ivygateClassrooms.push(ivygateClassroom);
      }
    }
    return ivygateClassrooms;
  }


  private renderManageClassrooms = () => {
    const { showCreateClassroomDialog, showClassroomLeaderboardSelector } = this.state;
    const { classroomList, style, theme, locale } = this.props;

    return (
      <ManageClassroomsContainer theme={theme} style={style}>
        <Provider store={store}>
          <IvygateFileExplorer
            ChallengeComponent={Challenge}
            config={config}
            propUsers={[]}
            propClassrooms={this.updateIvygateClassrooms()}
            propSettings={{ ...DEFAULT_SETTINGS, classroomView: true }}
            onUserSelected={this.onSelectStudent}
            onProjectSelected={this.onProjectSelected}
            onAddNewClassroom={this.onAddNewClassroom_}
            onDeleteClassroom={this.onDeleteClassroom_}
            onDeleteUser={this.onDeleteUser_}
            onClassroomSelected={this.onClassroomSelected_}
            theme={DARK}
            style={style}
            locale={'en-US'}
            ivygateLanguageMapping={IVYGATE_LANGUAGE_MAPPING}
          />
        </Provider>
        {
          showCreateClassroomDialog && (
            <CreateClassroomDialog
              userName={''}
              onClose={this.onExitCreateClassroomDialog_}
              onCloseClassroomDialog={this.onCloseClassroomDialog_}
              theme={DARK}
              locale={'en-US'}
              onLocaleChange={function (locale: LocalizedString.Language): void {
                throw new Error('Function not implemented.');
              }}
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

    )

  }



  render() {
    const { props, state } = this;
    const { style, locale } = props;
    const { showAreYouSureDialog, deleteObject } = state;
    const theme = DARK;
    console.log("Rendering ClassroomTeacherView classroomList:", this.props.classroomList);

    console.log("Delete object in state:", deleteObject);
    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ClassroomsContainer style={style} theme={theme}>
          <ClassroomsTitleContainer style={style} theme={theme}>
            <h1>Classrooms - Teacher View</h1>
            {this.props.classroomList && Object.keys(this.props.classroomList).length > 0 && (
              <Button theme={theme} onClick={this.onSeeLeaderboards}>
                See Classroom Leaderboards
              </Button>)}
            <ClassroomHeaderContainer style={style} theme={theme}>
              {this.renderManageClassrooms()}
              {showAreYouSureDialog && (
                <DeleteDialog
                  name={tr(deleteObject && deleteObject.type === "classroom" ? `${deleteObject.name}` : deleteObject && deleteObject.type === "user" ? `${deleteObject.displayName}` : '')}
                  onClose={this.onExitDeleteDialog_}
                  onAccept={this.onCloseDeleteDialog_}
                  theme={theme}>

                </DeleteDialog>)}

            </ClassroomHeaderContainer>

          </ClassroomsTitleContainer>

        </ClassroomsContainer>
      </PageContainer>
    );
  }
}

const DashboardWithNavigate = withNavigate(ClassroomTeacherView);

export default connect(
  (state: ReduxState) => ({
    classroomList: state.classrooms.entities,
    challenges: state.challenges,
    challengeCompletions: state.challengeCompletions,

  }),
  (dispatch) => ({
    onCreateClassroom: (classroom) =>
      dispatch(ClassroomsAction.createClassroom({ classroomId: crypto.randomUUID(), classroom })),
    onListOwnedClassrooms: () =>
      dispatch(ClassroomsAction.listOwnedClassrooms({})),
    onListChallengesByStudentId: (studentId: string) =>
      dispatch(ClassroomsAction.listChallengesByStudentId({ studentId })),
    onShowClassroomLeaderboard: (classroom: AsyncClassroom) =>
      dispatch(ClassroomsAction.showClassroomLeaderboard({ classroom })),
    onDeleteClassroom: (classroomId: string, classroom) =>
      dispatch(ClassroomsAction.deleteClassroom({ classroomId, classroom })),

    onRemoveStudentFromClassroom: (studentId: string, currentClassroom: Classroom) =>
      dispatch(ClassroomsAction.removeStudentFromClassroom({ studentId, currentClassroom })),
  })
)(DashboardWithNavigate);
