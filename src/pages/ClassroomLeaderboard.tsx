import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { DARK, ThemeProps } from '../components/constants/theme';
import { Card } from '../components/interface/Card';
import MainMenu from '../components/MainMenu';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';

import { State as ReduxState } from '../state';
import tr from '@i18n';
import { jsPDF } from "jspdf";

import db from '../db';
import { createRef } from 'react';
import { AsyncClassroom } from 'state/State/Classroom';
import Async from 'state/State/Async';
import { ClassroomsAction, getAllStudentsClassroomChallenges } from 'state/reducer/classrooms';

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

export interface ClassroomLeaderboardPublicProps extends StyleProps, ThemeProps {
  onClearSelectedClassroom: () => void;
}

interface ClassroomLeaderboardPrivateProps {
  locale: LocalizedString.Language;
  classroom: AsyncClassroom;
}

interface ClassroomLeaderboardState {
  selected: string;
  users: Record<string, User>;
  challenges: Record<string, Challenge>;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomLeaderboardPublicProps & ClassroomLeaderboardPrivateProps;
type State = ClassroomLeaderboardState;

const PageContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const ClassroomLeaderboardContainer = styled("div", (props: ThemeProps) => ({
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

const ClassroomLeaderboardTitleContainer = styled('div', {
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '20px',
  // border: '2px solid blue',
});

const UserInfoContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
});

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


class ClassroomLeaderboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: '',
      users: {},
      challenges: {},
    };

    void this.onLog();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomLeaderboardState>, snapshot?: any): void {
    if (prevProps.classroom !== this.props.classroom) {
      console.log("Classroom updated! New classroom:", this.props.classroom);
    }
  }

  componentWillUnmount(): void {
    this.props.onClearSelectedClassroom();
  }
  private myScoresRef = createRef<HTMLTableRowElement>();

  private scrollToMyScores = () => {
    if (this.myScoresRef.current) {
      this.myScoresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  private onLog = async () => {
    const { locale } = this.props;
    const res = await db.list('challenge_completion');
    // const groupData = res.groupData;
    // const userData = res.userData;

    const normalizedStudentIdList = this.props.classroom.type === Async.Type.Loaded ? this.props.classroom.value.studentIds.map(id => LocalizedString.lookup(id, locale)) : [];
    console.log("Fetching classroom challenges for student IDs:", normalizedStudentIdList);
    const result = await getAllStudentsClassroomChallenges(normalizedStudentIdList);

    let users: Record<string, User> = {};
    const challenges: Record<string, Challenge> = {};

    for (const [_, attemptedChallenges] of Object.entries(result)) {
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

    const classroomUsers = this.props.classroom.type === Async.Type.Loaded ? this.props.classroom.value.studentIds : [];
    const normalizedClassroomUsers = classroomUsers.map(id => id.toString());

    for (const [userId, userChallenges] of Object.entries(result)) {
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

    console.log("Processed users and challenges for leaderboard:", { users, challenges });


    // for (const [userId, userChallenges] of Object.entries(userData)) {
    //   let user: User = {
    //     id: userId,
    //     name: SELFIDENTIFIER,
    //     scores: [],

    //   };

    //   // Get anonymous name to display
    //   const userRecord: Record<string, User> = { [userId]: user };
    //   const altUser = this.anonomizeUsers(userRecord)[userId];
    //   user = {
    //     ...user,
    //     altId: altUser?.name
    //   };

    //   for (const [challengeId, challenge] of Object.entries(userChallenges as ChallengeData[])) {
    //     const score: Score = {
    //       name: tr(challengeId),
    //       completed: challengeCompletion(challenge)
    //     };
    //     user.scores.push(score);
    //   }

    //   if (!users[userId]) {
    //     users[userId] = user;
    //   }
    // }


    this.setState({ users, challenges });

    return { users, challenges };
  };

  private onLog2 = async () => {
    const { locale } = this.props;
    console.log("this.props.classroom: ", this.props.classroom);
    const normalizedStudentIdList = this.props.classroom.type === Async.Type.Loaded ? this.props.classroom.value.studentIds.map(id => LocalizedString.lookup(id, locale)) : [];
    console.log("Fetching classroom challenges for student IDs:", normalizedStudentIdList);
    const result = await getAllStudentsClassroomChallenges(normalizedStudentIdList);
    return result;

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

  private exportUserScores = (user: User) => {
    const { locale } = this.props;
    const pdfDoc = new jsPDF();


    // Title
    pdfDoc.setFontSize(18);
    pdfDoc.text('KIPR Challenge Scores', 105, 20, { align: 'center' });

    // Basic Info
    pdfDoc.setFontSize(14);
    pdfDoc.text(`Name: ${user.name}`, 20, 40);
    pdfDoc.text(`Alias: ${user.altId || 'Unknown'}`, 20, 50);
    pdfDoc.text(`Email: ${this.getCurrentUserEmail() || 'Unknown'}`, 20, 60);

    const sortedScores = this.customSort(user.scores.map(s => s.name['en-US'])).map(name => user.scores.find(s => s.name['en-US'] === name));

    // Scores
    pdfDoc.setFontSize(12);
    pdfDoc.text('Scores:', 20, 70);

    sortedScores.forEach((score, i) => {
      pdfDoc.text(
        `${LocalizedString.lookup(tr(`${score.name[locale]}`), locale) || "Unnamed"} - ${score.completed ? "Completed" : "Not Completed"
        }`,
        30,
        80 + i * 10
      );
    });

    pdfDoc.save(`${user.name}-scores.pdf`);

  };

  private renderClassroomLeaderboard = () => {
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

    console.log("Rendering ClassroomLeaderboard for classroom:", this.props.classroom);

    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ClassroomLeaderboardContainer style={style} theme={theme}>
          <ClassroomLeaderboardTitleContainer>
            <h1>Classroom Leaderboard</h1>
            <UserInfoContainer>
              <h2>User: </h2>
              <h3>{currentUser?.name || 'Unknown'}</h3>
              <h2>Alias: </h2>
              <h3>{currentUser?.altId || 'Unknown'}</h3>
              <h2>Email: </h2>
              <h3>{currentUserEmail || 'Unknown'}</h3>
            </UserInfoContainer>
            <ButtonContainer>
              <Button theme={DARK} onClick={() => this.exportUserScores(currentUser)}> Export My Scores!</Button>
              <Button theme={DARK} onClick={this.scrollToMyScores}> Scroll to My Scores!</Button>
            </ButtonContainer>

          </ClassroomLeaderboardTitleContainer>
          {this.renderClassroomLeaderboard()}
        </ClassroomLeaderboardContainer>
      </PageContainer>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
  classroom: state.classrooms.selectedClassroom,
}),
  (dispatch) => ({
    onClearSelectedClassroom: () =>
      dispatch(ClassroomsAction.clearSelectedClassroom({})),
  })


)(ClassroomLeaderboard) as React.ComponentType<ClassroomLeaderboardPublicProps>;