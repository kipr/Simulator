/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import * as PropTypes from 'prop-types';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import Register from './auth/Register';
import Login from './auth/Login';
import { auth } from '../firebase/firebase';
import { SignInWithEmail, SignInWithSocialMedia, CreateUserWithEmail, ForgotPassword } from '../firebase/modules/auth';
import { AuthProvider } from 'firebase/auth';
import { CSSProperties } from 'hoist-non-react-statics/node_modules/@types/react';
import ForgotPass from './auth/ForgotPass';

export interface HomePageProps extends ThemeProps,StyleProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any;
}

interface HomePageState {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isForgotPassOpen: boolean;
  authenticating: boolean,
  error: string,
  loggedIn: boolean,
}

const VertContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundImage: `url(../../static/gray-hex-background.png)`,
  backgroundSize: 'cover',
}));

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
}));

const AuthContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '300px',
  border: `${props.theme.borderRadius} solid ${props.theme.borderColor}`,
  borderRadius: '10px',
  backgroundColor: props.theme.backgroundColor,
  padding: props.theme.widget.padding,
  margin: '10px',
  color: props.theme.color,
  foregroudColor: props.theme.foreground,
  textAlign: 'center',
  justifyContent: 'center',
}));

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

const ItemContainer = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: '48px',
  lineHeight: '28px',
  margin: '10px',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  zIndex: 1
}));

const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  borderRight: `1px solid ${props.theme.borderColor}`,
  paddingLeft: '20px',
  paddingRight: '20px',
  width: '33%',
  height: '100%',
  opacity: props.disabled ? '0.5' : '1.0',
  ':last-child': {
    borderRight: 'none'
  },
  fontWeight: 400,
  ':hover': props.onClick && !props.disabled ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {},
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

type Props = HomePageProps;
type State = HomePageState;

class HomePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoginOpen: true,
      isRegisterOpen: false,
      isForgotPassOpen: false,
      authenticating: false,
      error: '',
      loggedIn: null,
    };
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.authListener();
  }

  authListener() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is logged in');
        this.setState({ loggedIn: true });
      } else {
        this.setState({ loggedIn: false });
      }
    });
  }

  showLoginBox() {
    this.setState({ isLoginOpen: true, isRegisterOpen: false, isForgotPassOpen: false });
  }

  showRegisterBox() {
    this.setState({ isLoginOpen: false, isRegisterOpen: true, isForgotPassOpen: false });
  }

  showForgotPassBox() {
    this.setState({ isLoginOpen: false, isRegisterOpen: false, isForgotPassOpen: true });
  }

  private signInWithSocialMedia_ = (provider: AuthProvider) => {
    if (this.state.error !== '') this.setState({ error: '' });
    
    this.setState({ authenticating: true });
    
    SignInWithSocialMedia(provider)
      .then(result => {
        console.log('Logged in with Google');
      })
      .catch(err => {
        this.setState({ authenticating: false });
        this.setState({ error: err.message });
      });
  };

  private signInWithEmail_ = (email, password) => {
    if (this.state.error !== '') this.setState({ error: '' });
    
    this.setState({ authenticating: true });

    try { 
      SignInWithEmail(email, password);
    } finally {
      console.log('Logged in with email');
      this.setState({ authenticating: false });
    }
  };

  private signUpWithEmail_ = (email, password) => {
    if (this.state.error !== '') this.setState({ error: '' });

    this.setState({ authenticating: true });

    try {
      CreateUserWithEmail(email, password);
    } finally {
      this.setState({ authenticating: false });
      console.log('Created user with email');
    }
  };

  private forgotPassword_ = (email) => {
    if (this.state.error !== '') this.setState({ error: '' });

    ForgotPassword(email);
    this.showLoginBox();
    alert('Check your email for a password reset link.');
  };

  render() {
    const { props, state } = this;
    const { className, style, history } = props;
    const theme = DARK;

    const imgStyle: CSSProperties = {
      maxWidth: '150px',
      margin: '20px 20px 10px 20px',
    };

    const divOptionStyle: CSSProperties = {
      margin: '15px 0px 5px 0px',
      padding: '10px',
      fontWeight: 900,
      border: `3px solid ${theme.borderColor}`,
      borderLeft: 'none',
      borderRight: 'none',
    };

    if (this.state.loggedIn === true) {
      return <Redirect push to = '/sim' />;
    }

    return (
      <VertContainer className={'Home Page'} style={style} theme={theme}>
        <Container className={'main'} style={style} theme={theme}>
         
          <AuthContainer className={'AuthContainer'} theme={theme}>
            <div>
              <img style={imgStyle} src='../../static/KIPR-Logo-bk.jpg' alt='KIPR Logo' />
            </div>
            <ItemContainer theme={theme}>
              <Item
                theme={theme}
                className={`controller ${this.state.isLoginOpen ? "selected-controller" : ""}`}
                onClick={this.showLoginBox.bind(this)}>
              Login
              </Item>
              <Item
                theme={theme}
                className={`controller ${this.state.isRegisterOpen ? "selected-controller" : ""}`}
                onClick={this.showRegisterBox.bind(this)}>
              Register
              </Item>
              <Item
                theme={theme}
                className={`controller ${this.state.isForgotPassOpen ? "selected-controller" : ""}`}
                onClick={this.showForgotPassBox.bind(this)}>
                    Reset Password
              </Item>
            </ItemContainer>
            <div className={'auth-box'}>
              {
                this.state.isLoginOpen && 
                <Login 
                  theme={theme}
                  isLoginOpen={this.state.isLoginOpen}
                  signInWithEmail={this.signInWithEmail_}
                  signInWithSocialMedia={this.signInWithSocialMedia_}
                  authenticating={this.state.authenticating}/>
              }
              {
                this.state.isRegisterOpen && 
                <Register 
                  theme={theme} 
                  isRegisterOpen={this.state.isRegisterOpen}
                  signUpWithEmail={this.signUpWithEmail_}
                  signInWithSocialMedia={this.signInWithSocialMedia_}
                  authenticating={this.state.authenticating}/>
              }
              {
                this.state.isForgotPassOpen &&
                <ForgotPass
                  theme={theme}
                  isForgotPassOpen={this.state.isForgotPassOpen}
                  forgotPass={this.forgotPassword_}/>
              }
            </div>
          </AuthContainer>
        </Container>
      </VertContainer>
    );
  }
}

export default withRouter(HomePage);