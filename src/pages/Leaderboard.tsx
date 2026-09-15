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
import { TabBar } from '../components/Layout/TabBar';
import NativeScrollContainer from '../components/interface/NativeScrollContainer';
import {
  LEADERBOARD_CATEGORIES,
  LeaderboardCategoryId,
  categoryForChallengeId,
  challengeIdsForCategory,
  rankUsersForCategory,
  scoresForCategory,
} from '../util/leaderboardCategories';

let SELFIDENTIFIER: string;

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  src?: string;
  backgroundColor?: string;
}

interface Score {
  challengeId: string;
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
  loading: boolean;
  error?: string;
  selectedCategory: LeaderboardCategoryId;
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
const LeaderboardScrollContainer = styled(NativeScrollContainer, {
  flex: 1,
  minHeight: 0,
});

const CategoryTabsScrollContainer = styled(NativeScrollContainer, {
  flexShrink: 0,
  overflowY: 'hidden',
});

const CategoryTabBar = styled(TabBar, (props: ThemeProps) => ({
  minWidth: '640px',
  height: '48px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

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

const EmptyState = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: props.theme.color,
  opacity: 0.7,
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
      loading: true,
      selectedCategory: 'jbc',
      users: {},
      challenges: {},
      showFullLeaderboard: false
    };

    void this.onLog();
    SELFIDENTIFIER = LocalizedString.lookup(tr('My Scores!'), props.locale);
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
    
    // Regex to match `custom-<UUID>`
    const customChallengeRegex = /^custom-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (const [_, attemptedChallenges] of Object.entries(groupData)) {
      for (const [challengeId, challenge] of Object.entries(attemptedChallenges as ChallengeData[])) {
        // TEMP: Ignore custom challenges
        if (!categoryForChallengeId(challengeId) || customChallengeRegex.test(challengeId)) {
          continue;
        }
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
        if (!categoryForChallengeId(challengeId)) {
          continue;
        }

        const score: Score = {
          challengeId,
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
        if (!categoryForChallengeId(challengeId)) {
          continue;
        }

        const score: Score = {
          challengeId,
          name: tr(challengeId),
          completed: challengeCompletion(challenge)
        };
        user.scores.push(score);
      }

      if (!users[userId]) {
        users[userId] = user;
      }
    }

    const usersById: Record<string, User> = Object.values(users).reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, User>
    );
    this.setState({
      users: usersById,
      challenges,
      loading: false,
    });

    return { users, challenges };
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
        scores: user.scores,
        altId: user.altId,
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

  private getCurrentUser = (): User | null => {
    const { users } = this.state;
    const tokenManager = db.tokenManager;
    const currentUserAuth = tokenManager?.auth().currentUser;
    if (!currentUserAuth) return null;

    const leaderboardUser = users[currentUserAuth.uid];
    return {
      id: currentUserAuth.uid,
      name: currentUserAuth.displayName || 'Unknown',
      scores: leaderboardUser?.scores || [],
      altId: leaderboardUser?.altId || leaderboardUser?.name || 'Unknown'
    };
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

  // Export the current user's scores for the selected challenge category.

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

    const sortedScores = scoresForCategory(user.scores, this.state.selectedCategory);

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
    this.setState(prevState => ({
      showFullLeaderboard: !prevState.showFullLeaderboard,
    }));
  };

  private handleCategoryChange = (index: number) => {
    const category = LEADERBOARD_CATEGORIES[index];
    if (!category || category.id === this.state.selectedCategory) return;

    this.setState({ selectedCategory: category.id }, () => {
      this.leaderboardScrollRef.current?.scrollTo({ top: 0, left: 0 });
    });
  };

  private renderLeaderboard = () => {

    const { locale, theme } = this.props;
    const { loading, error, users, challenges, selectedCategory, showFullLeaderboard } = this.state;
    const challengeArray = challengeIdsForCategory(Object.keys(challenges), selectedCategory);
    const sortedUsers = rankUsersForCategory(users, selectedCategory);
    const topTen = sortedUsers.slice(0, 10);
    const currentUser = this.getCurrentUser();
    const userContext = currentUser
      ? sortedUsers.find(user => user.id === currentUser.id)
      : undefined;

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

    if (sortedUsers.length === 0) {
      return (
        <EmptyState theme={theme}>
          {LocalizedString.lookup(tr('No completions in this challenge category yet.'), locale)}
        </EmptyState>
      );
    }

    const userInTopTen = userContext && topTen.some(entry => entry.id === userContext.id);
    const showUserContextSection = !showFullLeaderboard && userContext && !userInTopTen;
    const tableUsers = showFullLeaderboard ? sortedUsers : topTen;
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
          <tbody>
            {tableUsers.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser?.id === entry.id;
              return this.renderLeaderboardRow(entry, rank, isCurrentUser, challengeArray);
            })}

            {showUserContextSection && (
              <>
                <SectionSeparator theme={theme}>
                  <SeparatorCell theme={theme} colSpan={challengeArray.length + 2}>
                    ··· {LocalizedString.lookup(tr('Your position'), locale)} ···
                  </SeparatorCell>
                </SectionSeparator>
                {this.renderLeaderboardRow(
                  userContext,
                  sortedUsers.findIndex(user => user.id === userContext.id) + 1,
                  true,
                  challengeArray
                )}
              </>
            )}
          </tbody>
        </Table>
      </LeaderboardScrollContainer>


    );
  };
  private renderTableHeader = (challengeName: string) => {
    const { theme, locale } = this.props;
    return (
      <TableHeader key={`${challengeName}-key`} theme={theme}>{LocalizedString.lookup(tr(`${challengeName}`), locale)}</TableHeader>
    );
  };
  private renderLeaderboardRow = (entry: User, rank: number, isCurrentUser: boolean, challengeArray: string[]) => {
    const { theme, locale } = this.props;
    return (
      <TableRow key={`${entry.id}-${rank}`} theme={theme} $highlight={isCurrentUser} ref={isCurrentUser ? this.myScoresRef : null}>

        <StickyRankTd theme={theme} rank={rank} $highlight={isCurrentUser} >#{rank}</StickyRankTd>
        <StickyNameTd theme={theme} $highlight={isCurrentUser}>
          {entry.name}
          {isCurrentUser && ` (${LocalizedString.lookup(tr('You'), locale)})`}
        </StickyNameTd>
        {challengeArray.map((id) => {
          const userScore = entry.scores.find(score => score.challengeId === id);
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
    const selectedCategoryIndex = LEADERBOARD_CATEGORIES.findIndex(
      category => category.id === this.state.selectedCategory
    );
    const totalParticipants = rankUsersForCategory(
      this.state.users,
      this.state.selectedCategory
    ).length;
    const categoryTabs: TabBar.TabDescription[] = LEADERBOARD_CATEGORIES.map(category => ({
      name: LocalizedString.lookup(category.label, locale),
    }));
    return (
      <ContentContainer theme={theme}>
        <LeaderboardContainer theme={theme}>
          <LeaderboardHeader theme={theme}>
            <LeaderboardTitle theme={theme}>
              {LocalizedString.lookup(tr('Leaderboard'), locale)}
              {totalParticipants > 0 && (
                <span style={{ fontSize: '0.7em', fontWeight: 'normal', opacity: 0.7, marginLeft: '8px' }}>
                  ({totalParticipants} {LocalizedString.lookup(tr('participants'), locale)})
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
          <CategoryTabsScrollContainer>
            <CategoryTabBar
              tabs={categoryTabs}
              index={selectedCategoryIndex}
              onIndexChange={this.handleCategoryChange}
              theme={theme}
            />
          </CategoryTabsScrollContainer>
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
    );
  };
  render() {
    const { props, } = this;
    const { style, theme } = props;
    const currentUser = this.getCurrentUser();

    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <div style={{ zIndex: 1, width: '100%', height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <LeaderboardTitleContainer>
            <h1>{LocalizedString.lookup(tr('KIPR All Time Leaderboard'), props.locale)}</h1>

            <ButtonContainer>
              <Button theme={DARK} onClick={() => currentUser && this.exportUserScores(currentUser)}> {LocalizedString.lookup(tr('Export My Scores!'), props.locale)}</Button>
              <Button theme={DARK} onClick={this.scrollToMyScores}> {LocalizedString.lookup(tr('Scroll to My Scores!'), props.locale)}</Button>
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
