import * as React from 'react';
import { styled } from 'styletron-react';
import { Sentiment, Feedback } from '../../Feedback';
import SentimentCharm from './SentimentCharm';
import { FeedbackTextArea, FeedbackEmailInput, FeedbackText, FeedbackLabel } from './FeedbackInputs';
import { StyleProps } from '../../style';
import { Dialog } from '../Dialog';
import DialogBar from "../DialogBar";
import { ThemeProps } from '../theme';
import { Fa } from '../Fa';

import { faFrown, faMeh, faPaperPlane, faSmileBeam } from '@fortawesome/free-solid-svg-icons';

import tr from '@i18n';

import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import LocalizedString from '../../util/LocalizedString';

export interface FeedbackDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onSubmit: () => void;
  feedback: Feedback;
  onFeedbackChange: (settings: Partial<Feedback>) => void;
}

interface FeedbackDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface FeedbackDialogState {}

type Props = FeedbackDialogPublicProps & FeedbackDialogPrivateProps;
type State = FeedbackDialogState;

export const FeedbackContainer = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
}));

export const CenterContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  textAlign: 'center',
  color: props.theme.color,
}));

export const FeedbackRowContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: `${props.theme.itemPadding * 2}px`,
}));

export const FeedbackLink = styled('a', () => ({
  color: 'lightblue',
}));

class FeedbackDialog extends React.PureComponent<Props, State> {
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
        <SentimentCharm theme={theme} icon={faFrown} selected={getValue(currentFeedback) === Sentiment.Sad} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Sad))
        }/>
        <SentimentCharm theme={theme} icon={faMeh} selected={getValue(currentFeedback) === Sentiment.Okay} onClick={
          () => onFeedbackChange(getUpdatedFeedback(Sentiment.Okay))
        }/>
        <SentimentCharm theme={theme} icon={faSmileBeam} selected={getValue(currentFeedback) === Sentiment.Happy} onClick={
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
    const { theme, feedback: currentFeedback, onFeedbackChange, locale } = this.props;

    return (
      <FeedbackTextArea theme={theme} placeholder={LocalizedString.lookup(tr('Give a helpful description of a problem you\'re facing, or a feature you\'d like to request'), locale)}
        value={getValue(currentFeedback)} 
        onChange={(event) => {
          onFeedbackChange(getUpdatedFeedback(event.target.value));
        }}
      />
    );
  };

  private createFeedbackEmailInput = (getValue: (feedback: Feedback) => string, getUpdatedFeedback: (newValue: string) => Partial<Feedback>) => {
    const { theme, feedback: currentFeedback, onFeedbackChange } = this.props;

    return (
      <FeedbackEmailInput theme={theme} 
        value={getValue(currentFeedback)} 
        onChange={(event) => {
          onFeedbackChange(getUpdatedFeedback(event.target.value));
        }}
      />
    );
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, onSubmit, locale } = props;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Feedback'), locale)}
        onClose={onClose}
      >
        <FeedbackContainer theme={theme}>
          <FeedbackText>
            {LocalizedString.lookup(tr('Thanks for using the KIPR Simulator! Find a bug? Have a feature request? Let us know!'), locale)}
          </FeedbackText>
          <br /> <br />
          <FeedbackText>{LocalizedString.lookup(tr('Feedback'), locale)}</FeedbackText>
          <br />
          {this.createFeedbackTextArea(
            (feedback: Feedback) => feedback.feedback,
            (newValue: string) => ({ feedback: newValue })
          )}
          <FeedbackText>
            {LocalizedString.lookup(tr('How has your experience using the KIPR Simulator been?'), locale)}
          </FeedbackText>
          <br />
          <CenterContainer theme={theme}>
            {this.createSentimentInput(
              (feedback: Feedback) => feedback.sentiment,
              (newValue: Sentiment) => ({ sentiment: newValue })
            )}
          </CenterContainer>
          <FeedbackContainer theme={theme}>
            <FeedbackLabel>
              <FeedbackText>
                {LocalizedString.lookup(tr('Email (optional): '), locale)}
              </FeedbackText>
            </FeedbackLabel>
            {this.createFeedbackEmailInput(
              (feedback: Feedback) => feedback.email,
              (newValue: string) => ({ email: newValue })
            )}
          </FeedbackContainer>
          <FeedbackContainer theme={theme}>
            <FeedbackLabel>
              <FeedbackText>
                {LocalizedString.lookup(tr('Include anonymous usage data to help KIPR developers'), locale)}
              </FeedbackText>
            </FeedbackLabel>
            {this.createCheckbox(
              (feedback: Feedback) => feedback.includeAnonData,
              (newValue: boolean) => ({ includeAnonData: newValue })
            )}
          </FeedbackContainer>
          <CenterContainer theme={theme}>
            <FeedbackText>
              {this.props.feedback.message}
            </FeedbackText>
          </CenterContainer>
          {this.props.feedback.error &&
            <CenterContainer theme={theme}>
              <p>
                <>{LocalizedString.lookup(tr('Please try again,'), locale)} </>
                <FeedbackLink href="https://github.com/kipr/Simulator/issues" target="_blank">
                  {LocalizedString.lookup(tr('open an issue on our github page'), locale)}
                </FeedbackLink>
                <>{LocalizedString.lookup(tr(', or'), locale)}</>
                <FeedbackLink href="mailto:info@kipr.org">
                  {LocalizedString.lookup(tr('email KIPR.'), locale)}
                </FeedbackLink>
              </p>
            </CenterContainer>
          }
        </FeedbackContainer>
        <DialogBar theme={theme} onAccept={onSubmit}>
          <Fa icon={faPaperPlane}/> {LocalizedString.lookup(tr('Submit'), props.locale)}
        </DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(FeedbackDialog) as React.ComponentType<FeedbackDialogPublicProps>;