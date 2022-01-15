import * as React from 'react';
import { styled } from 'styletron-react';
import { Sentiment, Feedback } from '../../Feedback';
import SentimentCharm from './SentimentCharm';
import FeedbackTextArea from './FeedbackTextArea';
import { StyleProps } from '../../style';
import { Dialog } from '../Dialog';
import Button from '../Button';
import { ThemeProps } from '../theme';

export interface FeedbackDialogProp extends ThemeProps, StyleProps {
  onClose: () => void;
  onSubmit: () => void;
  feedback: Feedback;
  onFeedbackChange: (settings: Partial<Feedback>) => void;
}

interface FeedbackDialogState {}

type Props = FeedbackDialogProp;
type State = FeedbackDialogState;

const FeedbackContainer = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
}));

const CenterContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  color: props.theme.color,
}));

const FeedbackRowContainer = styled('div', (props: ThemeProps) => ({
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
    const { theme, feedback: currentFeedback, onFeedbackChange } = this.props;

    return (
      <FeedbackRowContainer theme={theme}>
        <SentimentCharm theme={theme} icon='frown' selected={getValue(currentFeedback) === Sentiment.Sad} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Sad))
        }/>
        <SentimentCharm theme={theme} icon='meh' selected={getValue(currentFeedback) === Sentiment.Okay} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Okay))
        }/>
        <SentimentCharm theme={theme} icon='smile-beam' selected={getValue(currentFeedback) === Sentiment.Happy} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Happy))
        }/>
      </FeedbackRowContainer>
    );
  };

  private createCheckbox = (getValue: (feedback: Feedback) => boolean, getUpdatedFeedback: (newValue: boolean) => Partial<Feedback>) => {
    const { theme, feedback: currentFeedback, onFeedbackChange } = this.props;

    return (
      <input type="checkbox" checked={getValue(currentFeedback)} onChange={() => { 
        onFeedbackChange(getUpdatedFeedback(!getValue(currentFeedback))); 
      }}/>
    );
  };

  private createFeedbackTextArea = (getValue: (feedback: Feedback) => string, getUpdatedFeedback: (newValue: string) => Partial<Feedback>) => {
    const { theme, feedback: currentFeedback, onFeedbackChange } = this.props;

    return (
      <FeedbackTextArea theme={theme} 
        value={getValue(currentFeedback)} 
        onChange={(event) => {
          onFeedbackChange(getUpdatedFeedback(event.target.value));
        }}
      />
    );
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, onSubmit } = props;
    // const { selectedSection } = state;

    return (
      <Dialog theme={theme} name='Feedback' onClose={onClose}>
        <FeedbackContainer theme={theme}>
          Thanks for using the KIPR Simulator! Find a bug? Have a feature request? Let us know!
          <br /> <br />
          Feedback
          <br />
          {/* <CenterContainer theme={theme}> */}
          {/* <ScrollArea theme={theme} autoscroll={false}> */}
          {this.createFeedbackTextArea(
            (feedback: Feedback) => feedback.feedback,
            (newValue: string) => ({ feedback: newValue })
          )}
          {/* </ScrollArea> */}
          {/* </CenterContainer> */}
          How has your experience been? 
          <br />
          <CenterContainer theme={theme}>
            {this.createSentimentInput(
              (feedback: Feedback) => feedback.sentiment,
              (newValue: Sentiment) => ({ sentiment: newValue })
            )}
          </CenterContainer>
          <CenterContainer theme={theme}>
            <>
              Include anonymous information about my code and browser to help KIPR developers
              {this.createCheckbox(
                (feedback: Feedback) => feedback.includeAnonData,
                (newValue: boolean) => ({ includeAnonData: newValue })
              )}
            </>
          </CenterContainer>
          <CenterContainer theme={theme}>
            <>
              Include my user information
              {this.createCheckbox(
                (feedback: Feedback) => feedback.includeUserData,
                (newValue: boolean) => ({ includeUserData: newValue })
              )}
            </>
          </CenterContainer>
          <CenterContainer theme={theme}>
            <Button theme={theme} onClick={(e) => {
              onSubmit();
              onClose();
            }}>
              Submit
            </Button>
          </CenterContainer>
        </FeedbackContainer>
      </Dialog>
    );
  }
}