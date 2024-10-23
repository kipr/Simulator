import { RED, ThemeProps } from "../constants/theme";
import Form from "../interface/Form";
import { Text } from "../interface/Text";
import React from "react";
import { styled } from "styletron-react";
import { StyledText } from "../../util";
import { StyleProps } from "util/style";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { Validators } from "../../util/Validator";

export interface ParentEmailCardPublicProps extends ThemeProps, StyleProps {
  disable: boolean;
  errorMessage: string;
  onCollectedInfo: (parentEmailAddress: string) => void;
}

interface ParentEmailCardPrivateProps {
}

interface ParentEmailCardState {
}

type Props = ParentEmailCardPublicProps & ParentEmailCardPrivateProps;
type State = ParentEmailCardState;

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

class ParentEmailCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  private onContinueClicked_ = (values: { [id: string]: string }) => {
    if ('parentEmail' in values) {
      const parentEmailAddress = values['parentEmail'];
      this.props.onCollectedInfo(parentEmailAddress);
    }
  };

  render(): React.ReactNode {
    const { props } = this;
    const { theme, disable, errorMessage } = props;

    const PARENT_EMAIL_FORM_ITEMS: Form.Item[] = [
      Form.email('parentEmail', 'Parent/guardian email'),
    ];

    const PARENT_EMAIL_FORM_VERIFIERS: Form.Item[] = [
      Form.verifier('parentEmail', 'A valid parent/guardian email is required', Validators.Types.Email),
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
            text: "You must get your parent/guardian's permission to use this service. After you request permission, your parent/guardian will receive an email with further instructions.",
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
        finalizeText={'Request Consent'}
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
}

export default ParentEmailCard;