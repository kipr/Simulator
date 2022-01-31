import * as React from 'react';
import { FeedbackText } from './FeedbackInputs';
import { StyleProps } from '../../style';
import { Dialog } from '../Dialog';
import { ThemeProps } from '../theme';
import { FeedbackContainer, CenterContainer } from './index';

export interface FeedbackSuccessDialogProp extends ThemeProps, StyleProps {
  onClose: () => void;
}

interface FeedbackSuccessDialogState {}

type Props = FeedbackSuccessDialogProp;
type State = FeedbackSuccessDialogState;

export class FeedbackSuccessDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSection: 'simulation',
    };
  }
  
  render() {
    const { props, state } = this;
    const { style, className, theme, onClose } = props;

    return (
      <Dialog theme={theme} name='Feedback Success' onClose={onClose}>
        <FeedbackContainer theme={theme}>
          <CenterContainer theme={theme}>
            <FeedbackText>
              <p>Feedback successfully submitted!</p>
              <p>Thank you for helping improve the KIPR Simulator!</p>
            </FeedbackText>
          </CenterContainer>
        </FeedbackContainer>
      </Dialog>
    );
  }
}