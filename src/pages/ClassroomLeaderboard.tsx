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
import MyBadgesDialog from '../components/Dialog/MyBadgesDialog';
import CountdownTimer from '../components/LimitedChallenge/CountdownTimer';


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

  view?: string;
  currentStudentDisplayName?: string;
  currentClassroom?: Classroom;
}

interface RouterProps {
  params: {
    classroomId?: string;
  }
}
interface ClassroomLeaderboardPrivateProps {
  onClearSelectedClassroom: () => void;
  locale: LocalizedString.Language;
  classroom: AsyncClassroom;
}

interface ClassroomLeaderboardState {
  selected: string;
  users: Record<string, User>;
  challenges: Record<string, Challenge>;
  shownClassroom: { docId: string, classroom: Classroom };
  showBadgeDialog?: boolean;
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

// const Table = styled('table', {
//   width: '80%',
//   borderCollapse: 'collapse',
//   marginTop: '50px',
//   marginLeft: '20px',
//   padding: '8px',
//   // border: '2px solid green',
// });

// const TableHeader = styled('th', {
//   borderBottom: '2px solid #ddd',
//   padding: '8px',
//   textAlign: 'center',
//   width: '50px',
// });
const StyledTableRow = styled('tr', (props: { key: string, self: string, ref: React.Ref<HTMLTableRowElement> }) => ({
  borderBottom: '1px solid #ddd',
  backgroundColor: props.self === SELFIDENTIFIER ? '#555' : '#000',
}));
// const TableCell = styled('td', {
//   padding: '6px',
//   textAlign: 'center',
// });

// const ButtonContainer = styled('div', {
//   display: 'flex',
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: '10px',
//   gap: '10px',
// });

const Button = styled('button', (props: ThemeProps & ButtonProps) => ({
  padding: '12px 24px',
  fontSize: '1em',
  fontWeight: 'bold',
  color: props.$disabled ? '#888' : '#fff',
  backgroundColor: props.$disabled ? '#444' : (props.$primary ? '#4caf50' : '#2196f3'),
  border: 'none',
  borderRadius: '4px',
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s',
  ':hover': props.$disabled ? {} : {
    opacity: 0.9,
    transform: 'translateY(-1px)',
  },
}));
const ContentContainer = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
}));

const Header = styled('div', () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '24px',
  width: '100%',
  maxWidth: '900px',
}));

const BackButton = styled('div', (props: ThemeProps) => ({
  alignSelf: 'flex-start',
  padding: '8px 16px',
  backgroundColor: 'transparent',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  color: props.theme.color,
  cursor: 'pointer',
  marginBottom: '16px',
  ':hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
}));

const ChallengeName = styled('h1', (props: ThemeProps) => ({
  fontSize: '2em',
  fontWeight: 'bold',
  color: props.theme.color,
  marginBottom: '8px',
  textAlign: 'center',
}));

const ChallengeDescription = styled('p', (props: ThemeProps) => ({
  fontSize: '1em',
  color: props.theme.color,
  opacity: 0.8,
  marginBottom: '16px',
  textAlign: 'center',
  maxWidth: '600px',
}));

// const StatusBadge = styled('div', (props: ThemeProps & { status: LimitedChallengeStatus }) => ({
//   padding: '6px 16px',
//   fontSize: '0.85em',
//   fontWeight: 'bold',
//   textTransform: 'uppercase',
//   color: '#fff',
//   borderRadius: '4px',
//   marginBottom: '16px',
//   backgroundColor: props.status === 'open'
//     ? '#4caf50'
//     : props.status === 'upcoming'
//       ? '#ff9800'
//       : '#9e9e9e',
// }));

const ButtonContainer = styled('div', () => ({
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const DisabledMessage = styled('div', (props: ThemeProps) => ({
  fontSize: '0.85em',
  color: props.theme.color,
  opacity: 0.6,
  marginBottom: '16px',
  textAlign: 'center',
}));

const LeaderboardContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  maxWidth: '900px',
  backgroundColor: props.theme.backgroundColor,
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '8px',
  overflow: 'hidden',
}));

