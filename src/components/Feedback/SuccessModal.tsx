import * as React from 'react';
import { FeedbackText } from './FeedbackInputs';
import { StyleProps } from '../../style';
import { Dialog } from '../Dialog';
import { ThemeProps } from '../theme';
import { FeedbackContainer, CenterContainer } from './index';

import tr from '@i18n';

import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import LocalizedString from '../../util/LocalizedString';

export interface FeedbackSuccessDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
}

interface FeedbackSuccessDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface FeedbackSuccessDialogState {}

type Props = FeedbackSuccessDialogPublicProps & FeedbackSuccessDialogPrivateProps;
type State = FeedbackSuccessDialogState;

class FeedbackSuccessDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSection: 'simulation',
    };
  }
  
  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;

    return (
      <Dialog theme={theme} name={LocalizedString.lookup(tr('Feedback Success'), locale)} onClose={onClose}>
        <FeedbackContainer theme={theme}>
          <CenterContainer theme={theme}>
            <FeedbackText>
              <p>{LocalizedString.lookup(tr('Feedback successfully submitted!'), locale)}</p>
              <p>{LocalizedString.lookup(tr('Thank you for helping improve the KIPR Simulator!'), locale)}</p>
            </FeedbackText>
          </CenterContainer>
        </FeedbackContainer>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(FeedbackSuccessDialog) as React.ComponentType<FeedbackSuccessDialogPublicProps>;