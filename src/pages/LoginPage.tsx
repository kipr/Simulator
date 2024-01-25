import * as React from 'react';
import { DARK, RED, ThemeProps } from '../components/constants/theme';
import { StyleProps } from '../util/style';
import { styled } from 'styletron-react';
import { auth, Providers } from '../firebase/firebase';
import { 
  signInWithEmail, 
  createUserWithEmail, 
  forgotPassword
} from '../firebase/modules/auth';
import { AuthProvider, getRedirectResult, signInWithPopup, signOut } from 'firebase/auth';
import Form from '../components/interface/Form';
import { TabBar } from '../components/Layout/TabBar';

import KIPR_LOGO_BLACK from '../../static/assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import { FontAwesome } from '../components/FontAwesome';
import { Text } from '../components/interface/Text';
import { StyledText } from '../util';
import Button from '../components/interface/Button';
import { Validators } from '../util/Validator';
import { faSignInAlt, faUnlock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import qs from 'qs';
import db from '../db';
import Selector from '../db/Selector';
import DbError from '../db/Error';
import UserConsent from '../consent/UserConsent';
import LegalAcceptance from '../consent/LegalAcceptance';

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

const Card = styled('div', (props: ThemeProps) => ({
  width: '400px',
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

const StyledToolIcon = styled(FontAwesome, (props: ThemeProps & { withBorder?: boolean }) => ({
  userSelect: 'none',
  paddingLeft: !props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  paddingRight: props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.withBorder ? `1px solid ${props.theme.borderColor}` : undefined,
}));

const ButtonContainer = styled('div', (theme: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: `${theme.theme.itemPadding * 4}px`,
  marginBottom: `${theme.theme.itemPadding * 2}px`,
}));

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

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

  private getAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
  };

  private onFinalizeDateOfBirth_ = (values: { [id: string]: string }) => {
    if (this.state.userConsent?.dateOfBirth) return;

    const [mm, dd, yyyy] = values['dob'].split('/');
    const dob = `${yyyy}-${mm}-${dd}`;

    this.setState({
      userConsent: {
        ...this.state.userConsent,
        dateOfBirth: dob,
      },
    });
  };

  private onFinalizeParentEmail_ = (values: { [id: string]: string }) => {
    if (this.state.userConsent?.legalAcceptance) return;
    
    const parentEmailAddress = values['parentEmail'];
    const currentTimeStr = new Date().toISOString();

    const nextUserConsent: UserConsent = {
      ...this.state.userConsent,
      legalAcceptance: {
        state: LegalAcceptance.State.AwaitingParentalConsent,
        version: 1,
        sentAt: currentTimeStr,
        parentEmailAddress,
        noAutoDelete: false,
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

  private onFinalizeTerms_ = (values: { [id: string]: string }) => {
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


  private onFinalize_ = (values: { [id: string]: string }) => {
    if (this.state.forgotPassword) {
      forgotPassword(values.email);

      this.setState({
        forgotPassword: false,
      });

      return;
    }

    switch (this.state.index) {
      case 0: {
        this.setState({
          authenticating: true,
          logInFailedMessage: null,
        });

        signInWithEmail(values['email'], values['password'])
          .catch(error => {
            this.setState({
              authenticating: false,
              logInFailedMessage: this.getMessageForFailedLogin_(error),
            });
          });

        break;
      }
      case 1: {
        this.setState({
          authenticating: true,
          logInFailedMessage: null,
        });

        createUserWithEmail(values['email'], values['password'])
          .catch(error => {
            this.setState({
              authenticating: false,
              logInFailedMessage: this.getMessageForFailedLogin_(error),
            });
          });

        break;
      }
    }
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

  private signInWithSocialMedia_ = async (provider: AuthProvider) => {
    this.setState({ authenticating: true });
    await signInWithPopup(auth, provider);
  };

  private onTabIndexChange_ = (index: number) => {
    this.setState({
      index,
      logInFailedMessage: null,
    });
  };

  private onForgotPasswordClick_ = () => {
    this.setState({
      forgotPassword: true,
    });
  };

  private onBackClick_ = () => {
    this.setState({
      forgotPassword: false,
    });
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
        // Don't know user's DoB yet. Collect it

        const DOB_FORM_ITEMS: Form.Item[] = [
          Form.dob('dob', 'Date of birth'),
        ];

        const DOB_FORM_VERIFIERS: Form.Item[] = [
          Form.verifier('dob', 'A valid date of birth is required (MM/DD/YYYY)', Validators.Types.Date),
        ];

        return (
          <Container theme={theme} className={className} style={style}>
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Additional info</Header>

              <Text text={StyledText.text ({
                  text: "You must provide some additional info before continuing.",
                  style: {
                    display: 'inline-block',
                    color: theme.color,
                    marginLeft: '8px',
                    marginRight: '8px',
                  }
                })} />
              
              <StyledForm
                finalizeIcon={faSignInAlt}
                finalizeText={'Continue'}
                theme={theme}
                items={DOB_FORM_ITEMS}
                verifiers={DOB_FORM_VERIFIERS}
                onFinalize={this.onFinalizeDateOfBirth_}
                finalizeDisabled={authenticating}
              />
            </Card>
          </Container>
        );
      }

      if (!userConsent.legalAcceptance) {
        const dobDate = new Date(userConsent.dateOfBirth);
        if (this.getAge(dobDate) < 16) {
          // Under 16, so collect parental email
          const PARENT_EMAIL_FORM_ITEMS: Form.Item[] = [
            Form.email('parentEmail', 'Parent email'),
          ];
  
          const PARENT_EMAIL_FORM_VERIFIERS: Form.Item[] = [
            Form.verifier('parentEmail', 'A valid parent email is required', Validators.Types.Email),
          ];
  
          return (
            <Container theme={theme} className={className} style={style}>
              <Card theme={theme}>
                {kiprLogo}
  
                <Header theme={theme}>Additional info</Header>

                <Text text={StyledText.text ({
                  text: "You must get your parent's permission to use this service. After you request permission, your parent will receive an email with further instructions.",
                  style: {
                    display: 'inline-block',
                    color: theme.color,
                    marginLeft: '8px',
                    marginRight: '8px',
                  }
                })} />
                
                <StyledForm
                  finalizeIcon={faSignInAlt}
                  finalizeText={'Request Parental Consent'}
                  theme={theme}
                  items={PARENT_EMAIL_FORM_ITEMS}
                  verifiers={PARENT_EMAIL_FORM_VERIFIERS}
                  onFinalize={this.onFinalizeParentEmail_}
                  finalizeDisabled={authenticating}
                />
              </Card>
            </Container>
          );
        } else {
          return <Container theme={theme} className={className} style={style}>
            <Card theme={theme}>
              {kiprLogo}

              <Header theme={theme}>Terms of use</Header>

              <Text text={StyledText.text ({
                text: "Read and accept the privacy policy and terms of use below.",
                style: {
                  display: 'inline-block',
                  color: theme.color,
                  marginLeft: '8px',
                  marginRight: '8px',
                }
              })} />

              {/* TODO: replace with actual PDF */}
              <iframe src="/static/sample.pdf" />

              <StyledForm
                finalizeIcon={faSignInAlt}
                finalizeText={'Accept'}
                theme={theme}
                items={[]}
                verifiers={[]}
                onFinalize={this.onFinalizeTerms_}
                finalizeDisabled={authenticating}
              />
            </Card>
          </Container>
        }
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

              <Text text={StyledText.text ({
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
              onFinalize={this.onFinalize_}
              finalizeDisabled={authenticating}
            />
          </Card>
        </Container>
      );
    }

    const LOGIN_FORM_ITEMS: Form.Item[] = [
      Form.email('email', 'Email'),
      Form.password('password', 'Password', undefined, this.onForgotPasswordClick_, 'Forgot?', false),
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
    
    const FORMS = [LOGIN_FORM_ITEMS, SIGNUP_FORM_ITEMS];

    const googleButtonItems = [
      StyledText.component ({
        component: StyledToolIcon,
        props: {
          icon: faGoogle,
          brand: true,
          theme,
        }
      }),
      StyledText.text ({
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

    return (
      <Container theme={theme} className={className} style={style}>
        <Card theme={theme}>
          {kiprLogo}

          <Header theme={theme}>{index === 0 ? 'Sign In' : 'Sign Up'}</Header>
          
          <StyledForm
            finalizeIcon={index === 0 ? faSignInAlt : faUserPlus}
            finalizeText={index === 0 ? 'Sign In' : 'Sign Up'}
            theme={theme}
            items={FORMS[index]}
            verifiers={index === 0 ? undefined : SIGNUP_FORM_VERIFIERS}
            onFinalize={this.onFinalize_}
            finalizeDisabled={authenticating}
          />
          {logInFailedMessage && <Text text={
            StyledText.text ({
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
          }/>}
          <SocialContainer theme={theme}>
            <Button 
              theme={theme} 
              onClick={() => this.signInWithSocialMedia_(Providers.google)} 
              children={googleButtonItems.map((item, i) => (
                <Text key={i} text={item} />
              ))}/>
          </SocialContainer>
          <StyledTabBar theme={theme} tabs={TABS} index={index} onIndexChange={this.onTabIndexChange_} />
        </Card>
      </Container>
    );
  }
}

export default LoginPage;