const LeaderboardHeader = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.05)',
}));

const LeaderboardTitle = styled('h2', (props: ThemeProps) => ({
  fontSize: '1.25em',
  fontWeight: 'bold',
  color: props.theme.color,
  margin: 0,
}));

const SortToggle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: props.theme.color,
  fontSize: '0.9em',
}));

const SortButton = styled('button', (props: ThemeProps & { $active?: boolean }) => ({
  padding: '6px 12px',
  fontSize: '0.85em',
  color: props.$active ? '#fff' : props.theme.color,
  backgroundColor: props.$active ? '#2196f3' : 'transparent',
  border: `1px solid ${props.$active ? '#2196f3' : props.theme.borderColor}`,
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: props.$active ? '#2196f3' : 'rgba(255,255,255,0.1)',
  },
}));

const YourNameContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 20px',
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const YourNameLabel = styled('span', (props: ThemeProps) => ({
  fontSize: '0.9em',
  color: props.theme.color,
  opacity: 0.8,
}));

const YourNameValue = styled('span', (props: ThemeProps) => ({
  fontSize: '0.95em',
  fontWeight: 'bold',
  color: '#4caf50',
}));
interface ButtonProps {
  $disabled?: boolean;
  $primary?: boolean;
}
const EmptyState = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: props.theme.color,
  opacity: 0.6,
}));

const LoadingState = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: props.theme.color,
}));

const ErrorState = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: '#f44336',
}));
const SectionSeparator = styled('tr', (props: ThemeProps) => ({
  backgroundColor: 'rgba(255,255,255,0.02)',
}));

const SeparatorCell = styled('td', (props: ThemeProps) => ({
  padding: '8px 16px',
  textAlign: 'center',
  fontSize: '0.85em',
  color: props.theme.color,
  opacity: 0.5,
  fontStyle: 'italic',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));
const Table = styled('table', () => ({
  width: '100%',
  borderCollapse: 'collapse',
}));

const TableHeader = styled('th', (props: ThemeProps) => ({
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '0.85em',
  fontWeight: 'bold',
  color: props.theme.color,
  opacity: 0.8,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.02)',
}));

const TableRow = styled('tr', (props: ThemeProps & { $highlight?: boolean }) => ({
  backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
  ':hover': {
    backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.05)',
  },
}));

