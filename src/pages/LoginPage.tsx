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
import { AuthProvider, getAdditionalUserInfo, getRedirectResult, signInWithPopup, signOut } from 'firebase/auth';
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
import AdditionalInfoCard from '../components/Login/AdditionalInfoCard';
import UserConsentCard from '../components/Login/UserConsentCard';

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
        db.get<UserConsent>(Selector.user(user.uid))
          .then(userConsentFromDb => {
            console.log('got user from db', userConsentFromDb);
            switch (userConsentFromDb.legalAcceptance.state) {
              case LegalAcceptance.State.AwaitingParentalConsent:
                if (this.getAge(new Date(userConsentFromDb.dateOfBirth)) >= 16) {
                  // User turned 16 while waiting for parental consent
                  // Change their state
                  console.log('USER TURNED 16; ALLOW SELF CONSENT');
                  const nextUserConsent: UserConsent = {
                    ...userConsentFromDb,
                    legalAcceptance: {
                      state: LegalAcceptance.State.NotStarted,
                      version: userConsentFromDb.legalAcceptance.version,
                      autoDelete: userConsentFromDb.legalAcceptance.autoDelete,
                    },
                  };

                  db.set<UserConsent>(Selector.user(user.uid), nextUserConsent)
                    .then(() => {
                      this.setState({ loggedIn: true, initialAuthLoaded: true, authenticating: false, userConsent: nextUserConsent });
                    });
                  break;
                }

              // Intentionally fall through
              case LegalAcceptance.State.NotStarted:
              case LegalAcceptance.State.ObtainedParentalConsent:
              case LegalAcceptance.State.ObtainedUserConsent:
                this.setState({ loggedIn: true, initialAuthLoaded: true, authenticating: false, userConsent: userConsentFromDb });
                break;
              default:
                const exhaustive: never = userConsentFromDb.legalAcceptance;
                console.error('Unknown acceptance state', exhaustive);
                signOut(auth).then(() => {
                  this.setState({ loggedIn: false, initialAuthLoaded: true, authenticating: false, userConsent: undefined, logInFailedMessage: 'Something went wrong' });
                });
                break;
            }
          })
          .catch(error => {
            if (DbError.is(error) && error.code === DbError.CODE_NOT_FOUND) {
              // Consent info doesn't exist yet for this user
              this.setState({ loggedIn: true, initialAuthLoaded: true, authenticating: false, userConsent: undefined });
            } else {
              // TODO: show user an error
              console.error('failed to get user from db', error);
              signOut(auth).then(() => {
                this.setState({ loggedIn: false, initialAuthLoaded: true, authenticating: false, userConsent: undefined, logInFailedMessage: 'Something went wrong' });
              });
            }
          });
      } else {
        console.log('onAuthStateChanged without user');
        this.setState({ loggedIn: false, authenticating: false, initialAuthLoaded: true });
      }
    });
  };

  private startNewParentalConsent_ = (userId: string, dateOfBirth: string, parentEmailAddress: string, autoDelete: boolean) => {
    const consentRequest: XMLHttpRequest = new XMLHttpRequest();

    return new Promise<UserConsent>((resolve, reject) => {
      consentRequest.onload = () => {
        if (consentRequest.status === 200) {
          const responseJson = JSON.parse(consentRequest.responseText);
          // TODO: validate response before casting to UserConsent?
          resolve(responseJson);
        } else {
          console.error('Consent request failed with status', consentRequest.status);
          reject(consentRequest.status);
        }
      };

      consentRequest.onerror = (err) => {
        console.error('Consent request failed with error', err);
        reject(err);
      };

      consentRequest.open('POST', `/parental-consent-start/${userId}`);
      consentRequest.setRequestHeader('Content-Type', 'application/json');

      const requestBody = {
        dateOfBirth: dateOfBirth,
        parentEmailAddress: parentEmailAddress,
        autoDelete: autoDelete,
      };

      try {
        consentRequest.send(JSON.stringify(requestBody));
      } catch (e) {
        console.error('Consent request failed with exception', e);
        reject(e);
      }
    });
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

  private onSignUp_ = (email: string, password: string) => {
    console.log('onSignUp_');
    this.setState({
      authenticating: true,
      logInFailedMessage: null,
    });

    // TODO: make function async to simplify logic
    createUserWithEmail(email, password)
      .then((newUserCredential) => {
        this.setUserConsentForNewUser(newUserCredential.user.uid)
          // // db.set<UserConsent>(Selector.user(newUserCredential.user.uid), nextUserConsent)
          .then((nextUserConsent) => {
            console.log('finished setting user context');
            this.setState({
              authenticating: false,
              userConsent: nextUserConsent,
            });
          })
          .catch((error) => {
            console.error('Setting user consent failed', error);
            // TODO: user exists but setting autoDelete=true failed, so user won't be deleted
            this.setState({
              authenticating: false,
              logInFailedMessage: 'Something went wrong. Please contact KIPR for support.',
            });
          });
      })
      .catch(error => {
        this.setState({
          authenticating: false,
          logInFailedMessage: this.getMessageForFailedLogin_(error),
        });
      });
  };

  private setUserConsentForNewUser = (userId: string): Promise<UserConsent> => {
    const nextUserConsent: UserConsent = {
      ...this.state.userConsent,
      legalAcceptance: {
        state: LegalAcceptance.State.NotStarted,
        version: 1,
        // Newly signed up users can be auto-deleted
        autoDelete: true,
      },
    };

    return db.set<UserConsent>(Selector.user(userId), nextUserConsent)
      .then(() => {
        return nextUserConsent;
      });
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

    // "Sign in" may have actually been a new user
    const { isNewUser } = getAdditionalUserInfo(userCredential);

    if (isNewUser) {
      this.setUserConsentForNewUser(userCredential.user.uid)
        .then((nextUserConsent) => {
          console.log('finished setting user context');
          this.setState({
            authenticating: false,
            userConsent: nextUserConsent,
          });
        })
        .catch((error) => {
          console.error('Setting user consent failed', error);
          // TODO: user exists but setting autoDelete=true failed, so user won't be deleted
          this.setState({
            authenticating: false,
            logInFailedMessage: 'Something went wrong. Please contact KIPR for support.',
          });
        });
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

  private onCollectedAdditionalInfo_ = (dob: string, parentEmailAddress: string) => {
    if (!parentEmailAddress) {
      this.setState({
        userConsent: {
          ...this.state.userConsent,
          dateOfBirth: dob,
        },
      });
    } else {
      const userId = auth.currentUser.uid;

      // Start parental consent process
      this.setState({ authenticating: true }, () => {
        const autoDelete = LegalAcceptance.shouldAutoDelete(this.state.userConsent?.legalAcceptance);
        this.startNewParentalConsent_(userId, dob, parentEmailAddress, autoDelete)
          .then((nextUserConsent) => {
            this.setState({ authenticating: false, userConsent: nextUserConsent });
          })
          .catch(error => {
            console.error('Starting parental consent failed', error);
            this.setState({ authenticating: false });
          });
      });
    }
  };

  private onCollectedUserConsent_ = () => {
    const nextUserConsent: UserConsent = {
      ...this.state.userConsent,
      legalAcceptance: {
        state: LegalAcceptance.State.ObtainedUserConsent,
        version: 1,
      },
    };

    const userId = auth.currentUser.uid;

    this.setState({ authenticating: true }, () => {
      db.set<UserConsent>(Selector.user(userId), nextUserConsent)
        .then(() => {
          this.setState({ authenticating: false, userConsent: nextUserConsent });
        })
        .catch((error) => {
          console.error('Setting user consent failed', error);
          this.setState({ authenticating: false });
        });
    });
  };

  private getAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
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
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Additional info</Header>

              <AdditionalInfoCard theme={theme} disable={authenticating} onCollectedInfo={this.onCollectedAdditionalInfo_} />
            </Card>
          </Container>
        );
      }

      if (!userConsent.legalAcceptance || userConsent.legalAcceptance.state === LegalAcceptance.State.NotStarted) {
        // User needs to consent

        return <Container theme={theme} className={className} style={style}>
          <Card theme={theme} width='800px'>
            {kiprLogo}

            <Header theme={theme}>Terms of use</Header>

            <UserConsentCard theme={theme} disable={authenticating} onCollectedUserConsent={this.onCollectedUserConsent_} />
          </Card>
        </Container>
      }

      if (LegalAcceptance.isConsentObtained(userConsent.legalAcceptance)) {
        // Consent obtained, proceed!
        setTimeout(() => {
          const { search } = window.location;
          const q = qs.parse(search.length > 0 ? search.substring(1) : '');
          const { from } = q;
          window.location.href = from ? from.toString() : '/';
        });
        return null;
      } else if (userConsent.legalAcceptance.state === LegalAcceptance.State.AwaitingParentalConsent) {
        // Waiting for parental consent
        return (
          <Container theme={theme} className={className} style={style}>
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Waiting for parental consent</Header>

              <Text text={StyledText.text({
                text: "An email was sent to the provided parent email address. After your parent has provided permission, you will be able to access the service.",
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

      // TODO: show user an error
      return 'Unknown consent state';
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