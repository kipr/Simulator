import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';
import { DEFAULT_SETTINGS } from '../components/constants/Settings';
import { DARK, Theme, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';
import { default as IvyGateClassroom } from "ivygate/dist/types/classroomTypes";
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { Ivygate, IvygateFileExplorer } from 'ivygate';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { State as ReduxState } from '../state';
import tr from '@i18n';
import { jsPDF } from "jspdf";
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { withParams } from '../util/withParams';
import db from '../db';
import { createRef } from 'react';
import { AsyncClassroom, Classroom } from '../state/State/Classroom';
import { CreateClassroomDialog } from '../components/Dialog/CreateClassroomDialog';
import Builder from '../db/Builder';
import Dict from '../util/objectOps/Dict';
import { ClassroomsAction, listChallengesByStudentId } from 'state/reducer/classrooms';
import { current } from 'immer';
import { auth } from '../firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { default as IvygateClassroomType } from 'ivygate/dist/types/classroomTypes';
import { User } from 'ivygate/dist/types/user';
import Async from 'state/State/Async';
import { studentInClassroom } from 'state/reducer/classrooms';
import Input from '../components/interface/Input';
import JoinClassDialog from '../components/Dialog/JoinClassDialog';
import { InterfaceMode } from 'ivygate/dist/types/interface';
import { SimClassroomProject } from 'ivygate/dist/types/project';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import { CHALLENGE_LIST, ChallengeName } from '../simulator/definitions/challenges/challengeList';
import config from '../../config.client';
import ChallengeCompletion from 'state/State/ChallengeCompletion';
import ClassroomLeaderboardsDialog from '../components/Dialog/ClassroomLeaderboardsDialog';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClassroomLeaderboard from './ClassroomLeaderboard';
import { DeleteDialog } from '../components/Dialog';


export interface ClassroomTeacherViewRootRouteParams {
  classroomId: string;
  [key: string]: string;

}
const SELFIDENTIFIER = "My Scores!";

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


export interface ClassroomTeacherViewPublicProps extends StyleProps, ThemeProps {
  //params: ClassroomTeacherViewRootRouteParams;
  classroomList: Dict<AsyncClassroom>;
  selectedClassroom: AsyncClassroom | null;
  onCreateClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (classroomId: string, classroom: Classroom) => void;
  onListOwnedClassrooms: () => void;
  onListChallengesByStudentId: (studentId: string) => void;
  onStudentInClassroom: (studentId: LocalizedString) => void;
  onShowClassroomLeaderboard: (classroom: AsyncClassroom) => void;
  onAddStudentToClassroom: (classroomId: string, studentId: LocalizedString) => void;
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
  deleteClassroomId?: string;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomTeacherViewPublicProps & ClassroomTeacherViewPrivateProps & WithNavigateProps;
type State = ClassroomTeacherViewState;

const TitleContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5px',
  fontSize: '1.2em',
  overflow: 'hidden',
  flexWrap: 'nowrap',

}));

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
  // alignItems: 'center',
  // justifyContent: 'center',
  overflow: 'auto',
  // border: '2px solid red',
}));

const ClassroomsTitleContainer = styled('div', (props: ThemeProps) => ({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '20px',
  // border: '2px solid blue',

}));

const ClassroomHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  // alignItems: 'center',
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
  // maxHeight: 'calc(100vh - 100px)',
  flex: 1,
  backgroundColor: 'darkorchid',

}));
const TableHeaderContainer = styled('div', {
  display: 'inline-block',
  transform: 'rotate(-45deg)', // Rotate the text by -45 degrees
  transformOrigin: 'bottom left', // Set the origin for the rotation
  whiteSpace: 'nowrap', // Prevent text wrapping
  width: '50px', // Set the width of the container
});

const UserHeaderContainer = styled('div', {
  display: 'inline-block',
  whiteSpace: 'nowrap', // Prevent text wrapping
  width: '100px', // Set the width of the container
});

const Table = styled('table', {
  width: '80%',
  borderCollapse: 'collapse',
  marginTop: '50px',
  marginLeft: '20px',
  padding: '8px',
  // border: '2px solid green',
});

