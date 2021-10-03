/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';
import { ForgotPassword } from '../../firebase/modules/auth';
import { ThemeProps } from '../../components/theme';
import { StyleProps } from '../../style';
import { CSSProperties } from 'hoist-non-react-statics/node_modules/@types/react';

interface ForgotPassProps extends ThemeProps,StyleProps {
  isForgotPassOpen: boolean;
  forgotPass: (email: string) => void;
}

interface ForgotPassState {
  email: string;
}

type Props = ForgotPassProps;
type State = ForgotPassState;

export class ForgotPass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      email: '',
    };

  }

  private onEmailChange_ = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  private onKeyDown_ = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return false;
    this.props.isForgotPassOpen && document.getElementById('send-button').click();
  };
  
  render() {

    const { props, state } = this;

    const { style, theme } = props;

    const name = 'Forgot Password';

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
          <div className="input-buttons">
            <button 
              id="send-button"
              style={buttonStyle} 
              type="button" 
              className="send-btn" 
              onClick={() => this.props.forgotPass(this.state.email)}>
                Send Email
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ForgotPass;