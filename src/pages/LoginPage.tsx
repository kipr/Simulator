import * as React from 'react';
import { DARK, ThemeProps } from '../components/constants/theme';
import { StyleProps } from '../util/style';
import { styled } from 'styletron-react';
import { auth, Providers } from '../firebase/firebase';
import {
  signInWithEmail,
  createUserWithEmail,
  forgotPassword
} from '../firebase/modules/auth';
import { AuthProvider, getAdditionalUserInfo, getRedirectResult, signInWithPopup, signOut, UserCredential } from 'firebase/auth';
import Form from '../components/interface/Form';
import { TabBar } from '../components/Layout/TabBar';

import KIPR_LOGO_BLACK from '../../static/assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import { Text } from '../components/interface/Text';
import { StyledText } from '../util';
import { faSignInAlt, faUnlock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import qs from 'qs';
import db from '../db';
import Selector from '../db/Selector';
import DbError from '../db/Error';
import UserConsent from '../consent/UserConsent';
import LegalAcceptance from '../consent/LegalAcceptance';
import SignInSignUpCard from '../components/Login/SignInSignUpCard';
import UserConsentCard from '../components/Login/UserConsentCard';
import MainMenu from '../components/MainMenu';
import DateOfBirthCard from '../components/Login/DateOfBirthCard';
import ParentEmailCard from '../components/Login/ParentEmailCard';

export interface LoginPagePublicProps extends ThemeProps, StyleProps {
  externalIndex?: number;
}

interface LoginPagePrivateProps {
}

interface LoginPageState {
  initialAuthLoaded: boolean,
  authenticating: boolean,
  loggedIn: boolean;
  userConsent: UserConsent;
  index: number;
  forgotPassword: boolean;
  logInFailedMessage: string;
}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100vh',
  backgroundImage: 'url(../../static/backgrounds/Triangular_Background_Compressed.png)',
  backgroundSize: 'cover',
}));

const Card = styled('div', (props: ThemeProps & { width?: string }) => ({
  width: props.width ?? '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  opacity: 0.98,
  backdropFilter: 'blur(16px)',
  paddingTop: `${props.theme.itemPadding * 2}px`,
  backgroundColor: props.theme.backgroundColor,
  borderRadius: `${props.theme.itemPadding * 2}px`,
  overflow: 'hidden',
  border: `1px solid ${props.theme.borderColor}`,
}));