const TableCell = styled('td', (props: ThemeProps) => ({
  padding: '12px 16px',
  fontSize: '0.95em',
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const RankCell = styled(TableCell, (props: ThemeProps & { rank: number }) => ({
  fontWeight: 'bold',
  color: props.rank === 1
    ? '#ffd700'
    : props.rank === 2
      ? '#c0c0c0'
      : props.rank === 3
        ? '#cd7f32'
        : props.theme.color,
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


  }
  async componentDidMount() {
    const { classroomId } = this.props.params;
    console.log("ClassroomLeaderboard this.props: ", this.props);
    if (this.props.view !== 'studentView') {
      let currentUserId = '';
      const tokenManager = db.tokenManager;
      if (tokenManager) {
        const auth_ = tokenManager.auth();
        const currentUserAuth_ = auth_.currentUser;
        currentUserId = currentUserAuth_.uid;
      }
      const classroom = await findClassroomDocByReadableId(classroomId, currentUserId);
      this.setState({ shownClassroom: classroom }, () => { void this.onLog(); });
    }
    else {
      console.log("leaderboard mount props: ", this.props);
      if (this.props.currentClassroom) {
        this.setState({ shownClassroom: { docId: this.props.currentClassroom.docId, classroom: this.props.currentClassroom } }, () => { void this.onLog(); });
      }
    }
  }
  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomLeaderboardState>, snapshot?: any): Promise<void> {
    console.log("leaderboard compdidupdate prevProps: ", prevProps, " this.props: ", this.props);

    if (prevProps.params.classroomId !== this.props.params.classroomId) {
      let currentUserId = '';
      const tokenManager = db.tokenManager;
      if (tokenManager) {
        const auth_ = tokenManager.auth();
        const currentUserAuth_ = auth_.currentUser;
        currentUserId = currentUserAuth_.uid;
      }
      const classroom = await findClassroomDocByReadableId(this.props.params.classroomId, currentUserId);

      this.setState({ shownClassroom: classroom });
    }

    if (prevProps.currentClassroom !== this.props.currentClassroom) {
      this.setState({ shownClassroom: { docId: this.props.currentClassroom.docId, classroom: this.props.currentClassroom } }, () => { void this.onLog(); });

    }
  }

  componentWillUnmount(): void {
    this.props.onClearSelectedClassroom();
  }
  private myScoresRef = createRef<HTMLTableRowElement>();


  // private renderLeaderboard = () => {
  //   const { locale, currentUserUid } = this.props;
  //   const { topEntries, userContext, loading, error } = this.state;
  //   const theme = DARK;

  //   if (loading) {
  //     return (
  //       <LoadingState theme={theme}>
  //         {LocalizedString.lookup(tr('Loading leaderboard...'), locale)}
  //       </LoadingState>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <ErrorState theme={theme}>
  //         <div>{LocalizedString.lookup(tr('Error loading leaderboard'), locale)}</div>
  //         <div style={{ fontSize: '0.85em', marginTop: '8px' }}>{error}</div>
  //       </ErrorState>
  //     );
  //   }

  //   if (topEntries.length === 0 && !userContext) {
  //     return (
  //       <EmptyState theme={theme}>
  //         {LocalizedString.lookup(tr('No completions yet. Be the first to complete this challenge!'), locale)}
  //       </EmptyState>
  //     );
  //   }

  //   // Check if user is in top entries (to avoid duplicate display)
  //   const userInTopEntries = userContext && topEntries.some(e => e.uid === userContext.userEntry.uid);

  //   // Show user context section only if user has a completion and is not in top N
  //   const showUserContextSection = userContext && !userInTopEntries;

  //   return (
  //     <Table>
  //       <thead>
  //         <tr>
  //           <TableHeader theme={theme}>{LocalizedString.lookup(tr('Rank'), locale)}</TableHeader>
  //           <TableHeader theme={theme}>{LocalizedString.lookup(tr('Name'), locale)}</TableHeader>
  //           <TableHeader theme={theme}>{LocalizedString.lookup(tr('Runtime'), locale)}</TableHeader>
  //           <TableHeader theme={theme}>{LocalizedString.lookup(tr('Completed'), locale)}</TableHeader>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {/* Top entries - already sorted by server */}
  //         {topEntries.map((entry, index) => {
  //           const rank = index + 1;
  //           const isCurrentUser = currentUserUid === entry.uid;
  //           return this.renderLeaderboardRow(entry, rank, isCurrentUser);
  //         })}

  //         {/* Separator and user context section */}
  //         {showUserContextSection && (
  //           <>
  //             <SectionSeparator theme={theme}>
  //               <SeparatorCell theme={theme} colSpan={4}>
  //                 ··· {LocalizedString.lookup(tr('Your position'), locale)} ···
  //               </SeparatorCell>
  //             </SectionSeparator>

  //             {/* Entries above user */}
  //             {userContext.entriesAbove.map((entry, index) => {
  //               const rank = userContext.rank - userContext.entriesAbove.length + index;
  //               return this.renderLeaderboardRow(entry, rank, false);
  //             })}

  //             {/* User's entry */}
  //             {this.renderLeaderboardRow(userContext.userEntry, userContext.rank, true)}

  //             {/* Entries below user */}
  //             {userContext.entriesBelow.map((entry, index) => {
  //               const rank = userContext.rank + index + 1;
  //               return this.renderLeaderboardRow(entry, rank, false);
  //             })}
  //           </>
  //         )}
  //       </tbody>
  //     </Table>
  //   );
  // };

  private scrollToMyScores = () => {
    if (this.myScoresRef.current) {
      this.myScoresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // Logs classroom users and their challenge completions
  private onLog = async () => {
    console.log("On Log triggered");
    const result = await getAllStudentsClassroomChallenges(this.state.shownClassroom?.classroom);
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

    for (const [userId, userChallenges] of Object.entries(result)) {
      const user: User = {
        id: userId,
        name: userId,
        scores: [],
      };
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
    this.setState({ users, challenges });

    return { users, challenges };
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
    const { currentStudentDisplayName } = this.props;
    let currentUser: User;
    const tokenManager = db.tokenManager;
    if (tokenManager) {
      const auth_ = tokenManager.auth();
      const currentUserAuth_ = auth_.currentUser;
      currentUser = {
        id: currentUserAuth_.uid,
        name: currentStudentDisplayName || currentUserAuth_.displayName || 'Unknown',
        scores: Object.values(users).find(u => u.id === currentStudentDisplayName)?.scores || [],
        altId: Object.values(users).find(u => u.id === currentStudentDisplayName)?.altId || 'Unknown'
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
    const date = new Date();

    // Title
    pdfDoc.setFontSize(18);
    pdfDoc.text('KIPR Challenge Scores', 105, 20, { align: 'center' });


    pdfDoc.setFontSize(16);
    pdfDoc.text(`Date: ${date.toLocaleDateString()}`, 95, 30, { align: 'right' });
    pdfDoc.text(`Time: ${date.toLocaleTimeString()}`, 105, 30, { align: 'left' });

    // Basic Info
    pdfDoc.setFontSize(14);
    pdfDoc.text(`Name: ${user.name}`, 20, 40);
    pdfDoc.text(`Email: ${this.getCurrentUserEmail() || 'Unknown'}`, 20, 50);

    const sortedScores = this.customSort(user.scores.map(s => s.name['en-US'])).map(name => user.scores.find(s => s.name['en-US'] === name));

    // Scores
    pdfDoc.setFontSize(12);
    pdfDoc.text('Scores:', 20, 60);

    sortedScores.forEach((score, i) => {
      pdfDoc.text(
        `${LocalizedString.lookup(tr(`${score.name[locale]}`), locale) || "Unnamed"} - ${score.completed ? "Completed" : "Not Completed"
        }`,
        30,
        70 + i * 10
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

  private handleEnterChallenge() {
    console.log("Enter challenge!");
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

  private onSeeMyBadges() {
    this.setState({ showBadgeDialog: true });
  }
  private renderClassroomLeaderboard = () => {
    const users = this.state.users;
    const sortedUsers = this.orderUsersByCompletedChallenges(users);
    const challenges = this.state.challenges;
    const { theme } = this.props;

    if (!sortedUsers) return null;

    const userArray = Object.values(sortedUsers);

    const challengeArray = this.customSort(Object.keys(challenges));
    this.getCurrentUser();
    return (
      <Table>
        <thead>
          <tr>
            <TableHeader theme={theme}>
              <UserHeaderContainer>
                Users
              </UserHeaderContainer>
            </TableHeader>
            {challengeArray.map((id) => (
              <TableHeader key={id} theme={theme}>
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
              <TableCell theme={theme}>{user.name}</TableCell>
              {challengeArray.map((id) => {
                const userScore = user.scores.find(score => score.name['en-US'] === challenges[id].name['en-US']);
                return (
                  <TableCell key={id} theme={theme}>
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

  private renderClassroomLeaderboardNew = () => {
    const { theme, locale } = this.props;
    return (
      <ContentContainer theme={theme}>
        <Header>

          <ButtonContainer>
            <Button
              theme={theme}
              $primary
              onClick={this.handleEnterChallenge}
            >
              {LocalizedString.lookup(tr('Enter Challenge'), locale)}
            </Button>
          </ButtonContainer>
        </Header>

        <LeaderboardContainer theme={theme}>
          <LeaderboardHeader theme={theme}>
            <LeaderboardTitle theme={theme}>
              {LocalizedString.lookup(tr('Leaderboard'), locale)}
            </LeaderboardTitle>
            {/* <SortToggle theme={theme}>
              <SortButton
                theme={theme}
                onClick={this.handleToggleView}
                style={{ marginRight: '16px' }}
              >
                {this.state.showFullLeaderboard
                  ? LocalizedString.lookup(tr('Show Around Me'), locale)
                  : LocalizedString.lookup(tr('Show Full Board'), locale)}
              </SortButton>
              <span>{LocalizedString.lookup(tr('Sort by:'), locale)}</span>
              <SortButton
                theme={theme}
                $active={sortField === 'runtime'}
                onClick={() => this.handleSortChange('runtime')}
              >
                {LocalizedString.lookup(tr('Fastest Runtime'), locale)}
              </SortButton>
              <SortButton
                theme={theme}
                $active={sortField === 'completionTime'}
                onClick={() => this.handleSortChange('completionTime')}
              >
                {LocalizedString.lookup(tr('First to Complete'), locale)}
              </SortButton>
            </SortToggle> */}
          </LeaderboardHeader>
          {/* {currentUserName && (
            <YourNameContainer theme={theme}>
              <YourNameLabel theme={theme}>
                {LocalizedString.lookup(tr('Your name on the leaderboard:'), locale)}
              </YourNameLabel>
              <YourNameValue theme={theme}>
                {currentUserName}
              </YourNameValue>
            </YourNameContainer>
          )} */}
          {/* {this.renderLeaderboard()} */}
        </LeaderboardContainer>
      </ContentContainer>
    )
  }

  render() {
    const { props, state } = this;
    const { style, locale, view, currentStudentDisplayName } = props;
    const { selected, showBadgeDialog, users } = state;
    const theme = DARK;
    const currentUser = this.getCurrentUser();
    const currentUserEmail = this.getCurrentUserEmail();

    // Render the Classroom Leaderboard dependent on what view you're using: studentView vs teacherView
    return (
      <>
        {view === 'studentView' ? <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <ClassroomLeaderboardTitleContainer>
            <h1>Classroom Leaderboard</h1>
            <ButtonContainer>
              <Button theme={DARK} onClick={() => this.exportUserScores(currentUser)}> Export My Scores!</Button>
              <Button theme={DARK} onClick={this.scrollToMyScores}> Scroll to My Scores!</Button>
              <Button theme={DARK} onClick={() => this.onSeeMyBadges()}> See My Badges </Button>
            </ButtonContainer>

          </ClassroomLeaderboardTitleContainer>
          {this.renderClassroomLeaderboardNew()}
          {showBadgeDialog && <MyBadgesDialog
            locale={locale}
            onClose={() => this.setState({ showBadgeDialog: false })}
            currentStudentDisplayName={currentStudentDisplayName}
            currentUserScores={users[currentStudentDisplayName]?.scores || []}
            theme={theme} />}

        </div>
          :
          <PageContainer style={style} theme={theme}>
            <MainMenu theme={theme} />
            <ClassroomLeaderboardContainer style={style} theme={theme}>
              <ClassroomLeaderboardTitleContainer>
                <h1>Classroom Leaderboard</h1>

                <ButtonContainer>
                  <Button theme={DARK} onClick={() => this.exportClassroomScores()}> Export All General Scores</Button>
                  <Button theme={DARK} onClick={() => this.exportDetailedClassroomScores()}> Export All Detailed Scores</Button>
                </ButtonContainer>

              </ClassroomLeaderboardTitleContainer>
              {this.renderClassroomLeaderboardNew()}
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