/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { signInWithPopup, AuthProvider, UserCredential } from 'firebase/auth';
import { auth } from '../../firebase';

export const SignInWithSocialMedia = (provider: AuthProvider) =>
  new Promise<UserCredential>((resolve, reject) => {
    signInWithPopup(auth, provider)
      .then(result => resolve(result))
      .catch(error => reject(error));
  });