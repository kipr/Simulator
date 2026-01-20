import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';

import { DARK, ThemeProps } from '../components/constants/theme';
import MainMenu from '../components/MainMenu';
import { CountdownTimer } from '../components/LimitedChallenge';

import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';

import { State as ReduxState } from '../state';
import { LimitedChallengeBrief, AsyncLimitedChallenge, LimitedChallengeStatus } from '../state/State/LimitedChallenge';
import Async from '../state/State/Async';
import { LeaderboardEntry, LeaderboardSortField, LeaderboardAroundMeResponse, LeaderboardUserContext } from '../state/State/LimitedChallengeLeaderboard';

import { withParams } from '../util/withParams';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import tr from '@i18n';
import db from '../db';

export interface LimitedChallengeLeaderboardRouteParams {
  [key: string]: string | undefined;
  challengeId: string;
}

export interface LimitedChallengeLeaderboardPublicProps extends StyleProps, ThemeProps {
  params: LimitedChallengeLeaderboardRouteParams;
}

interface LimitedChallengeLeaderboardPrivateProps {
  locale: LocalizedString.Language;
  challenge?: AsyncLimitedChallenge;
  currentUserUid?: string;
}

interface LimitedChallengeLeaderboardState {
  topEntries: LeaderboardEntry[];
  userContext?: LeaderboardUserContext;
  totalParticipants: number;
  loading: boolean;
  error?: string;
  sortField: LeaderboardSortField;
  status: LimitedChallengeStatus;
}

type Props = LimitedChallengeLeaderboardPublicProps & LimitedChallengeLeaderboardPrivateProps & WithNavigateProps;
type State = LimitedChallengeLeaderboardState;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  minHeight: '100vh',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
}));

const ContentContainer = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  overflow: 'auto',
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

const StatusBadge = styled('div', (props: ThemeProps & { status: LimitedChallengeStatus }) => ({
  padding: '6px 16px',
  fontSize: '0.85em',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  color: '#fff',
  borderRadius: '4px',
  marginBottom: '16px',
  backgroundColor: props.status === 'open'
    ? '#4caf50'
    : props.status === 'upcoming'
      ? '#ff9800'
      : '#9e9e9e',
}));