const StyledTabBar = styled(TabBar, (props: ThemeProps) => ({
  width: '100%',
  borderTop: `1px solid ${props.theme.borderColor}`,
  marginTop: `${props.theme.itemPadding * 2}px`,
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const TABS: TabBar.TabDescription[] = [{
  name: 'Sign In',
  icon: faSignInAlt,
}, {
  name: 'Sign Up',
  icon: faUserPlus,
}];

const Logo = styled('img', {
  width: '150px',
  height: 'auto',
  marginTop: '16px',
  marginBottom: '16px'
});

const Header = styled('div', (props: ThemeProps) => ({
  fontSize: '1.3em',
  color: props.theme.color,
  fontWeight: 400,
  alignSelf: 'flex-start',
  marginLeft: `${props.theme.itemPadding * 2}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
}));

const MainMenuBar = styled(MainMenu, {
  position: 'absolute',
  top: 0,
});

type Props = LoginPagePublicProps & LoginPagePrivateProps;
type State = LoginPageState;

class LoginPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      initialAuthLoaded: false,
      authenticating: false,
      loggedIn: auth.currentUser !== null,
      userConsent: undefined,
      index: this.props.externalIndex !== undefined ? this.props.externalIndex : 0,
      forgotPassword: false,
      logInFailedMessage: null,
    };
  }

  componentDidMount() {
    const a = this.authListener();
  }

  private authListener = async () => {
    const redirect = await getRedirectResult(auth);
    if (redirect !== null) {
      this.setState({ loggedIn: true });
    }
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User signed in, now check their consent state
        console.log('onAuthStateChanged with user; getting user from db');

        const handleUnexpectedConsentError_ = (error: unknown) => {
          if (typeof (error) !== 'undefined') {
            console.log('Unknown login failure:', error);
          }

          this.setState({ loggedIn: false, initialAuthLoaded: true, authenticating: false, userConsent: undefined, logInFailedMessage: 'Something went wrong' });
        };

        db.get<UserConsent>(Selector.user(user.uid))
          .then(userConsentFromDb => {
            switch (userConsentFromDb?.legalAcceptance?.state) {
              // Intentionally fall through
              case LegalAcceptance.State.AwaitingParentalConsent:
              case LegalAcceptance.State.NotStarted:
              case LegalAcceptance.State.ObtainedParentalConsent:
              case LegalAcceptance.State.ObtainedUserConsent:
              case undefined:
                this.setState({ loggedIn: true, initialAuthLoaded: true, authenticating: false, userConsent: userConsentFromDb });
                break;
              default: {
                const exhaustive: never = userConsentFromDb.legalAcceptance;
                console.error('Unknown acceptance state', exhaustive);
                signOut(auth)
                  .then(handleUnexpectedConsentError_)
                  .catch(handleUnexpectedConsentError_);
                break;
              }
            }
          })
          .catch(error => {
            if (DbError.is(error) && error.code === DbError.CODE_NOT_FOUND) {
              // User existed before the consent system existed
              this.setState({ loggedIn: true, initialAuthLoaded: true, authenticating: false, userConsent: undefined });
            } else {
              console.error('failed to get user from db', error);
              signOut(auth)
                .then(handleUnexpectedConsentError_)
                .catch(handleUnexpectedConsentError_);
            }
          });
      } else {
        console.log('onAuthStateChanged without user');
        this.setState({ loggedIn: false, initialAuthLoaded: true, authenticating: false, userConsent: undefined });
      }
    });
  };

  private startNewParentalConsent_ = async (userId: string, dateOfBirth: string, parentEmailAddress: string): Promise<UserConsent> => {
    const userIdToken = await auth.currentUser.getIdToken();

    const requestBody = {
      dateOfBirth: dateOfBirth,
      parentEmailAddress: parentEmailAddress,
    };

    const response = await fetch(`/api/parental-consent/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status !== 200) {
      console.error('Consent request failed with status', response.status);
      throw response.status;
    }

    // TODO: validate response against UserConsent
    const responseBody = (await response.json()) as UserConsent;
    return responseBody;
  };

  private onSignIn_ = (email: string, password: string) => {
    this.setState({
      authenticating: true,
      logInFailedMessage: null,
    });

    signInWithEmail(email, password)
      .catch(error => {
        this.setState({
          authenticating: false,
          logInFailedMessage: this.getMessageForFailedLogin_(error),
        });
      });
  };

  private onSignUp_ = async (email: string, password: string) => {
    this.setState({
      authenticating: true,
      logInFailedMessage: null,
    });

    let newUserCredential: UserCredential;
    try {
      newUserCredential = await createUserWithEmail(email, password);
    } catch (error) {
      this.setState({
        authenticating: false,
        logInFailedMessage: this.getMessageForFailedLogin_(error),
      });

      return;
    }

    let nextUserConsent: UserConsent;
    try {
      nextUserConsent = await this.setUserConsentForNewUser(newUserCredential.user.uid);
    } catch (error) {
      console.error('Setting user consent failed', error);
      this.setState({
        authenticating: false,
        logInFailedMessage: 'Something went wrong. Please contact KIPR for support.',
      });

      return;
    }

    this.setState({
      authenticating: false,
      userConsent: nextUserConsent,
    });
  };

  private setUserConsentForNewUser = (userId: string): Promise<UserConsent> => {
    const nextUserConsent: UserConsent = {
      dateOfBirth: undefined,
      legalAcceptance: {
        state: LegalAcceptance.State.NotStarted,
        version: 1,
        // Newly signed up users will be deleted in 2 days
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      },
    };

    return db.set<UserConsent>(Selector.user(userId), nextUserConsent, true)
      .then(() => nextUserConsent);
  };

  private onForgotPasswordFinalize_ = (values: { [id: string]: string }) => {
    forgotPassword(values.email);

    this.setState({
      forgotPassword: false,
    });

    return;
  };

  private getMessageForFailedLogin_ = (error: string): string => {
    switch (error) {
      case 'auth/wrong-password':
      case 'auth/invalid-email':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Something went wrong. Please contact KIPR for support.';
    }
  };

  private onSignInWithSocialMedia_ = async (providerName: keyof typeof Providers) => {
    const provider: AuthProvider = Providers[providerName];
    this.setState({ authenticating: true });
    const userCredential = await signInWithPopup(auth, provider);

    // "Sign in" via social media may have actually been a new user
    const { isNewUser } = getAdditionalUserInfo(userCredential);

    if (isNewUser) {
      try {
        const nextUserConsent = await this.setUserConsentForNewUser(userCredential.user.uid);
        this.setState({
          authenticating: false,
          userConsent: nextUserConsent,
        });
      } catch (error) {
        console.error('Setting user consent failed', error);
        this.setState({
          authenticating: false,
          logInFailedMessage: 'Something went wrong. Please contact KIPR for support.',
        });
      }
    }
  };

  private onTabIndexChange_ = (index: number) => {
    this.setState({
      index,
      logInFailedMessage: null,
    });
  };

  private onForgotPassword_ = () => {
    this.setState({
      forgotPassword: true,
    });
  };

  private onBackClick_ = () => {
    this.setState({
      forgotPassword: false,
    });
  };

  private onCollectedDateOfBirth_ = (dob: string) => {
    this.setState({
      userConsent: {
        ...this.state.userConsent,
        dateOfBirth: dob,
      },
      logInFailedMessage: null,
    });
  };

  private onCollectedParentEmail_ = (parentEmailAddress: string) => {
    // Don't allow parent email to be the same as user email
    if (auth.currentUser.email.toLowerCase() === parentEmailAddress.toLowerCase()) {
      this.setState({
        logInFailedMessage: 'Parent/guardian email cannot be the same as your email.',
      });

      return;
    }

    const userId = auth.currentUser.uid;
    const dob = this.state.userConsent.dateOfBirth;

    // Start parental consent process
    this.setState({ authenticating: true, logInFailedMessage: null }, () => {
      this.startNewParentalConsent_(userId, dob, parentEmailAddress)
        .then((nextUserConsent) => {
          this.setState({ authenticating: false, userConsent: nextUserConsent });
        })
        .catch(error => {
          console.error('Starting parental consent failed', error);
          this.setState({ authenticating: false, logInFailedMessage: 'Something went wrong. Please contact KIPR for support.' });
        });
    });
  };

  private onCollectedUserConsent_ = () => {
    const userConsentPatch: Partial<UserConsent> = {
      dateOfBirth: this.state.userConsent.dateOfBirth,
      legalAcceptance: {
        state: LegalAcceptance.State.ObtainedUserConsent,
        version: 1,
      },
    };

    const userId = auth.currentUser.uid;

    this.setState({ authenticating: true }, () => {
      db.set<Partial<UserConsent>>(Selector.user(userId), userConsentPatch, true)
        .then(() => {
          this.setState((prevState) => ({
            authenticating: false,
            userConsent: {
              ...prevState.userConsent,
              ...userConsentPatch,
            },
          }));
        })
        .catch((error) => {
          console.error('Setting user consent failed', error);
          this.setState({ authenticating: false });
        });
    });
  };

  private resetParentalConsentInfo_ = () => {
    const userId = auth.currentUser.uid;

    const userConsentPatch: Partial<UserConsent> = {
      legalAcceptance: {
        state: LegalAcceptance.State.NotStarted,
        version: 1,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      },
    };

    this.setState({ authenticating: true }, () => {
      db.set<Partial<UserConsent>>(Selector.user(userId), userConsentPatch, true)
        .then(() => {
          this.setState((prevState) => ({
            authenticating: false,
            userConsent: {
              ...prevState.userConsent,
              ...userConsentPatch,
            },
          }));
        })
        .catch((error) => {
          console.error('Resetting parental consent info failed', error);
          this.setState({ authenticating: false });
        });
    });
  };

  private getAge = (dob: Date) => {
    const today = new Date();
    let age = today.getUTCFullYear() - dob.getUTCFullYear();

    const m = today.getUTCMonth() - dob.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < dob.getUTCDate())) {
      age--;
    }

    return age;
  };

  render() {
    const { props, state } = this;
    const { className, style } = props;
    const { initialAuthLoaded, index, authenticating, loggedIn, userConsent, forgotPassword, logInFailedMessage } = state;
    const theme = DARK;

    if (!initialAuthLoaded) {
      // Auth initialization is fast, so no need to render anything in the meantime
      return null;
    }

    let kiprLogo: JSX.Element;
    switch (theme.foreground) {
      case 'white': {
        kiprLogo = <Logo src={KIPR_LOGO_BLACK as string} />;
        break;
      }
      case 'black': {
        kiprLogo = <Logo src={KIPR_LOGO_WHITE as string} />;
        break;
      }
    }

    if (loggedIn) {
      if (!userConsent || !userConsent.dateOfBirth) {
        // Don't know user's DoB yet. Collect additional info

        return (
          <Container theme={theme} className={className} style={style}>
            <MainMenuBar theme={theme} />
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Additional Information</Header>

              <DateOfBirthCard theme={theme} disable={authenticating} onCollectedInfo={this.onCollectedDateOfBirth_} />
            </Card>
          </Container>
        );
      }

      if (userConsent.legalAcceptance?.state === LegalAcceptance.State.AwaitingParentalConsent) {
        // Waiting for parental consent
        return (
          <Container theme={theme} className={className} style={style}>
            <MainMenuBar theme={theme} />
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Waiting for Parental/Guardian Consent</Header>

              <Text text={StyledText.text({
                text: "An email was sent to the provided parent/guardian email address. After your parent/guardian has provided permission, you will be able to access the service.",
                style: {
                  display: 'inline-block',
                  color: theme.color,
                  marginLeft: '8px',
                  marginRight: '8px',
                  marginBottom: '8px',
                }
              })} />
            </Card>
          </Container>
        );
      }

      const consentStatus = LegalAcceptance.getConsentStatus(userConsent.legalAcceptance);

      if (consentStatus === 'valid') {
        // Consent obtained, proceed!
        setTimeout(() => {
          const { search } = window.location;
          const q = qs.parse(search.length > 0 ? search.substring(1) : '');
          const { from } = q;
          window.location.href = from ? from.toString() : '/';
        });

        return null;
      }

      if (consentStatus === 'invalid' || consentStatus === 'expired') {
        const userAge = this.getAge(new Date(userConsent.dateOfBirth));

        if (userAge >= 16) {
          // User needs to self-consent
          return (
            <Container theme={theme} className={className} style={style}>
              <MainMenuBar theme={theme} />
              <Card theme={theme} width='fit-content'>
                {kiprLogo}

                <Header theme={theme}>Privacy Policy and Terms of Use</Header>

                <UserConsentCard theme={theme} disable={authenticating} onCollectedUserConsent={this.onCollectedUserConsent_} />
              </Card>
            </Container>
          );
        }

        // User needs parental consent
        return (
          <Container theme={theme} className={className} style={style}>
            <MainMenuBar theme={theme} />
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Additional Information</Header>

              <ParentEmailCard theme={theme} disable={authenticating} errorMessage={logInFailedMessage} onCollectedInfo={this.onCollectedParentEmail_} />
            </Card>
          </Container>
        );
      }

      console.error('Unknown consent state', consentStatus);
      return null;
    }

    if (forgotPassword) {
      const FORGOT_PASSWORD_FORM_ITEMS: Form.Item[] = [
        Form.email('email', 'Email', undefined, this.onBackClick_, 'Back'),
      ];

      return (
        <Container theme={theme} className={className} style={style}>
          <Card theme={theme}>
            {kiprLogo}
            <Header theme={theme}>Forgot Password</Header>
            <StyledForm
              finalizeIcon={faUnlock}
              finalizeText='Send Recovery Email'
              theme={theme}
              items={FORGOT_PASSWORD_FORM_ITEMS}
              onFinalize={this.onForgotPasswordFinalize_}
              finalizeDisabled={authenticating}
            />
          </Card>
        </Container>
      );
    }

    return (
      <Container theme={theme} className={className} style={style}>
        <Card theme={theme}>
          {kiprLogo}

          <Header theme={theme}>{index === 0 ? 'Sign In' : 'Sign Up'}</Header>

          <SignInSignUpCard theme={theme} mode={index === 0 ? 'signin' : 'signup'} allowSignIn={!authenticating} logInFailedMessage={logInFailedMessage} onSignIn={this.onSignIn_} onSignUp={this.onSignUp_} onSignInWithSocialMedia={this.onSignInWithSocialMedia_} onForgotPassword={this.onForgotPassword_} />

          <StyledTabBar theme={theme} tabs={TABS} index={index} onIndexChange={this.onTabIndexChange_} />
        </Card>
      </Container>
    );
  }
}

export default LoginPage;