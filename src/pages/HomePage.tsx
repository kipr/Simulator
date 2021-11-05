/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled, withStyleDeep } from 'styletron-react';
import { auth, Providers } from '../firebase/firebase';
import { 
  signInWithEmail, 
  signInWithSocialMediaRedirect, 
  createUserWithEmail, 
  forgotPassword
} from '../firebase/modules/auth';
import { AuthProvider, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import Form from '../components/Form';
import { TabBar } from '../components/TabBar';

import KIPR_LOGO_BLACK from '../assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../assets/KIPR-Logo-White-Text-Clear-Large.png';
import { Fa } from '../components/Fa';
import { Text } from '../components/Text';
import { StyledText } from '../util';
import Button from '../components/Button';
import PageProps from './interfaces/page.interface';
import { Validators } from '../util/Validator';

export interface HomePageProps extends ThemeProps,StyleProps,PageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
}

interface HomePageState {
  authenticating: boolean,
  loggedIn: boolean;
  index: number;
  forgotPassword: boolean;
}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100vh',
  backgroundImage: 'url(../../static/Triangular_Background_Compressed.png)',
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

const StyledToolIcon = styled(Fa, (props: ThemeProps & { withBorder?: boolean }) => ({
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
  icon: 'sign-in-alt',
}, {
  name: 'Sign Up',
  icon: 'user-plus',
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

type Props = HomePageProps;
type State = HomePageState;

class HomePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      authenticating: false,
      loggedIn: auth.currentUser !== null,
      index: this.props.externalIndex !== undefined ? this.props.externalIndex : 0,
      forgotPassword: false,
    };
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

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
        this.setState({ loggedIn: true });
      } else {
        this.setState({ loggedIn: false });
      }
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
        this.setState({ authenticating: true });

        try { 
          signInWithEmail(values['email'], values['password']);
        } finally {
          console.log('Logged in with email');
          this.setState({ authenticating: false });
        }

        break;
      }
      case 1: {
        this.setState({ authenticating: true });

        try { 
          createUserWithEmail(values['email'], values['password']);
        } finally {
          console.log('Created user with email');
          this.setState({ authenticating: false });
        }
        break;
      }
    }
  };

  private signInWithSocialMedia_ = async (provider: AuthProvider) => {
    this.setState({ authenticating: true });
    await signInWithRedirect(auth, provider);
  };

  private onTabIndexChange_ = (index: number) => {
    this.setState({
      index
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
    const { className, style, history } = props;
    const { index, authenticating, loggedIn, forgotPassword } = state;
    const theme = DARK;

    const googleButtonItems = [
      StyledText.component ({
        component: StyledToolIcon,
        props: {
          icon: 'google',
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
    if (loggedIn) return <Redirect push to = '/dashboard' />;

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
              finalizeIcon='unlock'
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
      Form.password('password', 'Password', undefined, this.onForgotPasswordClick_, 'Forgot?'),
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

    return (
      <Container theme={theme} className={className} style={style}>
        <Card theme={theme}>
          {kiprLogo}

          <Header theme={theme}>{index === 0 ? 'Sign In' : 'Sign Up'}</Header>
          
          <StyledForm
            finalizeIcon={index === 0 ? 'sign-in-alt' : 'user-plus'}
            finalizeText={index === 0 ? 'Sign In' : 'Sign Up'}
            theme={theme}
            items={FORMS[index]}
            verifiers={index === 0 ? undefined : SIGNUP_FORM_VERIFIERS}
            onFinalize={this.onFinalize_}
            finalizeDisabled={authenticating}
          />
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

export default withRouter(HomePage);