import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

export interface CountdownTimerProps extends ThemeProps {
  targetDate: string;
  locale: LocalizedString.Language;
  label?: string;
  onComplete?: () => void;
}

interface CountdownTimerState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '8px 16px',
  backgroundColor: props.theme.backgroundColor,
  borderRadius: '8px',
  border: `1px solid ${props.theme.borderColor}`,
}));

const Label = styled('div', (props: ThemeProps) => ({
  fontSize: '0.85em',
  color: props.theme.color,
  marginBottom: '4px',
  opacity: 0.8,
}));

const TimeContainer = styled('div', () => ({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
}));

const TimeUnit = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '40px',
}));

const TimeValue = styled('div', (props: ThemeProps) => ({
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: props.theme.color,
}));

const TimeLabel = styled('div', (props: ThemeProps) => ({
  fontSize: '0.7em',
  color: props.theme.color,
  opacity: 0.7,
  textTransform: 'uppercase',
}));

const Separator = styled('div', (props: ThemeProps) => ({
  fontSize: '1.5em',
  fontWeight: 'bold',
  color: props.theme.color,
  opacity: 0.5,
}));

class CountdownTimer extends React.Component<CountdownTimerProps, CountdownTimerState> {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(props: CountdownTimerProps) {
    super(props);
    this.state = this.calculateTimeLeft();
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      const timeLeft = this.calculateTimeLeft();
      this.setState(timeLeft);

      if (timeLeft.completed && this.props.onComplete) {
        this.props.onComplete();
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private calculateTimeLeft(): CountdownTimerState {
    const target = new Date(this.props.targetDate).getTime();
    const now = Date.now();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        completed: true,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      completed: false,
    };
  }

  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  render() {
    const { theme, label, locale } = this.props;
    const { days, hours, minutes, seconds, completed } = this.state;

    if (completed) {
      return null;
    }

    return (
      <Container theme={theme}>
        {label && <Label theme={theme}>{label}</Label>}
        <TimeContainer>
          {days > 0 && (
            <>
              <TimeUnit theme={theme}>
                <TimeValue theme={theme}>{days}</TimeValue>
                <TimeLabel theme={theme}>{LocalizedString.lookup(tr('days'), locale)}</TimeLabel>
              </TimeUnit>
              <Separator theme={theme}>:</Separator>
            </>
          )}
          <TimeUnit theme={theme}>
            <TimeValue theme={theme}>{this.padNumber(hours)}</TimeValue>
            <TimeLabel theme={theme}>{LocalizedString.lookup(tr('hrs'), locale)}</TimeLabel>
          </TimeUnit>
          <Separator theme={theme}>:</Separator>
          <TimeUnit theme={theme}>
            <TimeValue theme={theme}>{this.padNumber(minutes)}</TimeValue>
            <TimeLabel theme={theme}>{LocalizedString.lookup(tr('min'), locale)}</TimeLabel>
          </TimeUnit>
          <Separator theme={theme}>:</Separator>
          <TimeUnit theme={theme}>
            <TimeValue theme={theme}>{this.padNumber(seconds)}</TimeValue>
            <TimeLabel theme={theme}>{LocalizedString.lookup(tr('sec'), locale)}</TimeLabel>
          </TimeUnit>
        </TimeContainer>
      </Container>
    );
  }
}

export default CountdownTimer;
