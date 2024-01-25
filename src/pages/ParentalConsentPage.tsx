import { ThemeProps } from '../components/constants/theme';
import * as React from 'react';
import { StyleProps } from '../util/style';

interface ParentalConsentPageProps extends ThemeProps, StyleProps {
  userId: string;
}

interface ParentalConsentPageState {
  submitClicked: boolean;
  message: string;
}

type Props = ParentalConsentPageProps;
type State = ParentalConsentPageState;

class ParentalConsentPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      submitClicked: false,
      message: '',
    };
  }

  private onSubmitClick_ = () => {
    this.setState({ submitClicked: true, message: 'Submitting...' }, () => {
      const consentRequest: XMLHttpRequest = new XMLHttpRequest();
      consentRequest.onload = () => {
          if (consentRequest.status === 200) {
            this.setState({ submitClicked: false, message: 'Success!' });
          } else {
            console.error('Consent request failed with status', consentRequest.status);
            this.setState({ submitClicked: false, message: 'Error!' });
          }
      };

      consentRequest.onerror = (err) => {
          console.error('Consent request failed with error', err);
          this.setState({ submitClicked: false, message: 'Error!' });
      };

      consentRequest.open('POST', `/parental-consent/${this.props.userId}`);

      try {
          consentRequest.send();
      } catch (e) {
          console.error('Consent request failed with exception', e);
          this.setState({ submitClicked: false, message: 'Error!' });
      }
    });
  };

  render() {
    return (
      <>
        <h1>Parental consent</h1>
        Click the button below.<br />
        <button onClick={this.onSubmitClick_} disabled={this.state.submitClicked}>Submit</button><br />
        {this.state.message}
      </>
    );
  }
}

export default ParentalConsentPage;