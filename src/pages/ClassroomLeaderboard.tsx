import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';
import { DARK, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { State as ReduxState } from '../state';
import tr from '@i18n';
import { jsPDF } from "jspdf";
import db from '../db';
import { createRef } from 'react';
import { AsyncClassroom, Classroom } from 'state/State/Classroom';
import { ClassroomsAction, findClassroomDocByReadableId, getAllStudentsClassroomChallenges } from 'state/reducer/classrooms';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChallengeCompletion, { AsyncChallengeCompletion } from 'state/State/ChallengeCompletion';
import { ChallengeCompletions, Challenges } from '../state/State';
import Async from '../state/State/Async';


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
  challengeCompletion?: ChallengeCompletion;
}

interface User {
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

export interface ClassroomLeaderboardPublicProps extends StyleProps, ThemeProps {
  onClearSelectedClassroom: () => void;
  view?: string;
}

interface RouterProps {
  params: {
    classroomId?: string;
  }
}
interface ClassroomLeaderboardPrivateProps {
  locale: LocalizedString.Language;
  classroom: AsyncClassroom;
}

interface ClassroomLeaderboardState {
  selected: string;
  users: Record<string, User>;
  challenges: Record<string, Challenge>;
  shownClassroom: { docId: string, classroom: Classroom };
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomLeaderboardPublicProps & ClassroomLeaderboardPrivateProps & ChallengeProps & RouterProps;
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
  overflow: 'auto',

}));

