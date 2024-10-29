import { RED, ThemeProps } from "../constants/theme";
import Form from "../interface/Form";
import { Text } from "../interface/Text";
import React from "react";
import { styled } from "styletron-react";
import { StyledText } from "../../util";
import { StyleProps } from "util/style";
import Button from "../interface/Button";
import { Providers } from "firebase/firebase";
import { faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesome } from "../FontAwesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Validators } from "../../util/Validator";

export interface SignInSignUpCardPublicProps extends ThemeProps, StyleProps {
  mode: 'signin' | 'signup';
  allowSignIn: boolean;
  logInFailedMessage: string;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onSignInWithSocialMedia: (providerName: keyof typeof Providers) => void;
  onForgotPassword: () => void;
}

interface SignInSignUpCardPrivateProps {
}

interface SignInSignUpCardState {
}

type Props = SignInSignUpCardPublicProps & SignInSignUpCardPrivateProps;
type State = SignInSignUpCardState;

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const StyledToolIcon = styled(FontAwesome, (props: ThemeProps & { withBorder?: boolean }) => ({
  userSelect: 'none',
  paddingLeft: !props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  paddingRight: props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.withBorder ? `1px solid ${props.theme.borderColor}` : undefined,
}));

const SocialContainer = styled('div', (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  color: props.theme.color,
  fontSize: '1.4em'
}));

class SignInSignUpCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  private onSignInClicked_ = (values: { [id: string]: string }) => {
    this.props.onSignIn(values['email'], values['password']);
  };

  private onSignUpClicked_ = (values: { [id: string]: string }) => {
    this.props.onSignUp(values['email'], values['password']);
  };

  render(): React.ReactNode {
    const { props } = this;
    const { theme, mode, allowSignIn, logInFailedMessage, onSignInWithSocialMedia, onForgotPassword } = props;

    const LOGIN_FORM_ITEMS: Form.Item[] = [
      Form.email('email', 'Email'),
      // TODO: does callback from prop need to be bound?
      Form.password('password', 'Password', undefined, onForgotPassword, 'Forgot?', false),
    ];

    const SIGNUP_FORM_ITEMS: Form.Item[] = [
      Form.email('email', 'Email'),
      Form.password('password', 'Password'),
    ];

    const SIGNUP_FORM_VERIFIERS: Form.Item[] = [
      Form.verifier('email', 'A valid email is required', Validators.Types.Email),
      Form.verifier('password', 'At least one lowercase letter', Validators.Types.Lowercase),
      Form.verifier('password', 'At least one uppercase letter', Validators.Types.Uppercase),
      Form.verifier('password', 'At least one number', Validators.Types.Numeric),
      Form.verifier('password', 'At least 8 characters', Validators.Types.Length),
    ];

    const googleButtonItems = [
      StyledText.component({
        component: StyledToolIcon,
        props: {
          icon: faGoogle,
          brand: true,
          theme,
        }
      }),
      StyledText.text({
        text: 'Continue with Google',
        style: {
          fontWeight: 400,
          fontSize: '0.9em',
          textAlign: 'center',
          color: theme.color,
          marginLeft: '8px',
          marginRight: '8px',
        }
      })
    ];

    const formComponent = mode === 'signin'
      ? <StyledForm
        finalizeIcon={faSignInAlt}
        finalizeText='Sign In'
        theme={theme}
        items={LOGIN_FORM_ITEMS}
        onFinalize={this.onSignInClicked_}
        finalizeDisabled={!allowSignIn}
      />
      : <StyledForm
        finalizeIcon={faUserPlus}
        finalizeText='Sign Up'
        theme={theme}
        items={SIGNUP_FORM_ITEMS}
        verifiers={SIGNUP_FORM_VERIFIERS}
        onFinalize={this.onSignUpClicked_}
        finalizeDisabled={!allowSignIn}
      />;

    return <>
      {formComponent}
      {
        logInFailedMessage && <Text text={
          StyledText.text({
            text: logInFailedMessage,
            style: {
              color: RED.standard,
              fontWeight: 400,
              fontSize: '0.9em',
              textAlign: 'left',
              marginLeft: '8px',
              marginRight: '8px',
            }
          })
        } />
      }
      <SocialContainer theme={theme}>
        <Button
          theme={theme}
          onClick={() => onSignInWithSocialMedia('google')}
          children={googleButtonItems.map((item, i) => (
            <Text key={i} text={item} />
          ))} />
      </SocialContainer>
    </>;
  }
}

export default SignInSignUpCard;