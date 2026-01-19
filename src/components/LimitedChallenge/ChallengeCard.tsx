import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import { LimitedChallengeBrief, LimitedChallengeStatus } from '../../state/State/LimitedChallenge';
import { LimitedChallengeCompletionBrief } from '../../state/State/LimitedChallengeCompletion';
import CountdownTimer from './CountdownTimer';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';

export interface ChallengeCardProps extends ThemeProps {
  challengeId: string;
  challenge: LimitedChallengeBrief;
  completion?: LimitedChallengeCompletionBrief;
  locale: LocalizedString.Language;
  onClick: (challengeId: string) => void;
}

interface ChallengeCardState {
  status: LimitedChallengeStatus;
}

const Container = styled('div', (props: ThemeProps & { status: LimitedChallengeStatus }) => ({
  width: '100%',
  maxWidth: '350px',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  borderRadius: `${props.theme.itemPadding * 2}px`,
  border: `1px solid ${props.theme.borderColor}`,
  overflow: 'hidden',
  margin: '10px',
  transition: 'all 0.3s ease',
  cursor: props.status === 'open' ? 'pointer' : 'default',
  opacity: props.status === 'closed' ? 0.7 : 1,
  ':hover': props.status === 'open' ? {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  } : {},
}));

const StatusBadge = styled('div', (props: ThemeProps & { status: LimitedChallengeStatus }) => ({
  padding: '4px 12px',
  fontSize: '0.75em',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  color: '#fff',
  backgroundColor: props.status === 'open' ? '#4caf50' :
    props.status === 'upcoming' ? '#ff9800' : '#9e9e9e',
}));

const Content = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const Title = styled('div', (props: ThemeProps) => ({
  fontSize: '1.25em',
  fontWeight: 'bold',
  color: props.theme.color,
  marginBottom: '8px',
}));

const Description = styled('div', (props: ThemeProps) => ({
  fontSize: '0.9em',
  color: props.theme.color,
  opacity: 0.8,
  marginBottom: '12px',
  flex: 1,
}));

const TimerContainer = styled('div', () => ({
  marginTop: 'auto',
}));

const CompletionInfo = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '8px',
  backgroundColor: 'rgba(76, 175, 80, 0.2)',
  borderRadius: '4px',
  marginTop: '8px',
}));

const CompletionLabel = styled('div', (props: ThemeProps) => ({
  fontSize: '0.75em',
  color: props.theme.color,
  opacity: 0.7,
}));

const CompletionValue = styled('div', (props: ThemeProps) => ({
  fontSize: '1.1em',
  fontWeight: 'bold',
  color: '#4caf50',
}));

const LockedOverlay = styled('div', () => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)',
  pointerEvents: 'none',
}));

class ChallengeCard extends React.Component<ChallengeCardProps, ChallengeCardState> {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(props: ChallengeCardProps) {
    super(props);
    this.state = {
      status: LimitedChallengeStatus.fromBrief(props.challenge),
    };
  }

  componentDidMount() {
    // Update status every second to handle transitions
    this.intervalId = setInterval(() => {
      const newStatus = LimitedChallengeStatus.fromBrief(this.props.challenge);
      if (newStatus !== this.state.status) {
        this.setState({ status: newStatus });
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private formatRuntime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = ms % 1000;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${Math.floor(remainingMs / 10).toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}.${Math.floor(remainingMs / 10).toString().padStart(2, '0')}s`;
  }

  private handleClick = () => {
    const { status } = this.state;
    const { challengeId, onClick } = this.props;

    if (status === 'open') {
      onClick(challengeId);
    }
  };

  private getStatusText(): string {
    const { locale } = this.props;
    const { status } = this.state;

    switch (status) {
      case 'upcoming': return LocalizedString.lookup(tr('Upcoming'), locale);
      case 'open': return LocalizedString.lookup(tr('Open'), locale);
      case 'closed': return LocalizedString.lookup(tr('Closed'), locale);
    }
  }

  render() {
    const { challenge, completion, theme, locale } = this.props;
    const { status } = this.state;

    const name = LocalizedString.lookup(challenge.name, locale);
    const description = LocalizedString.lookup(challenge.description, locale);

    return (
      <Container theme={theme} status={status} onClick={this.handleClick}>
        <StatusBadge theme={theme} status={status}>
          {this.getStatusText()}
        </StatusBadge>
        <Content theme={theme}>
          <Title theme={theme}>{name}</Title>
          <Description theme={theme}>{description}</Description>

          <TimerContainer>
            {status === 'upcoming' && (
              <CountdownTimer
                theme={theme}
                targetDate={challenge.openDate}
                locale={locale}
                label={LocalizedString.lookup(tr('Opens in'), locale)}
              />
            )}
            {status === 'open' && (
              <CountdownTimer
                theme={theme}
                targetDate={challenge.closeDate}
                locale={locale}
                label={LocalizedString.lookup(tr('Closes in'), locale)}
              />
            )}
          </TimerContainer>

          {completion?.bestRuntimeMs !== undefined && (
            <CompletionInfo theme={theme}>
              <CompletionLabel theme={theme}>
                {LocalizedString.lookup(tr('Best Time'), locale)}
              </CompletionLabel>
              <CompletionValue theme={theme}>
                {this.formatRuntime(completion.bestRuntimeMs)}
              </CompletionValue>
            </CompletionInfo>
          )}
        </Content>
      </Container>
    );
  }
}

export default ChallengeCard;
