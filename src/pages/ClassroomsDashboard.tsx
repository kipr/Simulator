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
import Builder from '../db/Builder';
import Dict from '../util/objectOps/Dict';
import { ClassroomsAction } from 'state/reducer/classrooms';
import { current } from 'immer';
import { auth } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { default as IvygateClassroomType } from 'ivygate/dist/types/classroomTypes';
import Async from 'state/State/Async';
import { studentInClassroom } from 'state/reducer/classrooms';
import Input from '../components/interface/Input';
import JoinClassDialog from '../components/Dialog/JoinClassDialog';
import { InterfaceMode } from 'ivygate/dist/types/interface';

export interface ClassroomsDashboardRootRouteParams {
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
}

interface User {
  id: string;
  name: string;
  scores: Score[];
  src?: string;
  backgroundColor?: string;
  altId?: string;
}

export interface ClassroomsDashboardPublicProps extends StyleProps, ThemeProps {
  params: ClassroomsDashboardRootRouteParams;
  classrooms: Dict<AsyncClassroom>;
  onCreateClassroom: (classroom: Classroom) => void;
  onListOwnedClassrooms: (teacherId: string) => void;
  onStudentInClassroom: (studentId: LocalizedString) => void;
  onAddStudentToClassroom: (classroomId: string, studentId: LocalizedString) => void;
}

interface ClassroomsDashboardPrivateProps {
  locale: LocalizedString.Language;
}

interface ClassroomsDashboardState {
  selected: string;
  users: Record<string, User>;
  challenges: Record<string, Challenge>;
  showCreateClassroomDialog: boolean;
  showJoinClassroomDialog: boolean;
  isStudentInClassroom?: boolean;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomsDashboardPublicProps & ClassroomsDashboardPrivateProps;
type State = ClassroomsDashboardState;

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
  width: '60vw'
}));

const ManageClassroomsContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  width: '100%',
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
  backgroundColor: props.self === SELFIDENTIFIER ? '#555' : '#000', // Highlight the current user
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


class ClassroomsDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: '',
      users: {},
      challenges: {},
      showCreateClassroomDialog: false,
      isStudentInClassroom: null as boolean | null,
      showJoinClassroomDialog: false
    };

    void this.onLog();
    this.props.onListOwnedClassrooms(auth.currentUser?.uid || '');
  }

  async componentDidMount() {
    const currentUserId = tr(auth.currentUser?.uid || '');
    const isInClassroom = await studentInClassroom(currentUserId);
    this.setState({ isStudentInClassroom: isInClassroom });
    console.log("Is current user in any classroom?:", isInClassroom);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomsDashboardState>, snapshot?: any): void {
    if (prevProps.classrooms !== this.props.classrooms) {
      console.log("Classrooms updated:", this.props.classrooms);
      const ivygateClasses = this.createIvygateClassrooms();
      console.log("Converted Ivygate Classrooms:", ivygateClasses);
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
    const groupData = res.groupData;
    const userData = res.userData;

    let users: Record<string, User> = {};
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
      const user: User = {
        id: userId,
        name: userId,
        scores: [],
      };

      for (const [challengeId, challenge] of Object.entries(userChallenges as ChallengeData[])) {
        const score: Score = {
          name: tr(challengeId),
          completed: challengeCompletion(challenge)
        };
        user.scores.push(score);
      }

      if (!users[userId]) {
        users[userId] = user;
      }
    }

    users = this.anonomizeUsers(users);


    for (const [userId, userChallenges] of Object.entries(userData)) {
      let user: User = {
        id: userId,
        name: SELFIDENTIFIER,
        scores: [],

      };

      // Get anonymous name to display
      const userRecord: Record<string, User> = { [userId]: user };
      const altUser = this.anonomizeUsers(userRecord)[userId];
      user = {
        ...user,
        altId: altUser?.name
      };

      for (const [challengeId, challenge] of Object.entries(userChallenges as ChallengeData[])) {
        const score: Score = {
          name: tr(challengeId),
          completed: challengeCompletion(challenge)
        };
        user.scores.push(score);
      }

      if (!users[userId]) {
        users[userId] = user;
      }
    }


    this.setState({ users, challenges });

    return { users, challenges };
  };

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

  private getDefaultUsers = (): Record<string, User> => {
    const users: Record<string, User> = {};
    const challengeIds = Object.keys(this.getDefaultChallenges());

    for (let i = 1; i <= 20; i++) {
      const scores: Score[] = [];
      const numChallenges = Math.floor(Math.random() * 10) + 1; // Each user will complete between 1 and 5 challenges
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

      users[`user${i}`] = {
        id: `user${i}`,
        name: `User ${i}`,
        scores: scores,
      };

    }

    return users;
  };

  private orderUsersByCompletedChallenges = (users: Record<string, User>): User[] => {
    const userArray = Object.values(users);

    userArray.sort((a, b) => {
      const completedChallengesA = a.scores.filter(score => score.completed).length * 100 + a.scores.length;
      const completedChallengesB = b.scores.filter(score => score.completed).length * 100 + b.scores.length;

      return completedChallengesB - completedChallengesA;
    });
    return userArray;
  };

  private anonomizeUsers = (users: Record<string, User>): Record<string, User> => {
    const anonomizedUsers: Record<string, User> = {};

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

    Object.values(users).forEach((user) => {
      const hash = Math.abs(stringTo32BitInt(user.id));
      const color = colors[hash % colors.length];
      const element = elements[hash % elements.length];
      const animal = animals[hash % animals.length];
      const number = hash % 97;

      anonomizedUsers[user.id] = {
        id: user.id,
        name: `${color}-${element}-${animal}-${number}`,
        scores: user.scores
      };
    });

    const nameSet = new Set<string>();
    const duplicateNames: string[] = [];

    Object.values(anonomizedUsers).forEach((user) => {
      if (nameSet.has(user.name)) {
        duplicateNames.push(user.name);
      } else {
        nameSet.add(user.name);
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

  private getCurrentUser = (): User => {
    const { users } = this.state;
    let currentUser: User;
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

  private onJoinClassroomDialog_ = () => {
    console.log('Join classroom dialog called!');
    this.setState({ showJoinClassroomDialog: true });
  }

  private onCloseClassroomDialog_ = async (classroomName: string, classroomInviteCode: string) => {
    console.log('Close classroom dialog called with name:', classroomName, 'and invite code:', classroomInviteCode);
    this.props.onCreateClassroom({
      teacherId: this.getCurrentUser.name,
      classroomId: classroomName,
      code: { 'en-US': classroomInviteCode },
      studentIds: []
    });

    await this.props.onListOwnedClassrooms(auth.currentUser?.uid || '');
    console.log("Current User Name:", auth.currentUser?.uid);
    console.log("Owned Classrooms:", this.props.classrooms);

    this.setState({ showCreateClassroomDialog: false });
  }

  private onCloseJoinClassroomDialog_ = async (joinedClassroom: Classroom) => {
    console.log('Close join classroom dialog called with classroom:', joinedClassroom);
    await this.props.onAddStudentToClassroom(
      joinedClassroom.classroomId,
      tr(auth.currentUser?.uid || '')
    );

    this.setState({ showJoinClassroomDialog: false, isStudentInClassroom: true });
  }
  private createIvygateClassrooms = (): IvygateClassroomType[] => {

    const { classrooms } = this.props;
    console.log("createIvygateClassrooms() Current classrooms:", classrooms);
    const ivygateClassrooms = [];

    for (const [id, asyncClassroom] of Object.entries(classrooms)) {
      if (asyncClassroom.type === Async.Type.Loaded) {
        const classroom = asyncClassroom.value;
        const ivygateClassroom: IvygateClassroomType = {
          name: classroom.classroomId,
          users: [], // Populate with actual users if available
          classroomInvitationCode: classroom.code?.["en-US"] || ''
        };

        ivygateClassrooms.push(ivygateClassroom);
      }
    }
    return ivygateClassrooms;
  }


  private renderMyClassroom = () => {
    const { isStudentInClassroom } = this.state;


    return (

      <div>
        <h2>My Classroom</h2>

        {isStudentInClassroom ? (
          <p>You are enrolled in a classroom.</p>
        ) : (
          <div>
            <p>You are not enrolled in any classroom.</p>

            <Button theme={DARK} onClick={this.onJoinClassroomDialog_}>
              Join Class
            </Button>
            {this.state.showJoinClassroomDialog && (
              <JoinClassDialog
                onClose={function (): void {
                  throw new Error('Function not implemented.');
                }}
                locale={'en-US'}
                onJoinClassDialogClose={this.onCloseJoinClassroomDialog_}
                theme={DARK}

              />
            )}
          </div>
        )}


      </div>
    )

  }


  private renderManageClassrooms = () => {
    const { showCreateClassroomDialog } = this.state;
    const { classrooms, style, theme } = this.props;
    const classroomList = Object.entries(classrooms).map(([id, asyncClassroom]) => {
      const value = asyncClassroom?.type === Async.Type.Loaded ? asyncClassroom.value : null;
      if (!value) return null; // skip unloaded ones

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
        <h2>Manage Classrooms</h2>
        <IvygateFileExplorer
          propUsers={[]}
          propClassrooms={this.createIvygateClassrooms()}
          propSettings={{ ...DEFAULT_SETTINGS, classroomView: true }}
          onAddNewClassroom={this.onAddNewClassroom_}
          theme={DARK}
          locale={'en-US'}
        />
        {
          showCreateClassroomDialog && (
            <CreateClassroomDialog
              userName={''}
              onClose={function (): void {
                throw new Error('Function not implemented.');
              }}
              onCloseClassroomDialog={this.onCloseClassroomDialog_}
              theme={DARK}
              locale={'en-US'}
              onLocaleChange={function (locale: LocalizedString.Language): void {
                throw new Error('Function not implemented.');
              }}
            />
          )}

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
          {userArray.map((user) => (
            <StyledTableRow key={user.id} self={user.name} ref={user.name === SELFIDENTIFIER ? this.myScoresRef : null}>
              <TableCell>{user.name}</TableCell>
              {challengeArray.map((id) => {
                const userScore = user.scores.find(score => score.name['en-US'] === challenges[id].name['en-US']);
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
    const { selected } = state;
    const theme = DARK;
    const currentUser = this.getCurrentUser();
    const currentUserEmail = this.getCurrentUserEmail();


    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ClassroomsContainer style={style} theme={theme}>
          <ClassroomsTitleContainer style={style} theme={theme}>
            <h1>Classrooms</h1>
            <ClassroomHeaderContainer style={style} theme={theme}>
              {this.renderMyClassroom()}
              {this.renderManageClassrooms()}
            </ClassroomHeaderContainer>

          </ClassroomsTitleContainer>
        </ClassroomsContainer>
      </PageContainer>
    );
  }
}

export default connect(
  (state: ReduxState) => ({
    teacherId: auth.currentUser?.uid || '',
    classrooms: state.classrooms,
  }),
  (dispatch) => ({
    onStudentInClassroom: (studentId: LocalizedString) =>
      dispatch(ClassroomsAction.studentInClassroom({ studentId })),
    onAddStudentToClassroom: (classroomId: string, studentId: LocalizedString) => {
      console.log('Dispatching addStudentToClassroom', { classroomId, studentId });
      dispatch(ClassroomsAction.addStudentToClassroom({ classroomId, studentId }))
    },
    onListOwnedClassrooms: (teacherId: string) =>
      dispatch(ClassroomsAction.listOwnedClassrooms({ teacherId })),
    onCreateClassroom: (classroom: Classroom) =>
      dispatch(ClassroomsAction.createClassroom({
        classroomId: crypto.randomUUID(), // will be replaced by backend
        classroom,
      })),


  })
)(ClassroomsDashboard);
