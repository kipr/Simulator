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
import { LeaderboardEntry } from 'state/State/LimitedChallengeLeaderboard';

const SELFIDENTIFIER = "My Scores!";
let currentUser;

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

export interface LeaderboardPublicProps extends StyleProps, ThemeProps {
}

interface LeaderboardPrivateProps {
  locale: LocalizedString.Language;
}

interface LeaderboardState {
  topEntries: User[];
  userContext?: User;
  sortedUsers?: User[];
  topTen?: User[];
  currentUserEntry?: LeaderboardEntry;
  loading: boolean;
  error?: string;
  totalParticipants: number;
  selected: string;
  users: Record<string, User>;
  challenges: Record<string, Challenge>;
  showFullLeaderboard: boolean;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = LeaderboardPublicProps & LeaderboardPrivateProps;
type State = LeaderboardState;

const PageContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100vh',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  overflow: 'hidden'
}));

const LeaderboardContainer = styled("div", (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,

  width: 'calc(100vw - 50px)',
  marginBottom: '0.1em',
  height: '85%',
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'center',
  overflowX: 'visible',
}));

const LeaderboardTitleContainer = styled('div', {
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '0.5em 0 0.1em 0',
  zIndex: 1,
});

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

const StickyRankTd = styled('td', (props: ThemeProps & { rank: number, $highlight: boolean }) => ({
  position: 'sticky',
  left: 0,
  width: '80px',
  minWidth: '80px',
  textAlign: 'center',
  backgroundColor: props.$highlight ? '#2c482f' : props.theme.backgroundColor,
  ':hover': {
    backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 0.2)' : props.theme.backgroundColor,
  },
  zIndex: 6,
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  color: props.rank === 1
    ? '#ffd700'
    : props.rank === 2
      ? '#c0c0c0'
      : props.rank === 3
        ? '#cd7f32'
        : props.theme.color,
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

const StickyNameTd = styled('td', (props: ThemeProps & { $highlight: boolean }) => ({
  position: 'sticky',
  left: '80px',
  width: '200px',
  minWidth: '200px',
  backgroundColor: props.$highlight ? '#2c482f' : props.theme.backgroundColor,
  ':hover': {
    backgroundColor: props.$highlight ? 'rgba(76, 175, 80, 0.2)' : props.theme.backgroundColor,
  },
  textAlign: 'center',
  zIndex: 6,
  whiteSpace: 'nowrap',
}));


const Table = styled('table', () => ({
  width: '100%',
  borderCollapse: 'collapse',
  height: '100%',
  overflow: 'visible'

}));
const LeaderboardScrollContainer = styled('div', {
  width: '100%',
  overflow: 'auto',
  WebkitOverflowScrolling: 'touch',
  height: '85%',

  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(121,121,121,0.6) transparent',

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

const TableHeader = styled('th', (props: ThemeProps) => ({
  padding: '12px 16px',
  position: 'sticky',
  top: 0,
  textAlign: 'center',
  fontSize: '0.85em',
  fontWeight: 'bold',
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.theme.backgroundColor,
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

const ContentContainer = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  width: '95%',
  height: '95%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
}));
const SectionSeparator = styled('tr', (props: ThemeProps) => ({
  position: 'sticky',
  left: '80px',
}));

const LeaderboardViewToggle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: props.theme.color,
  fontSize: '0.9em',
}));

const LeaderboardViewToggleButton = styled('button', (props: ThemeProps & { $active?: boolean }) => ({
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

const SeparatorCell = styled('td', (props: ThemeProps) => ({
  position: 'sticky',
  left: '80px',
  padding: '8px 16px',
  textAlign: 'center',
  backgroundColor: 'rgba(255,255,255,0.02)',
  fontSize: '0.85em',
  color: props.theme.color,
  opacity: 0.5,
  fontStyle: 'italic',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

class Leaderboard extends React.Component<Props, State> {
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
      showFullLeaderboard: false
    };

    void this.onLog();
  }

  private myScoresRef = createRef<HTMLTableRowElement>();
  private leaderboardScrollRef = createRef<HTMLDivElement>();

  private scrollToMyScores = () => {
    const container = this.leaderboardScrollRef.current;
    const row = this.myScoresRef.current;
    if (!container || !row) return;

    // row position relative to the scroll container
    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    const currentScrollTop = container.scrollTop;
    const targetTop = currentScrollTop + (rowRect.top - containerRect.top) - 30;

    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  // Get all challenge_completion collection

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

    const sortedUsers = this.orderUsersByCompletedChallenges(users);
    const topTen = sortedUsers.slice(0, 10);
    currentUser = this.getCurrentUser();
    const me = sortedUsers.find(user => user.id === currentUser.id);
    const usersById: Record<string, User> = sortedUsers.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, User>
    );
    this.setState({
      users: usersById,
      challenges,
      topTen,
      userContext: me ? me : undefined,
      sortedUsers,
      loading: false,
      totalParticipants: sortedUsers.length
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

  // Export current user's JBC scores to PDF - very simple, completed or not completed with timestamp

  private exportUserScores = (user: User) => {
    const { locale } = this.props;
    const pdfDoc = new jsPDF();


    // Title
    pdfDoc.setFontSize(18);
    pdfDoc.text('KIPR Challenge Scores', 105, 20, { align: 'center' });

    // Basic Info
    pdfDoc.setFontSize(14);
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

    pdfDoc.save(`${user.altId}-scores.pdf`);

  };

  private handleToggleView = () => {
    this.setState(
      prevState => ({
        showFullLeaderboard: !prevState.showFullLeaderboard,
        loading: false, // Show loading immediately
      }),
      () => {
        // Fetch new data

      }
    );
  };

  private renderLeaderboard = () => {

    const { locale, theme } = this.props;
    const { topEntries, userContext, loading, error, users, challenges, topTen, sortedUsers } = this.state;
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

    // Check if user is in top entries (to avoid duplicate display)
    const userInTopEntries = userContext && topEntries.some(e => e.id === userContext.id);

    // Show user context section only if user has a completion and is not in top N
    const showUserContextSection = userContext && !userInTopEntries;
    return (
      <LeaderboardScrollContainer ref={this.leaderboardScrollRef}>
        <Table>
          <thead>
            <tr>
              <StickyRankTh theme={theme}>
                {LocalizedString.lookup(tr('Rank'), locale)}
              </StickyRankTh>

              <StickyNameTh theme={theme}>
                {LocalizedString.lookup(tr('Name'), locale)}
              </StickyNameTh>
              {challengeArray.map((entry, index) => {
                return this.renderTableHeader(entry);
              })}

            </tr>
          </thead>
          {this.state.showFullLeaderboard ?
            <tbody>
              {sortedUsers.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = currentUser.id === entry.id;
                return this.renderLeaderboardRow(entry, rank, isCurrentUser, challengeArray)
              })}
            </tbody>
            :
            <tbody>
              {/* Top ten entries */}
              {topTen.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = currentUser.id === entry.id;
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
                  {this.renderLeaderboardRow(userContext, sortedUsers.findIndex(user => user.id === currentUser.id), true, challengeArray)}

                </>
              )}
            </tbody>
          }
        </Table>
      </LeaderboardScrollContainer>


    );
  };
  private renderTableHeader = (challengeName: string) => {
    const { theme, locale } = this.props;
    return (
      <TableHeader key={`${challengeName}-key`} theme={theme}>{LocalizedString.lookup(tr(`${challengeName}`), locale)}</TableHeader>
    );
  }
  private renderLeaderboardRow = (entry: User, rank: number, isCurrentUser: boolean, challengeArray: string[]) => {
    const { theme } = this.props;
    const { challenges } = this.state;
    return (
      <TableRow key={`${entry.id}-${rank}`} theme={theme} $highlight={isCurrentUser} ref={entry.name === SELFIDENTIFIER ? this.myScoresRef : null}>

        <StickyRankTd theme={theme} rank={rank} $highlight={isCurrentUser} >#{rank}</StickyRankTd>
        <StickyNameTd theme={theme} $highlight={isCurrentUser}>
          {entry.name}
          {isCurrentUser && ' (You)'}
        </StickyNameTd>
        {challengeArray.map((id) => {
          const userScore = entry.scores.find(score => score.name['en-US'] === challenges[id].name['en-US']);
          return (
            <TableCell key={id} theme={theme}>
              {!userScore && '-'}
              {userScore?.completed && (
                <>
                  <img src="/static/icons/favicon-32x32.png" alt="Favicon" />
                </>
              )}
              {userScore && !userScore.completed && (
                <img src="/static/icons/botguy-bw-trans-32x32.png" alt="Favicon" />
              )}
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  private renderClassroomLeaderboardNew = () => {
    const { theme, locale } = this.props;
    const currentUser = this.getCurrentUser();
    return (
      <ContentContainer theme={theme}>
        <LeaderboardContainer theme={theme}>
          <LeaderboardHeader theme={theme}>
            <LeaderboardTitle theme={theme}>
              {LocalizedString.lookup(tr('Leaderboard'), locale)}
              {this.state.totalParticipants > 0 && (
                <span style={{ fontSize: '0.7em', fontWeight: 'normal', opacity: 0.7, marginLeft: '8px' }}>
                  ({this.state.totalParticipants} {LocalizedString.lookup(tr('participants'), locale)})
                </span>
              )}
            </LeaderboardTitle>
            <LeaderboardViewToggle theme={theme}>
              <LeaderboardViewToggleButton
                theme={theme}
                onClick={this.handleToggleView}
                style={{ marginRight: '16px' }}
              >
                {this.state.showFullLeaderboard
                  ? LocalizedString.lookup(tr('Show Top Users'), locale)
                  : LocalizedString.lookup(tr('Show Full Board'), locale)}
              </LeaderboardViewToggleButton>
            </LeaderboardViewToggle>
          </LeaderboardHeader>
          {currentUser && (
            <YourNameContainer theme={theme}>
              <YourNameLabel theme={theme}>
                {LocalizedString.lookup(tr('Your name on the leaderboard:'), locale)}
              </YourNameLabel>
              <YourNameValue theme={theme}>
                {currentUser.altId}
              </YourNameValue>
            </YourNameContainer>
          )}
          {this.renderLeaderboard()}
        </LeaderboardContainer>
      </ContentContainer>
    )
  }
  render() {
    const { props, } = this;
    const { style, theme } = props;
    currentUser = this.getCurrentUser();

    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <div style={{ zIndex: 1, width: '100%', height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <LeaderboardTitleContainer>
            <h1>KIPR All Time Leaderboard</h1>

            <ButtonContainer>
              <Button theme={DARK} onClick={() => this.exportUserScores(currentUser)}> Export My Scores!</Button>
              <Button theme={DARK} onClick={this.scrollToMyScores}> Scroll to My Scores!</Button>
            </ButtonContainer>

          </LeaderboardTitleContainer>
          {this.renderClassroomLeaderboardNew()}
        </div>

      </PageContainer>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(Leaderboard) as React.ComponentType<LeaderboardPublicProps>;