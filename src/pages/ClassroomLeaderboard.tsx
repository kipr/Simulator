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
import { auth } from '../firebase/firebase';
import { LeaderboardEntry, LeaderboardUserContext } from 'state/State/LimitedChallengeLeaderboard';
import TourTarget from '../components/Tours/TourTarget';
import { TourRegistry } from '../tours/TourRegistry';
import { classroomNameAsString } from '../util/classroomDisplayName';
import { isCustomChallengeId } from '../util/customChallengeFactory';
import { isTeacherOwnedCustomChallenge } from '../util/customChallengeClassroomShare';
import { ChallengesAction } from '../state/reducer/challenges';
import { NATIVE_SCROLLBAR_CLASS, nativeScrollbarChrome } from '../util/nativeScrollbarChrome';

const SELFIDENTIFIER = "My Scores!";

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  src?: string;
  backgroundColor?: string;
}

interface Score {
  name: LocalizedString; // Challenge name
  challengeId?: string;
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
  currentClassroom?: AsyncClassroom;
  tourRegistry?: TourRegistry;
}

interface RouterProps {
  params: {
    classroomId?: string;
    studentId?: string;
  }
}
interface ClassroomLeaderboardPrivateProps {
  onClearSelectedClassroom: () => void;
  onListUserChallenges: () => void;
  locale: LocalizedString.Language;
  classroom: AsyncClassroom;
}

interface ClassroomLeaderboardState {
  topEntries: User[];
  userContext?: User;
  sortedUsers?: User[];
  currentUserEntry?: LeaderboardEntry;
  loading: boolean;
  error?: string;
  totalParticipants: number;
  selected: string;
  users: Record<string, User>;
  challenges: Record<string, Challenge>;
  shownClassroom: { docId: string, classroom: Classroom };
  showBadgeDialog?: boolean;
}


type Props = ClassroomLeaderboardPublicProps & ClassroomLeaderboardPrivateProps & ChallengeProps & RouterProps;
type State = ClassroomLeaderboardState;

const PageContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const TeacherLeaderboardRoot = styled('div', {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
});

const ClassroomLeaderboardContainer = styled("div", (props: ThemeProps & { $teacherView?: boolean }) => ({
  backgroundColor: props.theme.backgroundColor,
  display: 'flex',
  flexDirection: 'column',
  width: props.$teacherView ? '100%' : '95%',
  marginTop: props.$teacherView ? 0 : '20px',
  ...(props.$teacherView ? {
    maxWidth: '100%',
    minWidth: 0,
    overflow: 'hidden',
  } : {
    overflow: 'auto',
  }),
}));

/** Fixed-size panel; table scrolls inside via LeaderboardScrollContainer. */
const TeacherLeaderboardPanel = styled('div', {
  width: '88%',
  maxWidth: '88%',
  height: '75%',
  maxHeight: '75%',
  alignSelf: 'center',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  minWidth: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
});

