/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';
import { AuthProvider } from 'firebase/auth';
import { Providers } from '../../firebase/firebase';
import { ThemeProps } from '../../components/theme';
import { StyleProps } from '../../style';
import { CSSProperties } from 'hoist-non-react-statics/node_modules/@types/react';

interface LoginProps extends ThemeProps,StyleProps {
  isLoginOpen: boolean;
  signInWithSocialMedia: (provider: AuthProvider) => void;
  signInWithEmail: (email, password) => void;
  authenticating: boolean;
}

interface LoginState {
  email: string;
  password: string;
}

type Props = LoginProps;
type State = LoginState;

export class Login extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  private onEmailChange_ = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };
    
  private onPasswordChange_ = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value });
  };
  
  private onKeyDown_ = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return false;
    this.props.isLoginOpen && document.getElementById('login-button').click();
  };

  render() {
    const { props, state } = this;

    const { style, theme } = props;

    const name = 'Login';

    const textStyle: CSSProperties = {
      fontWeight: 450,
      margin: '4px',
    };

    const buttonStyle: CSSProperties = {
      width: '35%',
      margin: '15px 5px 5px 5px',
      padding: '3px 5px 3px 5px',
      fontWeight: 450,
      borderRadius: '5px',
      border: `1px solid ${theme.borderColor}`,
    };

    const googleButtonStyle: CSSProperties = {
      margin: '5px 0px 20px 0px',
      border: `0px solid ${props.theme.borderColor}`,
      backgroundColor: theme.backgroundColor,
      color: 'black',
    };

    return (
      <div className="auth-main-container">
        <div className="sign-up-wrapper">
          <div className="input-group">
            <div style={textStyle}>
              <label htmlFor="email">Email</label>
            </div>
            <input
              type="text"
              name="email"
              className="login-input"
              placeholder="Email"
              onChange={this.onEmailChange_} 
              onKeyDown={this.onKeyDown_}
            />
          </div>

          <div className="input-group">
            <div style={textStyle}>
              <label htmlFor="password">Password</label>
            </div>
            <input
              type="password"
              name="password"
              className="login-input"
              placeholder="Password"
              onChange={this.onPasswordChange_} 
              onKeyDown={this.onKeyDown_}
            />
          </div>
          <div className="input-buttons">
            <button 
              id="login-button"
              style={buttonStyle} 
              type="button" 
              className="login-btn" 
              disabled={this.props.authenticating} 
              onClick={() => this.props.signInWithEmail(this.state.email, this.state.password)}>
                Login
            </button>
          </div>
        </div>
        <div className="google-btn-wrapper">
          <div style={textStyle}>or</div>
          <button style={googleButtonStyle} disabled={this.props.authenticating} onClick={() => this.props.signInWithSocialMedia(Providers.google)}>
            <img src='../../static/google_signin_dark_normal.png' alt='Google' />
          </button>
        </div>
      </div>
    );
  }
}

export default Login;