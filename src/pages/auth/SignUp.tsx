/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthProvider } from 'firebase/auth';

import { SignInWithSocialMedia } from '../../firebase/modules/auth';
import { Providers } from '../../firebase/firebase';

import { ThemeProps } from '../../components/theme';
import { StyleProps } from '../../style';
import { styled } from 'styletron-react';

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '300px',
}));

export interface SignUpProps extends ThemeProps,StyleProps {}
type Props = SignUpProps;

const SignUp: React.FunctionComponent<SignUpProps> = props => {
  const [authenticating, setAuthenticating] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const history = useHistory();

  const signInWithSocialMedia = (provider: AuthProvider) => {
    if (error !== '') setError('');

    setAuthenticating(true);

    SignInWithSocialMedia(provider)
      .then(result => {
        history.push('/dashboard');
      })
      .catch(error => {
        setAuthenticating(false);
        setError(error.message);
      });
  };

  const name = 'SignUp';
  const { style, theme } = props;

  return (
    <Container className={name} style={style} theme={theme}>
      <div className="auth-main-container">
        <div>
          <h1 >Welcome to React App</h1>
          <p >Please Signup to continue by choosing one of the options below.</p>
        </div>
        <div className="auth-btn-wrapper">
          <button disabled={authenticating} onClick={() => signInWithSocialMedia(Providers.google)}>
            SignUp with Google
          </button>
        </div>
      </div>
    </Container>
  );
};

export default SignUp;