const ClassroomLeaderboardTitleContainer = styled('div', {
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '20px',
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

// Higher-order component to inject router props for classroomId to support refreshing/back button
function CompWithRouter(props) {
  let params = useParams();
  let navigate = useNavigate();
  let location = useLocation();

  return (
    <ClassroomLeaderboard
      {...props}
      params={params}
      navigate={navigate}
      location={location}
    />
  );
}


class ClassroomLeaderboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: '',
      users: {},
      challenges: {},
      shownClassroom: null,
    };

    void this.onLog();
  }
  async componentDidMount() {
    const { classroomId } = this.props.params;
    console.log("Loaded classroomId:", classroomId);
    let currentUserId = '';
    const tokenManager = db.tokenManager;
    if (tokenManager) {
      const auth_ = tokenManager.auth();
      const currentUserAuth_ = auth_.currentUser;
      console.log("Current user auth:", currentUserAuth_);
      currentUserId = currentUserAuth_.uid;
    }
    const classroom = await findClassroomDocByReadableId(classroomId, currentUserId);

    console.log("Found classroom document:", classroom);
    this.setState({ shownClassroom: classroom });
  }
  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomLeaderboardState>, snapshot?: any): Promise<void> {
    if (prevProps.params.classroomId !== this.props.params.classroomId) {
      console.log("Classroom updated! New classroom:", this.props.params.classroomId);
      let currentUserId = '';
      const tokenManager = db.tokenManager;
      if (tokenManager) {
        const auth_ = tokenManager.auth();
        const currentUserAuth_ = auth_.currentUser;
        console.log("Current user auth:", currentUserAuth_);
        currentUserId = currentUserAuth_.uid;
      }
      const classroom = await findClassroomDocByReadableId(this.props.params.classroomId, currentUserId);

      console.log("Found classroom document compdidupdate:", classroom);
      this.setState({ shownClassroom: classroom });
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


  // Logs classroom users and their challenge completions
  private onLog = async () => {
    const { locale, classroom } = this.props;
    const res = await db.list('challenge_completion');

    // const { classroomId } = useParams();
    console.log("onLog this.state.shownClassroom: ", this.state.shownClassroom);
    const result = await getAllStudentsClassroomChallenges(this.state.shownClassroom?.classroom);
    console.log("Classroom challenges result:", result);

    let users: Record<string, User> = {};
    const challenges: Record<string, Challenge> = {};

    for (const [_, attemptedChallenges] of Object.entries(result)) {
      for (const [challengeId, challenge] of Object.entries(attemptedChallenges as ChallengeData[])) {
        console.log("Processing challengeId:", challengeId);
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

    console.log("THIS.props.challenges:", this.props.challenges);

    const challengeCompletion = (challenge: ChallengeData) => (
      (challenge?.success?.exprStates?.completion ?? false) &&
      (!challenge?.failure?.exprStates?.failure ?? false)
    );

    for (const [userId, userChallenges] of Object.entries(result)) {
      const user: User = {
        id: userId,
        name: userId,
        scores: [],
      };
      console.log("processing userChallenges:", userChallenges);


      for (const [challengeId, challenge] of Object.entries(userChallenges as ChallengeData[])) {
        const score: Score = {
          name: tr(challengeId),
          completed: challengeCompletion(challenge),
          challengeCompletion: userChallenges[challengeId] as ChallengeCompletion,

        };
        user.scores.push(score);
      }

      if (!users[userId]) {
        users[userId] = user;
      }
    }
    console.log("Processed users and challenges for leaderboard:", { users, challenges });

    this.setState({ users, challenges });

    return { users, challenges };
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

  private exportClassroomScores() {
    const { users, shownClassroom } = this.state;
    const { locale } = this.props;
    const pdfDoc = new jsPDF();



    const date = new Date();


    Object.values(users).forEach((user, userIndex) => {
      // Title
      pdfDoc.setFontSize(18);
      pdfDoc.text(`${shownClassroom.classroom.classroomId} General Challenge Scores`, 105, 20, { align: 'center' });

      //Date
      pdfDoc.setFontSize(16);
      pdfDoc.text(`Date: ${date.toLocaleDateString()}`, 95, 30, { align: 'right' });
      //Time
      pdfDoc.text(`Time: ${date.toLocaleTimeString()}`, 105, 30, { align: 'left' });

      pdfDoc.setFontSize(14);
      pdfDoc.text(`Name: ${user.name}`, 20, 40);
      const sortedScores = this.customSort(user.scores.map(s => s.name['en-US'])).map(name => user.scores.find(s => s.name['en-US'] === name));

      // Scores
      pdfDoc.setFontSize(12);
      pdfDoc.text('Scores:', 20, 50);

      sortedScores.forEach((score, i) => {
        pdfDoc.text(
          `${LocalizedString.lookup(tr(`${score.name[locale]}`), locale) || "Unnamed"} - ${score.completed ? "Completed" : "Not Completed"
          }`,
          30,
          60 + i * 10
        );
      });
      if (userIndex < Object.values(users).length - 1) {
        pdfDoc.addPage();
      }
    });

    pdfDoc.save(`${shownClassroom.classroom.classroomId}-scores.pdf`);
  }


  private exportDetailedClassroomScores() {
    const { users, shownClassroom } = this.state;
    const { locale, challenges } = this.props;

    const pdf = new jsPDF();
    const date = new Date();

    let y = 50;

    const writeLine = (
      text: string,
      x: number,
      increment = 10,
      font: string = "helvetica",
      style: string = "normal",
      color: string = "black"
    ): number => {
      pdf.setFont(font, style);
      pdf.setTextColor(color);

      y += increment;
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(text, x, y);
      return y;
    };

    Object.values(users).forEach((user, userIndex) => {

      // Header
      pdf.setFontSize(18);
      pdf.setTextColor('black');
      pdf.text(
        `${shownClassroom.classroom.classroomId} Detailed Challenge Scores`,
        105, 20,
        { align: 'center' }
      );

      pdf.setFontSize(16);
      pdf.text(`Date: ${date.toLocaleDateString()}`, 95, 30, { align: 'right' });
      pdf.text(`Time: ${date.toLocaleTimeString()}`, 105, 30, { align: 'left' });

      // User name
      pdf.setFontSize(14);
      pdf.text(`Name: ${user.name}`, 20, 40);

      pdf.setFontSize(12);
      pdf.text("Scores:", 20, 50);

      const sortedScores = this.customSort(
        user.scores.map(s => s.name["en-US"])
      ).map(name => user.scores.find(s => s.name["en-US"] === name));

      sortedScores.forEach(score => {

        Object.values(challenges).forEach(challenge => {

          const latest = Async.latestValue(challenge);
          if (!latest) return;

          const sceneId = latest.sceneId;
          if (sceneId !== score.name[locale]) return;

          const successGoals = Object.values(latest.successGoals || {});
          const failureGoals = Object.values(latest.failureGoals || {});

          // Challenge Title
          y = writeLine(
            `${LocalizedString.lookup(tr(latest.name[locale] + ":"), locale) || "Unnamed"}`,
            30, 10, "helvetica", "bold"
          );

          // Success Section
          if (successGoals.length > 0) {
            y = writeLine("Success", 55, 10, "helvetica", "normal");
          }

          successGoals.forEach(goal => {
            const completion = score.challengeCompletion;
            const isCompleted = completion?.success?.exprStates?.[goal.exprId];

            if (isCompleted) {
              // Checkbox ✓
              y = writeLine("3", 65, 10, "ZapfDingbats", "normal", "green");

              // Goal text also green
              pdf.setFont("helvetica", "normal");
              pdf.setTextColor("green");
              pdf.text(
                LocalizedString.lookup(tr(goal.name[locale]), locale),
                72,
                y
              );
            } else {
              y = writeLine(
                LocalizedString.lookup(tr(goal.name[locale]), locale),
                72, 10, "helvetica", "normal", "black"
              );
            }
          });

          if (failureGoals.length > 0) {
            y = writeLine("Failure", 55, 10);
          }

          failureGoals.forEach(goal => {
            const completion = score.challengeCompletion;
            const isFailed = completion?.failure?.exprStates?.[goal.exprId];

            if (isFailed) {
              // Checkbox X in red
              y = writeLine("3", 65, 10, "ZapfDingbats", "normal", "red");
              pdf.setFont("helvetica", "normal");
              pdf.setTextColor("red");
              pdf.text(
                LocalizedString.lookup(tr(goal.name[locale]), locale),
                72,
                y
              );
            } else {
              y = writeLine(
                LocalizedString.lookup(tr(goal.name[locale]), locale),
                72, 10, "helvetica", "normal", "black"
              );
            }
          });

        });

      });

      // Add new page between users
      if (userIndex < Object.values(users).length - 1) {
        pdf.addPage();
        y = 50;
      }
    });

    pdf.save(`${shownClassroom.classroom.classroomId}-scores.pdf`);
  }
  private renderClassroomLeaderboard = () => {
    const users = this.state.users || this.getDefaultUsers();
    const sortedUsers = this.orderUsersByCompletedChallenges(users);
    const challenges = this.state.challenges || this.getDefaultChallenges();

    if (!sortedUsers) return null;

    const userArray = Object.values(sortedUsers);

    const challengeArray = this.customSort(Object.keys(challenges));
    this.getCurrentUser();
    console.log("Rendering Classroom Leaderboard with users and challenges:", { users: sortedUsers, challenges });
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
    const { style, locale, view } = props;
    const { selected } = state;
    const theme = DARK;
    const currentUser = this.getCurrentUser();
    const currentUserEmail = this.getCurrentUserEmail();

    // Render the Classroom Leaderboard dependent on what view you're using: studentView vs teacherView
    return (
      <>
        {view === 'studentView' ? <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
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
        </div>
          :
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
                  <Button theme={DARK} onClick={() => this.exportClassroomScores()}> Export All General Scores</Button>
                  <Button theme={DARK} onClick={() => this.exportDetailedClassroomScores()}> Export All Detailed Scores</Button>
                </ButtonContainer>

              </ClassroomLeaderboardTitleContainer>
              {this.renderClassroomLeaderboard()}
            </ClassroomLeaderboardContainer>
          </PageContainer>
        }


      </>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
  classroom: state.classrooms.selectedClassroom,
  challenges: state.challenges,
}),
  (dispatch) => ({
    onClearSelectedClassroom: () =>
      dispatch(ClassroomsAction.clearSelectedClassroom({})),
  })


)(CompWithRouter) as React.ComponentType<ClassroomLeaderboardPublicProps>;