const ButtonContainer = styled('div', () => ({
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

interface ButtonProps {
  $disabled?: boolean;
  $primary?: boolean;
}

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

const UserRankBanner = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '16px 20px',
  backgroundColor: 'rgba(33, 150, 243, 0.15)',
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const UserRankText = styled('span', () => ({
  fontSize: '1.1em',
  fontWeight: 'bold',
  color: '#2196f3',
}));

const UserRankDetail = styled('span', (props: ThemeProps) => ({
  fontSize: '0.9em',
  color: props.theme.color,
  opacity: 0.8,
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

class LimitedChallengeLeaderboard extends React.Component<Props, State> {
  private statusIntervalId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    
    const challengeBrief = this.getChallengeBrief();
    
    this.state = {
      topEntries: [],
      userContext: undefined,
      totalParticipants: 0,
      loading: true,
      sortField: 'runtime',
      status: challengeBrief ? LimitedChallengeStatus.fromBrief(challengeBrief) : 'closed',
    };
  }

  componentDidMount() {
    void this.fetchLeaderboard();
    
    // Update status periodically
    this.statusIntervalId = setInterval(() => {
      const challengeBrief = this.getChallengeBrief();
      if (challengeBrief) {
        const newStatus = LimitedChallengeStatus.fromBrief(challengeBrief);
        if (newStatus !== this.state.status) {
          this.setState({ status: newStatus });
        }
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.statusIntervalId) {
      clearInterval(this.statusIntervalId);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.params.challengeId !== this.props.params.challengeId) {
      void this.fetchLeaderboard();
    }
  }

  private getChallengeBrief = (): LimitedChallengeBrief | undefined => {
    const { challenge } = this.props;
    return challenge ? Async.brief(challenge) : undefined;
  };

  private fetchLeaderboard = async () => {
    const { params: { challengeId } } = this.props;
    
    this.setState({ loading: true, error: undefined });
    
    try {
      const token = await db.tokenManager?.token();
      const response = await fetch(`/api/limited_challenge_completion/${challengeId}/leaderboard/around-me?top=10&range=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      
      const data = await response.json() as LeaderboardAroundMeResponse;
      
      this.setState({
        topEntries: data.topEntries,
        userContext: data.userContext,
        totalParticipants: data.totalParticipants,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
      });
    }
  };

  private handleBackClick = () => {
    this.props.navigate('/limited-challenges');
  };

  private handleEnterChallenge = () => {
    const { params: { challengeId } } = this.props;
    window.location.href = `/limited-challenge/${challengeId}`;
  };

  private handleSortChange = (field: LeaderboardSortField) => {
    this.setState({ sortField: field });
  };

  private formatRuntime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = ms % 1000;

    const secondsStr = remainingSeconds.toString()
      .padStart(2, '0');
    const msStr = Math.floor(remainingMs / 10).toString()
      .padStart(2, '0');

    if (minutes > 0) {
      return `${minutes}:${secondsStr}.${msStr}`;
    }
    return `${remainingSeconds}.${msStr}s`;
  };

  private formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Generate a deterministic pseudonym from a user ID for privacy.
   * Uses the same algorithm as the main Leaderboard component.
   */
  private anonymizeUserId = (uid: string): string => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
      'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet', 'gold', 'silver', 'bronze', 'maroon', 'tan', 'navy', 'aqua'];
    const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'metal', 'wood', 'ice',
      'shadow', 'spirit', 'void', 'plasma', 'gravity', 'time', 'space', 'aether', 'chaos', 'order'];
    const animals = ['tiger', 'bear', 'wolf', 'eagle', 'shark', 'whale', 'lion', 'panther', 'jaguar',
      'fox', 'owl', 'hawk', 'dolphin', 'rhino', 'hippo', 'giraffe', 'zebra',
      'koala', 'panda', 'leopard', 'lynx', 'bison', 'buffalo', 'camel',
      'raven', 'sparrow', 'swan', 'toucan', 'vulture', 'walrus', 'yak'];

    // FNV-1a hash function to convert string to 32-bit integer
    const stringTo32BitInt = (id: string): number => {
      const FNV_PRIME = 0x01000193; // 16777619
      let hash = 0x811c9dc5; // FNV offset basis

      for (let i = 0; i < id.length; i++) {
        hash ^= id.charCodeAt(i);
        hash = (hash * FNV_PRIME) >>> 0;
      }

      return hash >>> 0;
    };

    const hash = Math.abs(stringTo32BitInt(uid));
    const color = colors[hash % colors.length];
    const element = elements[hash % elements.length];
    const animal = animals[hash % animals.length];
    const number = hash % 97;

    return `${color}-${element}-${animal}-${number}`;
  };

  private getStatusText = (): string => {
    const { locale } = this.props;
    const { status } = this.state;

    switch (status) {
      case 'upcoming': return LocalizedString.lookup(tr('Upcoming'), locale);
      case 'open': return LocalizedString.lookup(tr('Open'), locale);
      case 'closed': return LocalizedString.lookup(tr('Closed'), locale);
    }
  };

  private getDisabledMessage = (): string | null => {
    const { locale } = this.props;
    const { status } = this.state;

    switch (status) {
      case 'upcoming':
        return LocalizedString.lookup(tr('This challenge has not opened yet.'), locale);
      case 'closed':
        return LocalizedString.lookup(tr('This challenge is closed and no longer accepting submissions.'), locale);
      default:
        return null;
    }
  };

  private renderLeaderboardRow = (entry: LeaderboardEntry, rank: number, isCurrentUser: boolean) => {
    const theme = DARK;
    return (
      <TableRow key={`${entry.uid}-${rank}`} theme={theme} $highlight={isCurrentUser}>
        <RankCell theme={theme} rank={rank}>#{rank}</RankCell>
        <TableCell theme={theme}>
          {this.anonymizeUserId(entry.uid)}
          {isCurrentUser && ' (You)'}
        </TableCell>
        <TableCell theme={theme}>{this.formatRuntime(entry.bestRuntimeMs)}</TableCell>
        <TableCell theme={theme}>{this.formatDate(entry.bestCompletionTime)}</TableCell>
      </TableRow>
    );
  };

  private renderLeaderboard = () => {
    const { locale, currentUserUid } = this.props;
    const { topEntries, userContext, totalParticipants, loading, error, sortField } = this.state;
    const theme = DARK;

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

    if (topEntries.length === 0 && !userContext) {
      return (
        <EmptyState theme={theme}>
          {LocalizedString.lookup(tr('No completions yet. Be the first to complete this challenge!'), locale)}
        </EmptyState>
      );
    }

    // Sort top entries based on selected sort field
    const sortedTopEntries = LeaderboardEntry.sort(topEntries, sortField);

    // Check if user is in top entries (to avoid duplicate display)
    const userInTopEntries = userContext && sortedTopEntries.some(e => e.uid === userContext.userEntry.uid);

    // For user context section, we need to sort and calculate ranks appropriately
    const showUserContextSection = userContext && !userInTopEntries;

    return (
      <Table>
        <thead>
          <tr>
            <TableHeader theme={theme}>{LocalizedString.lookup(tr('Rank'), locale)}</TableHeader>
            <TableHeader theme={theme}>{LocalizedString.lookup(tr('Name'), locale)}</TableHeader>
            <TableHeader theme={theme}>{LocalizedString.lookup(tr('Runtime'), locale)}</TableHeader>
            <TableHeader theme={theme}>{LocalizedString.lookup(tr('Completed'), locale)}</TableHeader>
          </tr>
        </thead>
        <tbody>
          {/* Top entries */}
          {sortedTopEntries.map((entry, index) => {
            // When sorted by runtime, index+1 is the rank
            // When sorted by completion time, we still show runtime-based rank for consistency
            const rank = sortField === 'runtime'
              ? index + 1
              : topEntries.findIndex(e => e.uid === entry.uid) + 1;
            const isCurrentUser = currentUserUid === entry.uid;
            return this.renderLeaderboardRow(entry, rank, isCurrentUser);
          })}

          {/* Separator and user context section */}
          {showUserContextSection && (
            <>
              <SectionSeparator theme={theme}>
                <SeparatorCell theme={theme} colSpan={4}>
                  ··· {LocalizedString.lookup(tr('Your position'), locale)} ···
                </SeparatorCell>
              </SectionSeparator>

              {/* Entries above user */}
              {userContext.entriesAbove.map((entry, index) => {
                const rank = userContext.rank - userContext.entriesAbove.length + index;
                return this.renderLeaderboardRow(entry, rank, false);
              })}

              {/* User's entry */}
              {this.renderLeaderboardRow(userContext.userEntry, userContext.rank, true)}

              {/* Entries below user */}
              {userContext.entriesBelow.map((entry, index) => {
                const rank = userContext.rank + index + 1;
                return this.renderLeaderboardRow(entry, rank, false);
              })}
            </>
          )}
        </tbody>
      </Table>
    );
  };

  render() {
    const { props, state } = this;
    const { style, locale, currentUserUid } = props;
    const { sortField, status } = state;
    const theme = DARK;

    const challengeBrief = this.getChallengeBrief();
    const name = challengeBrief ? LocalizedString.lookup(challengeBrief.name, locale) : '';
    const description = challengeBrief ? LocalizedString.lookup(challengeBrief.description, locale) : '';

    const isOpen = status === 'open';
    const disabledMessage = this.getDisabledMessage();
    const currentUserName = currentUserUid ? this.anonymizeUserId(currentUserUid) : undefined;

    return (
      <Container style={style} theme={theme}>
        <MainMenu theme={theme} />
        <ContentContainer theme={theme}>
          <Header>
            <BackButton theme={theme} onClick={this.handleBackClick}>
              {LocalizedString.lookup(tr('Back to Challenges'), locale)}
            </BackButton>
            
            <ChallengeName theme={theme}>{name}</ChallengeName>
            <ChallengeDescription theme={theme}>{description}</ChallengeDescription>
            
            <StatusBadge theme={theme} status={status}>
              {this.getStatusText()}
            </StatusBadge>

            {status === 'upcoming' && challengeBrief && (
              <CountdownTimer
                theme={theme}
                targetDate={challengeBrief.openDate}
                locale={locale}
                label={LocalizedString.lookup(tr('Opens in'), locale)}
              />
            )}

            {status === 'open' && challengeBrief && (
              <CountdownTimer
                theme={theme}
                targetDate={challengeBrief.closeDate}
                locale={locale}
                label={LocalizedString.lookup(tr('Closes in'), locale)}
              />
            )}

            {disabledMessage && (
              <DisabledMessage theme={theme}>{disabledMessage}</DisabledMessage>
            )}

            <ButtonContainer>
              <Button
                theme={theme}
                $primary
                $disabled={!isOpen}
                disabled={!isOpen}
                onClick={isOpen ? this.handleEnterChallenge : undefined}
              >
                {LocalizedString.lookup(tr('Enter Challenge'), locale)}
              </Button>
            </ButtonContainer>
          </Header>

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
              <SortToggle theme={theme}>
                <span>{LocalizedString.lookup(tr('Sort by:'), locale)}</span>
                <SortButton
                  theme={theme}
                  $active={sortField === 'completionTime'}
                  onClick={() => this.handleSortChange('completionTime')}
                >
                  {LocalizedString.lookup(tr('First to Complete'), locale)}
                </SortButton>
                <SortButton
                  theme={theme}
                  $active={sortField === 'runtime'}
                  onClick={() => this.handleSortChange('runtime')}
                >
                  {LocalizedString.lookup(tr('Fastest Runtime'), locale)}
                </SortButton>
              </SortToggle>
            </LeaderboardHeader>
            {currentUserName && (
              <YourNameContainer theme={theme}>
                <YourNameLabel theme={theme}>
                  {LocalizedString.lookup(tr('Your name on the leaderboard:'), locale)}
                </YourNameLabel>
                <YourNameValue theme={theme}>
                  {currentUserName}
                </YourNameValue>
              </YourNameContainer>
            )}
            {this.renderLeaderboard()}
          </LeaderboardContainer>
        </ContentContainer>
      </Container>
    );
  }
}

const ConnectedLimitedChallengeLeaderboard = connect(
  (state: ReduxState, { params: { challengeId } }: LimitedChallengeLeaderboardPublicProps) => ({
    locale: state.i18n.locale,
    challenge: state.limitedChallenges[challengeId],
    currentUserUid: state.users.me,
  })
)(withNavigate(LimitedChallengeLeaderboard));

export default withParams<LimitedChallengeLeaderboardRouteParams>()(ConnectedLimitedChallengeLeaderboard);
