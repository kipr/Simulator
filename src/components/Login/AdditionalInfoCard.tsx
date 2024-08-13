import { RED, ThemeProps } from "../constants/theme";
import Form from "../interface/Form";
import { Text } from "../interface/Text";
import React from "react";
import { styled } from "styletron-react";
import { StyledText } from "../../util";
import { StyleProps } from "util/style";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { Validators } from "../../util/Validator";

export interface AdditionalInfoCardPublicProps extends ThemeProps, StyleProps {
  disable: boolean;
  errorMessage: string;
  onCollectedInfo: (dob: string, parentEmailAddress: string | null) => void;
}

interface AdditionalInfoCardPrivateProps {
}

interface AdditionalInfoCardState {
  dateOfBirth: string;
  shouldPromptParentEmail: boolean;
}

type Props = AdditionalInfoCardPublicProps & AdditionalInfoCardPrivateProps;
type State = AdditionalInfoCardState;

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

// const TextContainer = styled(Text, (props: ThemeProps) => ({
//   marginLeft: `${props.theme.itemPadding * 2}px`,
//   marginRight: `${props.theme.itemPadding * 2}px`,
//   marginBottom: `${props.theme.itemPadding * 2}px`,
//   alignSelf: 'flex-start',
// }));

const PlainTextContainer = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  alignSelf: 'flex-start',
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
}));

class AdditionalInfoCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      dateOfBirth: '',
      shouldPromptParentEmail: false,
    };
  }

  private onContinueClicked_ = (values: { [id: string]: string }) => {
    if ('dob' in values) {
      const [mm, dd, yyyy] = values['dob'].split('/');
      const dob = `${yyyy}-${mm}-${dd}`;

      const dobDate = new Date(dob);
      if (this.getAge(dobDate) < 16) {
        // Under 16, so collect parental email
        this.setState({ dateOfBirth: dob, shouldPromptParentEmail: true });
      } else {
        // No more info to collect
        this.setState({ dateOfBirth: dob, shouldPromptParentEmail: false });
        this.props.onCollectedInfo(dob, null);
      }
    } else if ('parentEmail' in values) {
      const parentEmailAddress = values['parentEmail'];
      this.props.onCollectedInfo(this.state.dateOfBirth, parentEmailAddress);
    }
  };

  // TOOD: consider moving under-16 age logic to LoginPage since LoginPage needs some under-16 logic anyway
  private getAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  render(): React.ReactNode {
    const { props, state } = this;
    const { theme, disable, errorMessage } = props;
    const { dateOfBirth, shouldPromptParentEmail } = state;

    if (!dateOfBirth) {
      const DOB_FORM_ITEMS: Form.Item[] = [
        Form.dob('dob', 'Date of birth'),
      ];

      const DOB_FORM_VERIFIERS: Form.Item[] = [
        Form.verifier('dob', 'A valid date of birth is required (MM/DD/YYYY)', Validators.Types.Date),
      ];

      return <>
        <PlainTextContainer theme={theme}>You must provide some additional info before continuing.</PlainTextContainer>
        {/* <TextContainer theme={theme} text={StyledText.text({
          text: "You must provide some additional info before continuing.",
          style: {
            display: 'inline-block',
            color: theme.color,
          }
        })} /> */}

        <StyledForm
          finalizeIcon={faSignInAlt}
          finalizeText={'Continue'}
          theme={theme}
          items={DOB_FORM_ITEMS}
          verifiers={DOB_FORM_VERIFIERS}
          onFinalize={this.onContinueClicked_}
          finalizeDisabled={disable}
        />
      </>
    }

    if (shouldPromptParentEmail) {
      const PARENT_EMAIL_FORM_ITEMS: Form.Item[] = [
        Form.email('parentEmail', 'Parent email'),
      ];

      const PARENT_EMAIL_FORM_VERIFIERS: Form.Item[] = [
        Form.verifier('parentEmail', 'A valid parent email is required', Validators.Types.Email),
      ];

      const infoTextStyle: React.CSSProperties = {
        display: 'inline-block',
        color: theme.color,
        marginLeft: '8px',
        marginRight: '8px',
      };

      return <>
        <Text text={StyledText.compose({
          items: [
            StyledText.text({
              text: "You must get your parent's permission to use this service. After you request permission, your parent will receive an email with further instructions.",
              style: infoTextStyle,
            }),
            StyledText.newLine(),
            StyledText.newLine(),
            StyledText.text({
              text: "They will have 48 hours to provide permission before your account is deleted.",
              style: infoTextStyle,
            }),
          ],
        })} />

        <StyledForm
          finalizeIcon={faSignInAlt}
          finalizeText={'Request Parental Consent'}
          theme={theme}
          items={PARENT_EMAIL_FORM_ITEMS}
          verifiers={PARENT_EMAIL_FORM_VERIFIERS}
          onFinalize={this.onContinueClicked_}
          finalizeDisabled={disable}
        />

        {
          errorMessage && <Text text={
            StyledText.text({
              text: errorMessage,
              style: {
                color: RED.standard,
                fontWeight: 400,
                fontSize: '0.9em',
                textAlign: 'left',
                marginLeft: '8px',
                marginRight: '8px',
              }
            })
          } style={{ marginBottom: `${theme.itemPadding * 2}px`}} />
        }
      </>
    }

    // Nothing left to collect
    return null;
  }
}

export default AdditionalInfoCard;