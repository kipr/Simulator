import * as React from 'react';
import { styled } from 'styletron-react';
import { Sentiment, Feedback } from '../../Feedback';
import SentimentCharm from './SentimentCharm';
import { StyleProps } from '../../style';
import { Dialog } from '../Dialog';
import ScrollArea from '../ScrollArea';
import { ThemeProps } from '../theme';

export interface FeedbackDialogProp extends ThemeProps, StyleProps {
  onClose: () => void;
  feedback: Feedback;
  onFeedbackChange: (settings: Partial<Feedback>) => void;
}

interface FeedbackDialogState {}

type Props = FeedbackDialogProp;
type State = FeedbackDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  color: props.theme.color,
  minHeight: '300px',
}));

const FeedbackContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: `${props.theme.itemPadding * 2}px`,
}));

export class FeedbackDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSection: 'simulation',
    };
  }

  private createSentimentInput = (getValue: (feedback: Feedback) => Sentiment, getUpdatedFeedback: (newValue: Sentiment) => Partial<Feedback>) => {
    const { theme, feedback: currentSettings, onFeedbackChange } = this.props;

    return (
      <FeedbackContainer theme={theme}>
        <SentimentCharm theme={theme} icon='frown' selected={getValue(currentSettings) === Sentiment.Sad} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Sad))
        }/>
        <SentimentCharm theme={theme} icon='meh' selected={getValue(currentSettings) === Sentiment.Okay} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Okay))
        }/>
        <SentimentCharm theme={theme} icon='smile-beam' selected={getValue(currentSettings) === Sentiment.Happy} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Happy))
        }/>
      </FeedbackContainer>
    );
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose } = props;
    // const { selectedSection } = state;

    return (
      <Dialog theme={theme} name='Feedback' onClose={onClose}>
        <Container theme={theme}>
          <>
            {this.createSentimentInput(
              (feedback: Feedback) => feedback.sentiment,
              (newValue: Sentiment) => ({ sentiment: newValue })
            )}
          </>
        </Container>
      </Dialog>
    );
  }
}