const ClassroomLeaderboardTitleContainer = styled('div', (props: { $compact?: boolean }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: props.$compact ? '12px 20px' : '20px',
  flexShrink: 0,
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


const StyledTableRow = styled('tr', (props: { key: string, self: string, ref: React.Ref<HTMLTableRowElement> }) => ({
  borderBottom: '1px solid #ddd',
  backgroundColor: props.self === SELFIDENTIFIER ? '#555' : '#000',
}));
const TeacherLeaderboardTableWrap = styled('div', {
  display: 'block',
  width: 'max-content',
  minWidth: '100%',
});

/** Vertical scroll only (many students). Matches GradesView / classroom card scroll styling. */
const TeacherLeaderboardVerticalScroll = styled('div', {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  maxHeight: '100%',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
  overflowY: 'auto',
  ...nativeScrollbarChrome,
});

/** Horizontal scroll only (many challenge columns). */
const TeacherLeaderboardHorizontalScroll = styled('div', {
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'auto',
  overflowY: 'hidden',
  ...nativeScrollbarChrome,
});

const LeaderboardScrollContainer = styled('div', {
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  height: '85%',
  overflow: 'auto',
  ...nativeScrollbarChrome,
});

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

const ButtonContainer = styled('div', () => ({
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const StickyRankTh = styled('th', (props: ThemeProps) => ({
  position: 'sticky',
  top: 0,
  left: 0,
  width: '80px',
  minWidth: '80px',
  backgroundColor: props.theme.backgroundColor,
  zIndex: 7,
  whiteSpace: 'nowrap',

}));
const StickyNameTh = styled('th', (props: ThemeProps) => ({
  position: 'sticky',
  top: 0,
  left: '80px',
  width: '200px',
  minWidth: '200px',
  backgroundColor: props.theme.backgroundColor,
  zIndex: 7,
  whiteSpace: 'nowrap',
}));
const LeaderboardContainer = styled('div', (props: ThemeProps & { $teacherView?: boolean }) => ({
  width: props.$teacherView ? '100%' : '95%',
  maxWidth: props.$teacherView ? '100%' : '900px',
  backgroundColor: props.theme.backgroundColor,
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '8px',
  overflow: 'hidden',
  ...(props.$teacherView ? {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  } : {}),
}));

const LeaderboardHeader = styled('div', (props: ThemeProps & { $teacherView?: boolean }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.05)',
  ...(props.$teacherView ? { flexShrink: 0 } : {}),
}));

const LeaderboardTitle = styled('h2', (props: ThemeProps) => ({
  fontSize: '1.25em',
  fontWeight: 'bold',
  color: props.theme.color,
  margin: 0,
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

const TeacherLeaderboardTable = styled(Table, {
  width: 'max-content',
  minWidth: '100%',
  tableLayout: 'auto',
});

const TableHeader = styled('th', (props: ThemeProps & { $challengeColumn?: boolean }) => ({
  padding: '12px 16px',
  position: 'sticky',
  top: 0,
  textAlign: 'center',
  fontSize: '0.85em',
  fontWeight: 'bold',
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: 'rgba(255,255,255,0.02)',
  ...(props.$challengeColumn ? {
    minWidth: '72px',
    maxWidth: '140px',
    whiteSpace: 'normal',
    verticalAlign: 'bottom',
    zIndex: 5,
  } : {}),
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
  textAlign: 'center'
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

const StickyRankCell = styled(RankCell, (props: ThemeProps & { $highlight?: boolean }) => ({
  position: 'sticky',
  left: 0,
  zIndex: 4,
  backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 1)' : props.theme.backgroundColor,
  minWidth: '80px',
}));

const StickyNameCell = styled(TableCell, (props: ThemeProps & { $highlight?: boolean }) => ({
  position: 'sticky',
  left: '80px',
  zIndex: 4,
  backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 1)' : props.theme.backgroundColor,
  textAlign: 'left',
  minWidth: '200px',
  whiteSpace: 'nowrap',
}));

const ChallengeScoreCell = styled(TableCell, {
  minWidth: '72px',
  whiteSpace: 'nowrap',
});

// Higher-order component to inject router props for classroomId to support refreshing/back button
function CompWithRouter(props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
      topEntries: [],
      userContext: undefined,
      totalParticipants: 0,
      loading: true,
      selected: '',
      users: {},
      challenges: {},
      shownClassroom: null,
    };


  }
  async componentDidMount() {
    const { classroomId } = this.props.params;
    if (this.props.view === 'studentView' || this.props.view === 'teacherView') {
      if (this.props.view === 'teacherView') {
        this.props.onListUserChallenges();
      }
      if (this.props.currentClassroom) {
        const classroom = Async.latestValue(this.props.currentClassroom);
        this.setState(
          { shownClassroom: { docId: classroom.docId, classroom } },
          () => { void this.onLog(); }
        );
      }
      return;
    }
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
  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomLeaderboardState>): Promise<void> {
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

    if (prevProps.currentClassroom !== this.props.currentClassroom && this.props.currentClassroom) {
      this.setState({ shownClassroom: { docId: Async.latestValue(this.props.currentClassroom).docId, classroom: Async.latestValue(this.props.currentClassroom) } }, () => { void this.onLog(); });

    }

    if (
      this.props.view === 'teacherView' &&
      prevProps.challenges !== this.props.challenges
    ) {
      void this.onLog();
    }
  }

  componentWillUnmount(): void {
    if (this.props.view !== 'teacherView') {
      this.props.onClearSelectedClassroom();
    }
  }
  private myScoresRef = createRef<HTMLTableRowElement>();


  private renderLeaderboard = () => {
    const { locale, params, theme } = this.props;
    const { topEntries, userContext, loading, error, users, challenges } = this.state;

    const sortedUsers = this.orderUsersByCompletedChallenges(users);
    const challengeArray = this.customSort(Object.keys(challenges));

    if (loading) {
      return (
        <LoadingState theme={theme}>
          {LocalizedString.lookup(tr('Loading leaderboard...'), locale)}
        </LoadingState>
      );
    }

    if (error) {
      return (
        <ErrorState theme={theme}>
          <div>{LocalizedString.lookup(tr('Error loading leaderboard'), locale)}</div>
          <div style={{ fontSize: '0.85em', marginTop: '8px' }}>{error}</div>
        </ErrorState>
      );
    }

    const isTeacherView = this.props.view === 'teacherView';
    const tableEntries = isTeacherView ? sortedUsers : topEntries;

    if (tableEntries.length === 0 && !userContext) {
      return (
        <EmptyState theme={theme}>
          {LocalizedString.lookup(
            isTeacherView
              ? challengeArray.length === 0
                ? tr('No JBC challenges to display yet.')
                : tr('No students enrolled in this classroom yet.')
              : tr('No completions yet. Be the first to complete this challenge!'),
            locale
          )}
        </EmptyState>
      );
    }

    // Check if user is in top entries (to avoid duplicate display)
    const userInTopEntries = userContext && topEntries.some(e => e.id === userContext.id);

    // Show user context section only if user has a completion and is not in top N
    const showUserContextSection = !isTeacherView && userContext && !userInTopEntries;

    const LeaderboardTable = isTeacherView ? TeacherLeaderboardTable : Table;

    const tableContent = (
      <LeaderboardTable>
        <thead>
          <tr>
            <StickyRankTh theme={theme}>
              {LocalizedString.lookup(tr('Rank'), locale)}
            </StickyRankTh>

            <StickyNameTh theme={theme}>
              {LocalizedString.lookup(tr('Name'), locale)}
            </StickyNameTh>
            {challengeArray.map(id => (
              <TableHeader key={id} theme={theme} $challengeColumn={isTeacherView}>
                {LocalizedString.lookup(challenges[id].name, locale)}
              </TableHeader>
            ))}

          </tr>
        </thead>
        <tbody>
          {tableEntries.map((entry, index) => {
            const rank = index + 1;
            const currentUid = auth.currentUser?.uid;
            const isCurrentUser = currentUid
              ? entry.id === currentUid
              : params.studentId === entry.id;
            return this.renderLeaderboardRow(entry, rank, isCurrentUser, challengeArray);
          })}



          {/* Separator and user context section */}
          {showUserContextSection && (
            <>
              <SectionSeparator theme={theme}>
                <SeparatorCell theme={theme} colSpan={4}>
                  ··· {LocalizedString.lookup(tr('Your position'), locale)} ···
                </SeparatorCell>
              </SectionSeparator>

              {/* User's entry */}
              {this.renderLeaderboardRow(userContext, sortedUsers.findIndex(user => user.id === params.studentId), true, challengeArray)}

            </>
          )}
        </tbody>
      </LeaderboardTable>
    );

    if (isTeacherView) {
      return (
        <TeacherLeaderboardVerticalScroll className={NATIVE_SCROLLBAR_CLASS}>
          <TeacherLeaderboardHorizontalScroll className={NATIVE_SCROLLBAR_CLASS}>
            <TeacherLeaderboardTableWrap>
              {tableContent}
            </TeacherLeaderboardTableWrap>
          </TeacherLeaderboardHorizontalScroll>
        </TeacherLeaderboardVerticalScroll>
      );
    }

    return (
      <LeaderboardScrollContainer>
        {tableContent}
      </LeaderboardScrollContainer>
    );
  };

  private renderLeaderboardRow = (entry: User, rank: number, isCurrentUser: boolean, challengeArray: string[]) => {
    const { theme, locale, view } = this.props;
    const { challenges } = this.state;
    const isTeacherView = view === 'teacherView';
    const RankCellComponent = isTeacherView ? StickyRankCell : RankCell;
    const NameCellComponent = isTeacherView ? StickyNameCell : TableCell;
    const ScoreCellComponent = isTeacherView ? ChallengeScoreCell : TableCell;

    return (
      <TableRow key={`${entry.id}-${rank}`} theme={theme} $highlight={isCurrentUser}>
        <RankCellComponent
          theme={theme}
          rank={rank}
          {...(isTeacherView ? { $highlight: isCurrentUser } : {})}
        >
          #{rank}
        </RankCellComponent>
        <NameCellComponent
          theme={theme}
          {...(isTeacherView ? { $highlight: isCurrentUser } : {})}
        >
          {entry.name}
          {isCurrentUser && ` (${LocalizedString.lookup(tr('You'), locale)})`}
        </NameCellComponent>
        {challengeArray.map((id) => {
          const userScore = entry.scores.find(
            score =>
              score.challengeId === id ||
              score.name['en-US'] === challenges[id].name['en-US']
          );
          return (
            <ScoreCellComponent key={id} theme={theme}>
              {!userScore && '-'}
              {userScore?.completed && (
                <>
                  <img src="/static/icons/favicon-32x32.png" alt="Favicon" />

                </>
              )}
              {userScore && !userScore.completed && (
                <img src="/static/icons/botguy-bw-trans-32x32.png" alt="Favicon" />
              )}
            </ScoreCellComponent>
          );
        })}
      </TableRow>
    );
  };

  private scrollToMyScores = () => {
    if (this.myScoresRef.current) {
      this.myScoresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  /** Teacher leaderboard columns: built-in JBC + this teacher's custom scene-collection challenges. */
  private teacherLeaderboardChallengeColumns_ = (
    classroom: Classroom
  ): Record<string, Challenge> => {
    const { challenges: challengeStore } = this.props;
    const teacherId = classroom.teacherId;
    const columns: Record<string, Challenge> = {};

    for (const [challengeId, asyncChallenge] of Object.entries(challengeStore)) {
      const value = Async.latestValue(asyncChallenge);
      if (!value) continue;
      if (isCustomChallengeId(challengeId)) {
        if (!isTeacherOwnedCustomChallenge(value, teacherId)) continue;
      }
      columns[challengeId] = {
        name: value.name,
        description: value.description,
      };
    }

    for (const [sceneId, shared] of Object.entries(
      classroom.sharedCustomChallenges ?? {}
    )) {
      if (columns[sceneId] || shared.sharedByTeacherId !== teacherId) continue;
      columns[sceneId] = {
        name: shared.scene.name,
        description: shared.scene.description,
      };
    }

    return columns;
  };

  private rosterUserKey_ = (student: {
    id: string | LocalizedString;
    displayName: string | LocalizedString;
  }): string => {
    const displayName =
      typeof student.displayName === 'string'
        ? student.displayName
        : student.displayName[LocalizedString.EN_US];
    const studentId =
      typeof student.id === 'string' ? student.id : student.id[LocalizedString.EN_US];
    return displayName || studentId;
  };

  /** Seed leaderboard rows from classroom roster (teacher may also be enrolled as a student). */
  private seedUsersFromClassroomRoster_ = (
    classroom: Classroom
  ): Record<string, User> => {
    const users: Record<string, User> = {};
    for (const student of Object.values(classroom.studentIds ?? {})) {
      const key = this.rosterUserKey_(student);
      const studentId =
        typeof student.id === 'string' ? student.id : student.id[LocalizedString.EN_US];
      const displayName =
        typeof student.displayName === 'string'
          ? student.displayName
          : student.displayName[LocalizedString.EN_US];
      users[key] = {
        id: studentId,
        name: displayName,
        scores: [],
      };
    }
    return users;
  };

  // Logs classroom users and their challenge completions
  private onLog = async () => {

    const { params, currentClassroom, view } = this.props;
    const classroomValue =
      currentClassroom
        ? Async.latestValue(currentClassroom)
        : this.state.shownClassroom?.classroom;
    const result = await getAllStudentsClassroomChallenges(classroomValue);

    const isTeacherView = view === 'teacherView';
    const challenges: Record<string, Challenge> = isTeacherView && classroomValue
      ? this.teacherLeaderboardChallengeColumns_(classroomValue)
      : {};

    const users: Record<string, User> =
      isTeacherView && classroomValue
        ? this.seedUsersFromClassroomRoster_(classroomValue)
        : {};

    if (!isTeacherView) {
      for (const [_, attemptedChallenges] of Object.entries(result)) {
        const challengeNames = Object.keys(Object.entries(attemptedChallenges)[2][1]);

        challengeNames.forEach(challengeId => {
          const challenge = {
            name: tr(challengeId),
            description: tr(challengeId),
          };
          if (!challenges[challengeId]) {
            challenges[challengeId] = challenge;
          }
        });
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

    interface UserData {
      uid: string;
      displayName: string;
      challenges: ChallengeData
    }
    const entries = Object.entries(result as Record<string, UserData>);

    for (const [userKey, userData] of entries) {
      const existing = users[userKey];
      const user: User = existing ?? {
        id: userData.uid,
        name: userKey,
        scores: [],
      };

      for (const [challengeId, challenge] of Object.entries(userData.challenges)) {
        if (isTeacherView && !challenges[challengeId]) continue;
        const challengeMeta = challenges[challengeId];
        const score: Score = {
          name: challengeMeta?.name ?? tr(challengeId),
          challengeId,
          completed: challengeCompletion(challenge),
          challengeCompletion: userData.challenges[challengeId] as ChallengeCompletion,

        };
        user.scores.push(score);
      }

      users[userKey] = user;
    }
    const sortedUsers = this.orderUsersByCompletedChallenges(users);
    const topThree = sortedUsers.slice(0, 3);

    const currentUid = auth.currentUser?.uid;
    const me =
      (currentUid && sortedUsers.find(user => user.id === currentUid)) ||
      (params.studentId && sortedUsers.find(user => user.id === params.studentId)) ||
      undefined;

    this.setState({
      users,
      topEntries: topThree,
      sortedUsers,
      userContext: me ? me : undefined,
      challenges,
      loading: false
    });

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

  private classroomLabelForExport = (): string => {
    const { shownClassroom } = this.state;
    const { locale } = this.props;
    if (!shownClassroom?.classroom) return 'classroom';
    return classroomNameAsString(shownClassroom.classroom.classroomId, locale);
  };

  private canExportClassroomScores = (): boolean => {
    const { loading, users, shownClassroom } = this.state;
    return !loading && !!shownClassroom && Object.keys(users).length > 0;
  };

  private usersForExport = (): User[] => {
    return this.orderUsersByCompletedChallenges(this.state.users);
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

  /** Leaderboard users are keyed by display name; match by uid or display name. */
  private findCurrentStudentUser = (): User | null => {
    const { users, userContext } = this.state;
    const { currentStudentDisplayName } = this.props;
    const uid = auth.currentUser?.uid;

    if (userContext && (!uid || userContext.id === uid)) {
      return userContext;
    }
    if (uid) {
      const byUid = Object.values(users).find(u => u.id === uid);
      if (byUid) return byUid;
    }
    if (currentStudentDisplayName && users[currentStudentDisplayName]) {
      return users[currentStudentDisplayName];
    }
    if (currentStudentDisplayName) {
      return Object.values(users).find(u => u.name === currentStudentDisplayName) ?? null;
    }
    return null;
  };

  private getCurrentUser = (): User | null => {
    const existing = this.findCurrentStudentUser();
    const tokenManager = db.tokenManager;
    if (!tokenManager) return existing;

    const currentUserAuth_ = tokenManager.auth().currentUser;
    if (!currentUserAuth_) return existing;

    const { currentStudentDisplayName } = this.props;
    return {
      id: currentUserAuth_.uid,
      name:
        existing?.name ||
        currentStudentDisplayName ||
        currentUserAuth_.displayName ||
        'Unknown',
      scores: existing?.scores ?? [],
      altId: existing?.altId || 'Unknown',
    };
  };

  /** One row per leaderboard column, including challenges not yet attempted. */
  private scoresForStudentExport = (user: User): Score[] => {
    const { challenges } = this.state;
    const challengeIds = this.customSort(Object.keys(challenges));

    return challengeIds.map(challengeId => {
      const challengeMeta = challenges[challengeId];
      const existing = user.scores.find(
        s =>
          s.challengeId === challengeId ||
          s.name['en-US'] === challengeMeta?.name['en-US']
      );
      if (existing) return existing;
      return {
        name: challengeMeta?.name ?? tr(challengeId),
        challengeId,
        completed: false,
      };
    });
  };

  private exportStatusLabel = (user: User, score: Score): string => {
    const { challenges } = this.state;
    const challengeId = score.challengeId;
    const challengeMeta = challengeId ? challenges[challengeId] : undefined;
    const attempted = user.scores.some(
      s =>
        s.challengeId === challengeId ||
        (challengeMeta && s.name['en-US'] === challengeMeta.name['en-US'])
    );
    if (!attempted) {
      return 'Not Attempted';
    }
    return score.completed ? 'Completed' : 'Not Completed';
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

  private exportUserScores = (_user?: User | null) => {
    const resolved = this.findCurrentStudentUser() ?? _user ?? null;
    if (!resolved) return;

    const { locale } = this.props;
    const pdfDoc = new jsPDF();
    const date = new Date();
    const exportScores = this.scoresForStudentExport(resolved);

    // Title
    pdfDoc.setFontSize(18);
    pdfDoc.text('KIPR Challenge Scores', 105, 20, { align: 'center' });


    pdfDoc.setFontSize(16);
    pdfDoc.text(`Date: ${date.toLocaleDateString()}`, 95, 30, { align: 'right' });
    pdfDoc.text(`Time: ${date.toLocaleTimeString()}`, 105, 30, { align: 'left' });

    // Basic Info
    pdfDoc.setFontSize(14);
    pdfDoc.text(`Name: ${resolved.name}`, 20, 40);
    pdfDoc.text(`Email: ${this.getCurrentUserEmail() || 'Unknown'}`, 20, 50);

    // Scores
    pdfDoc.setFontSize(12);
    pdfDoc.text('Scores:', 20, 60);

    let y = 60;
    exportScores.forEach((score) => {
      y += 10;
      if (y > 280) {
        pdfDoc.addPage();
        y = 20;
      }
      const label =
        LocalizedString.lookup(score.name, locale) ||
        LocalizedString.lookup(tr(`${score.name[locale]}`), locale) ||
        score.challengeId ||
        'Unnamed';
      pdfDoc.text(
        `${label} - ${this.exportStatusLabel(resolved, score)}`,
        30,
        y
      );
    });

    pdfDoc.save(`${resolved.name}-scores.pdf`);

  };

  // Export all students' JBC scores (completed / not completed) for the classroom.
  private exportClassroomScores() {
    if (!this.canExportClassroomScores()) return;

    const { locale } = this.props;
    const pdfDoc = new jsPDF();
    const classroomLabel = this.classroomLabelForExport();
    const exportUsers = this.usersForExport();

    const date = new Date();

    exportUsers.forEach((user, userIndex) => {
      // Title
      pdfDoc.setFontSize(18);
      pdfDoc.text(`${classroomLabel} General Challenge Scores`, 105, 20, { align: 'center' });

      // Date
      pdfDoc.setFontSize(16);
      pdfDoc.text(`Date: ${date.toLocaleDateString()}`, 95, 30, { align: 'right' });
      // Time
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
      if (userIndex < exportUsers.length - 1) {
        pdfDoc.addPage();
      }
    });

    pdfDoc.save(`${classroomLabel}-general-scores.pdf`);
  }


  private exportDetailedClassroomScores() {
    if (!this.canExportClassroomScores()) return;

    const { locale, challenges } = this.props;
    const classroomLabel = this.classroomLabelForExport();
    const exportUsers = this.usersForExport();

    const pdf = new jsPDF();
    const date = new Date();

    let y = 50;

    const writeLine = (
      text: string,
      x: number,
      increment = 10,
      font = "helvetica",
      style = "normal",
      color = "black"
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

    exportUsers.forEach((user, userIndex) => {

      // Header
      pdf.setFontSize(18);
      pdf.setTextColor('black');
      pdf.text(
        `${classroomLabel} Detailed Challenge Scores`,
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
        const challengeId = score.challengeId;
        if (!challengeId) return;

        const asyncChallenge = challenges[challengeId];
        const latest = asyncChallenge ? Async.latestValue(asyncChallenge) : null;
        if (!latest) return;

        const successGoals = Object.values(latest.successGoals || {});
        const failureGoals = Object.values(latest.failureGoals || {});

        // Challenge Title
        y = writeLine(
          `${LocalizedString.lookup(tr(`${latest.name[locale]}:`), locale) || "Unnamed"}`,
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

      // Add new page between users
      if (userIndex < exportUsers.length - 1) {
        pdf.addPage();
        y = 50;
      }
    });

    pdf.save(`${classroomLabel}-detailed-scores.pdf`);
  }

  private onSeeMyBadges() {
    this.setState({ showBadgeDialog: true });
  }

  private renderClassroomLeaderboardNew = () => {
    const { theme, locale, currentStudentDisplayName, view } = this.props;
    const isTeacherView = view === 'teacherView';
    return (
      <LeaderboardContainer theme={theme} $teacherView={isTeacherView}>
        <LeaderboardHeader theme={theme} $teacherView={isTeacherView}>
          <LeaderboardTitle theme={theme}>
            {LocalizedString.lookup(tr('Leaderboard'), locale)}
          </LeaderboardTitle>
        </LeaderboardHeader>
        {currentStudentDisplayName && (
          <YourNameContainer theme={theme}>
            <YourNameLabel theme={theme}>
              {LocalizedString.lookup(tr('Your name on the leaderboard:'), locale)}
            </YourNameLabel>
            <YourNameValue theme={theme}>
              {currentStudentDisplayName}
            </YourNameValue>
          </YourNameContainer>
        )}
        {this.renderLeaderboard()}
      </LeaderboardContainer>
    );
  };

  render() {
    const { props, state } = this;
    const { style, locale, view, currentStudentDisplayName, tourRegistry } = props;
    const { selected, showBadgeDialog, users } = state;
    const theme = DARK;
    const currentUser = this.getCurrentUser();
    const currentUserEmail = this.getCurrentUserEmail();

    const tourContent_ = (<ButtonContainer>

      <TourTarget registry={this.props.tourRegistry} targetKey='export-button'>
        <Button theme={DARK} onClick={() => this.exportUserScores(currentUser)}> {LocalizedString.lookup(tr("Export My Scores!"), locale)}</Button>
      </TourTarget>
      <TourTarget registry={this.props.tourRegistry} targetKey='scroll-to-my-scores-button'>
        <Button theme={DARK} onClick={this.scrollToMyScores}> {LocalizedString.lookup(tr("Scroll to My Scores!"), locale)}</Button>
      </TourTarget>
      <TourTarget registry={this.props.tourRegistry} targetKey='see-my-badges-button'>
        <Button theme={DARK} onClick={() => this.onSeeMyBadges()}> {LocalizedString.lookup(tr("See My Badges!"), locale)}</Button>
      </TourTarget>
    </ButtonContainer>);

    const normalContent_ = (
      <ButtonContainer>
        <Button theme={DARK} onClick={() => this.exportUserScores(currentUser)}> {LocalizedString.lookup(tr("Export My Scores!"), locale)}</Button>
        <Button theme={DARK} onClick={this.scrollToMyScores}> {LocalizedString.lookup(tr("Scroll to My Scores!"), locale)}</Button>
        <Button theme={DARK} onClick={() => this.onSeeMyBadges()}> {LocalizedString.lookup(tr("See My Badges!"), locale)}</Button>
      </ButtonContainer>
    );
    const isTeacherView = view === 'teacherView';

    if (view === 'studentView') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <ClassroomLeaderboardTitleContainer>
              <h1>{LocalizedString.lookup(tr("Classroom Leaderboard"), locale)}</h1>

              {tourRegistry ? tourContent_ : normalContent_}
            </ClassroomLeaderboardTitleContainer>
            {this.renderClassroomLeaderboardNew()}
            {showBadgeDialog && <MyBadgesDialog
              locale={locale}
              onClose={() => this.setState({ showBadgeDialog: false })}
              currentStudentDisplayName={currentStudentDisplayName}
              currentUserScores={
                this.findCurrentStudentUser()?.scores ||
                (currentStudentDisplayName ? users[currentStudentDisplayName]?.scores : undefined) ||
                []
              }
              theme={theme} />}
          </div>
        </div>
      );
    }

    return (
      <TeacherLeaderboardRoot style={style}>
        <ClassroomLeaderboardContainer theme={theme} $teacherView>
          <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, alignItems: 'center', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
            <ClassroomLeaderboardTitleContainer $compact>
              <h1>{LocalizedString.lookup(tr("Classroom Leaderboard"), locale)}</h1>

              <ButtonContainer>
                <TourTarget registry={tourRegistry} targetKey="export-all-general-scores">
                  <Button
                    theme={DARK}
                    $disabled={!this.canExportClassroomScores()}
                    onClick={() => this.exportClassroomScores()}
                  >
                    {LocalizedString.lookup(tr("Export All General Scores"), locale)}
                  </Button>
                </TourTarget>
                <TourTarget registry={tourRegistry} targetKey="export-all-detailed-scores">
                  <Button
                    theme={DARK}
                    $disabled={!this.canExportClassroomScores()}
                    onClick={() => this.exportDetailedClassroomScores()}
                  >
                    {LocalizedString.lookup(tr("Export All Detailed Scores"), locale)}
                  </Button>
                </TourTarget>
              </ButtonContainer>
            </ClassroomLeaderboardTitleContainer>
            <TeacherLeaderboardPanel>
              {this.renderClassroomLeaderboardNew()}
            </TeacherLeaderboardPanel>
          </div>
        </ClassroomLeaderboardContainer>
      </TeacherLeaderboardRoot>
    );
  }
}

export default connect(
  (state: ReduxState) => ({
    locale: state.i18n.locale,
    classroom: state.classrooms.selectedClassroom,
    challenges: state.challenges,
    currentStudentDisplayName: Async.latestValue(state.classrooms.currentStudentClassroom)
      ? Async.latestValue(state.classrooms.currentStudentClassroom).studentIds[auth.currentUser.uid].displayName
      : null,
  }),
  (dispatch) => ({
    onClearSelectedClassroom: () =>
      dispatch(ClassroomsAction.clearSelectedClassroom({})),
    onListUserChallenges: () =>
      dispatch(ChallengesAction.listUserChallenges({})),
  })
)(CompWithRouter) as React.ComponentType<ClassroomLeaderboardPublicProps>;