const TableHeader = styled('th', {
  borderBottom: '2px solid #ddd',
  padding: '8px',
  textAlign: 'center',
  width: '50px',
});
const StyledTableRow = styled('tr', (props: { key: string, self: string, ref: React.Ref<HTMLTableRowElement> }) => ({
  borderBottom: '1px solid #ddd',
  backgroundColor: props.self === SELFIDENTIFIER ? '#555' : '#000', // Highlight the current LeaderboardUser
}));
const TableRow = styled('tr', {
  borderBottom: '1px solid #ddd',
});

const TableCell = styled('td', {
  padding: '6px',
  textAlign: 'center',
});

const ButtonContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
  gap: '10px',
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

    //void this.onLog();
    this.props.onListOwnedClassrooms();
  }

  async componentDidMount() {
    const currentUserId = tr(auth.currentUser?.uid || '');
    const isInClassroom = await studentInClassroom(currentUserId);
    this.setState({ isStudentInClassroom: isInClassroom });
    console.log("Is current LeaderboardUser in any classroom?:", isInClassroom);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.classroomList !== this.props.classroomList) {
      console.log("Classrooms updated → recalculating once");
      this.getIvygateClassrooms();  // this will memoize
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeChallenges) {
      this.unsubscribeChallenges();
    }
  }

  private myScoresRef = createRef<HTMLTableRowElement>();

  private scrollToMyScores = () => {
    if (this.myScoresRef.current) {
      this.myScoresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  private onLog = async () => {
    const res = await db.list('challenge_completion');
    console.log("Challenge completion data:", res);
    const groupData = res.groupData;
    const userData = res.userData;

    let users: Record<string, LeaderboardUser> = {};
    const challenges: Record<string, Challenge> = {};

    for (const [_, attemptedChallenges] of Object.entries(groupData)) {
      for (const [challengeId, challenge] of Object.entries(attemptedChallenges as ChallengeData[])) {
        const challenge = {
          name: tr(challengeId),
          description: tr(challengeId),
        };
        if (!challenges[challengeId]) {
          challenges[challengeId] = challenge;
        }
      }
    }

    interface ChallengeData {
      success: {
        exprStates: {
          completion: boolean;
        };
      };
      failure: {
        exprStates: {
          failure: boolean;
        };
      };

    }

    const challengeCompletion = (challenge: ChallengeData) => (
      (challenge?.success?.exprStates?.completion ?? false) &&
      (!challenge?.failure?.exprStates?.failure ?? false)
    );

    for (const [userId, userChallenges] of Object.entries(groupData)) {
      const LeaderboardUser: LeaderboardUser = {
        id: userId,
        name: userId,
        scores: [],
      };

      for (const [challengeId, challenge] of Object.entries(userChallenges as ChallengeData[])) {
        const score: Score = {
          name: tr(challengeId),
          completed: challengeCompletion(challenge)
        };
        LeaderboardUser.scores.push(score);
      }

      if (!users[userId]) {
        users[userId] = LeaderboardUser;
      }
    }

    users = this.anonomizeUsers(users);


    for (const [userId, userChallenges] of Object.entries(userData)) {
      let LeaderboardUser: LeaderboardUser = {
        id: userId,
        name: SELFIDENTIFIER,
        scores: [],

      };

      // Get anonymous name to display
      const userRecord: Record<string, LeaderboardUser> = { [userId]: LeaderboardUser };
      const altUser = this.anonomizeUsers(userRecord)[userId];
      LeaderboardUser = {
        ...LeaderboardUser,
        altId: altUser?.name
      };

      for (const [challengeId, challenge] of Object.entries(userChallenges as ChallengeData[])) {
        const score: Score = {
          name: tr(challengeId),
          completed: challengeCompletion(challenge)
        };
        LeaderboardUser.scores.push(score);
      }

      if (!users[userId]) {
        users[userId] = LeaderboardUser;
      }
    }


    this.setState({ users, challenges });

    return { users, challenges };
  };
  private getUserChallengeInfo = (user: LocalizedString, classroom: Classroom): Record<string, Score[]> => {
    const scores: Record<string, Score[]> = {};

    console.log("getUserChallengeInfo() for classroom:", classroom.classroomId, "with user:", user);

    return scores;
  }
  private getDefaultChallenges = (): Record<string, Challenge> => {
    const challenges: Record<string, Challenge> = {};
    const suffixes = ['a', 'b', 'c'];

    for (let i = 1; i <= 12; i++) {
      suffixes.forEach((suffix) => {
        const id = `challenge${i}${suffix}`;
        challenges[id] = {
          name: tr(`JBC Challenge ${i}${suffix.toUpperCase()}`),
          description: tr(`Junior Botball Challenge ${i}${suffix.toUpperCase()}: Description for Challenge ${i}${suffix.toUpperCase()}`),
        };
      });
    }

    return challenges;
  };

  private getDefaultUsers = (): Record<string, LeaderboardUser> => {
    const users: Record<string, LeaderboardUser> = {};
    const challengeIds = Object.keys(this.getDefaultChallenges());

    for (let i = 1; i <= 20; i++) {
      const scores: Score[] = [];
      const numChallenges = Math.floor(Math.random() * 10) + 1; // Each LeaderboardUser will complete between 1 and 5 challenges
      const completedChallenges = new Set<string>();

      while (completedChallenges.size < numChallenges) {
        const randomChallengeId = challengeIds[Math.floor(Math.random() * challengeIds.length)];
        if (!completedChallenges.has(randomChallengeId)) {
          completedChallenges.add(randomChallengeId);
          const score: Score = {
            name: this.getDefaultChallenges()[randomChallengeId].name,
            completed: true,
            score: Math.floor(Math.random() * 101), // Random score between 0 and 100
            completionTime: Math.floor(Math.random() * 301) + 100, // Random time between 100 and 400
          };
          scores.push(score);
        }
      }

      users[`LeaderboardUser${i}`] = {
        id: `LeaderboardUser${i}`,
        name: `LeaderboardUser ${i}`,
        scores: scores,
      };

    }

    return users;
  };

  private orderUsersByCompletedChallenges = (users: Record<string, LeaderboardUser>): LeaderboardUser[] => {
    const userArray = Object.values(users);

    userArray.sort((a, b) => {
      const completedChallengesA = a.scores.filter(score => score.completed).length * 100 + a.scores.length;
      const completedChallengesB = b.scores.filter(score => score.completed).length * 100 + b.scores.length;

      return completedChallengesB - completedChallengesA;
    });
    return userArray;
  };

  private anonomizeUsers = (users: Record<string, LeaderboardUser>): Record<string, LeaderboardUser> => {
    const anonomizedUsers: Record<string, LeaderboardUser> = {};

    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
      'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet', 'gold', 'silver', 'bronze', 'maroon', 'tan', 'navy', 'aqua'];
    const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'metal', 'wood', 'ice',
      'shadow', 'spirit', 'void', 'plasma', 'gravity', 'time', 'space', 'aether', 'chaos', 'order'];
    const animals = ['tiger', 'bear', 'wolf', 'eagle', 'shark', 'whale', 'lion', 'panther', 'jaguar',
      'fox', 'owl', 'hawk', 'dolphin', 'rhino', 'hippo', 'giraffe', 'zebra',
      'koala', 'panda', 'leopard', 'lynx', 'bison', 'buffalo', 'camel',
      'raven', 'sparrow', 'swan', 'toucan', 'vulture', 'walrus', 'yak'];



    const stringTo32BitInt = (id: string): number => {
      const FNV_PRIME = 0x01000193; // 16777619
      let hash = 0x811c9dc5; // FNV offset basis

      for (let i = 0; i < id.length; i++) {
        hash ^= id.charCodeAt(i);       // XOR with byte value of character
        hash = (hash * FNV_PRIME) >>> 0; // Multiply by FNV prime and apply unsigned right shift to keep it 32-bit
      }

      return hash >>> 0; // Ensure the result is a positive 32-bit integer
    };

    Object.values(users).forEach((LeaderboardUser) => {
      const hash = Math.abs(stringTo32BitInt(LeaderboardUser.id));
      const color = colors[hash % colors.length];
      const element = elements[hash % elements.length];
      const animal = animals[hash % animals.length];
      const number = hash % 97;

      anonomizedUsers[LeaderboardUser.id] = {
        id: LeaderboardUser.id,
        name: `${color}-${element}-${animal}-${number}`,
        scores: LeaderboardUser.scores
      };
    });

    const nameSet = new Set<string>();
    const duplicateNames: string[] = [];

    Object.values(anonomizedUsers).forEach((LeaderboardUser) => {
      if (nameSet.has(LeaderboardUser.name)) {
        duplicateNames.push(LeaderboardUser.name);
      } else {
        nameSet.add(LeaderboardUser.name);
      }
    });

    const duplicateIds = Object.values(anonomizedUsers).filter(u => duplicateNames.includes(u.name));

    if (duplicateNames.length > 0) {
      console.warn('Duplicate names found after anonymization:', duplicateNames, duplicateIds);
    }

    return anonomizedUsers;
  };

  private customSort = (list: string[]): string[] => {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    const isJbc = (s: string) => /^jbc\d+/i.test(s); // case-insensitive test

    return list.sort((a, b) => {
      const aIsJbc = isJbc(a);
      const bIsJbc = isJbc(b);

      // 1. Prioritize jbc-prefixed items
      if (aIsJbc && !bIsJbc) return -1;
      if (!aIsJbc && bIsJbc) return 1;

      // 2. If both are jbc-prefixed, sort numerically by suffix
      if (aIsJbc && bIsJbc) {
        const numA = parseInt(a.replace(/^jbc/i, ""), 10);
        const numB = parseInt(b.replace(/^jbc/i, ""), 10);
        return numA - numB;
      }

      // 3. Otherwise natural alphabetical sort
      return collator.compare(a, b);
    });
  };

  private getCurrentUser = (): LeaderboardUser => {
    const { users } = this.state;
    let currentUser: LeaderboardUser;
    const tokenManager = db.tokenManager;
    if (tokenManager) {
      const auth_ = tokenManager.auth();
      const currentUserAuth_ = auth_.currentUser;
      currentUser = {
        id: currentUserAuth_.uid,
        name: currentUserAuth_.displayName || 'Unknown',
        scores: Object.values(users).find(u => u.id === currentUserAuth_.uid)?.scores || [],
        altId: Object.values(users).find(u => u.id === currentUserAuth_.uid)?.altId || 'Unknown'
      };

    }


    return currentUser || null;
  };

  private getCurrentUserEmail = (): string | null => {

    const tokenManager = db.tokenManager;
    if (tokenManager) {
      const auth_ = tokenManager.auth();
      const currentUserAuth_ = auth_.currentUser;
      if (currentUserAuth_) {

        return currentUserAuth_.email;
      }
    }
    return null;
  };


  private onAddNewClassroom_ = (classroom: IvyGateClassroom) => {
    console.log('Add new classroom clicked!', classroom);
    this.setState({ showCreateClassroomDialog: true });
  }

  private onDeleteClassroom_ = (classroom: IvygateClassroomType) => {
    console.log('Delete classroom clicked for classroom:', classroom);
    console.log("this.props.selectedClassroom:", this.props.selectedClassroom);
    this.setState({ showAreYouSureDialog: true, deleteClassroomId: classroom.name });

  }
  private onJoinClassroomDialog_ = () => {
    console.log('Join classroom dialog called!');
    this.setState({ showJoinClassroomDialog: true });
  }

  private onSeeLeaderboards = () => {
    this.setState({
      showClassroomLeaderboardSelector: true
    })
  }
  private onCloseClassroomDialog_ = async (classroomName: string, classroomInviteCode: string) => {
    this.props.onCreateClassroom({
      teacherId: auth.currentUser?.uid || '',
      classroomId: classroomName,
      code: { 'en-US': classroomInviteCode },
      studentIds: []
    });
    await this.props.onListOwnedClassrooms();
    this.setState({ showCreateClassroomDialog: false });
  }

  private onCloseClassroomLeaderboardDialog_ = (classroomId: string) => {
    Object.values(this.props.classroomList).forEach((asyncClassroom) => {
      if (asyncClassroom.type === Async.Type.Loaded) {
        const classroom = asyncClassroom.value;
        if (classroom.classroomId === classroomId) {
          this.props.onShowClassroomLeaderboard(asyncClassroom);
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
    for (const [classroomKey, asyncClassroom] of Object.entries(this.props.classroomList)) {
      if (asyncClassroom.type === Async.Type.Loaded && asyncClassroom.value.classroomId === this.state.deleteClassroomId) {
        this.props.onDeleteClassroom(classroomKey, asyncClassroom.value);
      }
    }

    this.setState({ showAreYouSureDialog: false, deleteClassroomId: null });
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
    this.challengeCache[student.userName] = challenges;
    this.getIvygateClassrooms();
    this.setState({
      selectedStudentId: student.userName
    });
  }

  private onProjectSelected = (student: User, project: SimClassroomProject) => {
    console.log("onProjectSelected() student:", student, "project:", project);
  }



  private getClassrooms = (): Classroom[] => {
    const { classroomList } = this.props;
    const classroomList_: Classroom[] = [];

    for (const [id, asyncClassroom] of Object.entries(classroomList)) {
      if (asyncClassroom.type === Async.Type.Loaded) {
        classroomList_.push(asyncClassroom.value);
      }
    }
    console.log("getClassrooms() returning:", classroomList_);
    return classroomList_;
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
    const { classroomList } = this.props;
    const { selectedStudentId } = this.state;
    const ivygateClassrooms = [];

    console.log("updateIvygateClassrooms this.props.classroomList:", classroomList);

    for (const [id, asyncClassroom] of Object.entries(classroomList)) {

      if (asyncClassroom.type === Async.Type.Loaded && classroomList != null) {

        const classroom = asyncClassroom.value;
        // map studentIds to match IvygateFileExplorer's User objects
        const classroomUsers: User[] = classroom.studentIds.map(studentId => {
          const studentChallenges = this.challengeCache[selectedStudentId];
          console.log("updateIvygateClassrooms for studentId:", studentId, "challenges:", studentChallenges);
          const userProjects: SimClassroomProject[] = studentChallenges
            ? Object.entries(studentChallenges).map(([challengeId, score]) => {
              console.log("Mapping user project for challenge:", challengeId, score);
              return {
                projectName: challengeId,
                projectLanguage: `${score.currentLanguage}` as ProgrammingLanguage,
                type: challengeId,
                code: score.code[`${score.currentLanguage}`] || ''
              };
            })
            : [];


          console.log("Mapped userProjects for studentId", studentId, ":", userProjects);

          return {
            userName: studentId["en-US"] || 'Unknown',
            interfaceMode: InterfaceMode.SIMPLE,
            projects: userProjects,
            classroomName: classroom.classroomId
          };
        });

        const ivygateClassroom: IvygateClassroomType = {
          name: classroom.classroomId,
          users: classroomUsers,
          classroomInvitationCode: classroom.code?.["en-US"] || ''
        };

        ivygateClassrooms.push(ivygateClassroom);
      }
    }
    return ivygateClassrooms;
  }



  private getChallengeType(score: Score): ChallengeName | 'default' {
    const name = LocalizedString.lookup(score.name, this.props.locale);
    if (name in CHALLENGE_LIST) {
      return name as ChallengeName;
    }
    return 'default';
  }


  private renderManageClassrooms = () => {
    const { showCreateClassroomDialog, showClassroomLeaderboardSelector } = this.state;
    const { classroomList, style, theme, locale } = this.props;
    const classroomList_ = Object.entries(classroomList).map(([id, asyncClassroom]) => {
      const value = asyncClassroom?.type === Async.Type.Loaded ? asyncClassroom.value : null;
      if (!value) return null;

      return (
        <div key={id} className="classroom-card">
          <h3>{value.classroomId}</h3>
          <p>Invite code: {value.code?.["en-US"]}</p>
          <p>Teacher: {value.teacherId}</p>
        </div>
      );
    });

    return (
      <ManageClassroomsContainer theme={theme} style={style}>
        <IvygateFileExplorer
          config={config}
          propUsers={[]}
          propClassrooms={this.updateIvygateClassrooms()}
          propSettings={{ ...DEFAULT_SETTINGS, classroomView: true }}
          onUserSelected={this.onSelectStudent}
          onProjectSelected={this.onProjectSelected}
          onAddNewClassroom={this.onAddNewClassroom_}
          onDeleteClassroom={this.onDeleteClassroom_}
          theme={DARK}
          style={style}
          locale={'en-US'}
          ivygateLanguageMapping={IVYGATE_LANGUAGE_MAPPING}
        />
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

  private renderClassrooms = () => {
    const users = this.state.users || this.getDefaultUsers();
    const sortedUsers = this.orderUsersByCompletedChallenges(users);
    const challenges = this.state.challenges || this.getDefaultChallenges();

    if (!sortedUsers) return null;

    const userArray = Object.values(sortedUsers);

    const challengeArray = this.customSort(Object.keys(challenges));
    this.getCurrentUser();

    return (
      <Table>
        <thead>
          <tr>
            <TableHeader>
              <UserHeaderContainer>
                Users
              </UserHeaderContainer>
            </TableHeader>
            {challengeArray.map((id) => (
              <TableHeader key={id}>
                <TableHeaderContainer>
                  {challenges[id].name['en-US']}
                </TableHeaderContainer>
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {userArray.map((LeaderboardUser) => (
            <StyledTableRow key={LeaderboardUser.id} self={LeaderboardUser.name} ref={LeaderboardUser.name === SELFIDENTIFIER ? this.myScoresRef : null}>
              <TableCell>{LeaderboardUser.name}</TableCell>
              {challengeArray.map((id) => {
                const userScore = LeaderboardUser.scores.find(score => score.name['en-US'] === challenges[id].name['en-US']);
                return (
                  <TableCell key={id}>
                    {!userScore && '-'}
                    {userScore?.completed && (
                      <>
                        <img src="/static/icons/favicon-32x32.png" alt="Favicon" />
                        {/* <div>Score: {userScore.score ?? '-'}</div>
                        <div>Time: {userScore.completionTime ?? '-'}</div> */}
                      </>
                    )}
                    {userScore && !userScore.completed && (
                      <img src="/static/icons/botguy-bw-trans-32x32.png" alt="Favicon" />
                    )}
                  </TableCell>
                );
              })}
            </StyledTableRow>
          ))}
        </tbody>
      </Table>
    );
  };

  render() {
    const { props, state } = this;
    const { style, locale } = props;
    const { showAreYouSureDialog, deleteClassroomId } = state;
    const theme = DARK;
    const currentUser = this.getCurrentUser();
    const currentUserEmail = this.getCurrentUserEmail();


    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ClassroomsContainer style={style} theme={theme}>
          <ClassroomsTitleContainer style={style} theme={theme}>
            <h1>Classrooms - Teacher View</h1>
            <Button theme={theme} onClick={this.onSeeLeaderboards}>
              See Classroom Leaderboards
            </Button>
            <ClassroomHeaderContainer style={style} theme={theme}>
              {this.renderManageClassrooms()}
              {showAreYouSureDialog && (
                <DeleteDialog
                  name={tr(deleteClassroomId)}
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

  }),
  (dispatch) => ({
    onCreateClassroom: (classroom) =>
      dispatch(ClassroomsAction.createClassroom({ classroomId: crypto.randomUUID(), classroom })),
    onListOwnedClassrooms: () =>
      dispatch(ClassroomsAction.listOwnedClassrooms({})),
    onListChallengesByStudentId: (studentId: string) =>
      dispatch(ClassroomsAction.listChallengesByStudentId({ studentId })),
    onStudentInClassroom: (studentId: LocalizedString) =>
      dispatch(ClassroomsAction.studentInClassroom({ studentId })),
    onShowClassroomLeaderboard: (classroom: AsyncClassroom) =>
      dispatch(ClassroomsAction.showClassroomLeaderboard({ classroom })),
    onAddStudentToClassroom: (classroomId: string, studentId: LocalizedString) =>
      dispatch(ClassroomsAction.addStudentToClassroom({ classroomId, studentId })),
    onDeleteClassroom: (classroomId: string, classroom) =>
      dispatch(ClassroomsAction.deleteClassroom({ classroomId, classroom })),
  })
)(DashboardWithNavigate);
