/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { 
  signInWithPopup, 
  getRedirectResult,
  AuthProvider, 
  UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../firebase';

export const signInWithSocialMedia = (provider: AuthProvider) =>
  new Promise<UserCredential>((resolve, reject) => {
    signInWithPopup(auth, provider)
      .then(result => resolve(result))
      .catch(error => reject(error));
  });

export const signInWithSocialMediaRedirect = (provider: AuthProvider) => {
  return new Promise<UserCredential>((resolve, reject) => {
    getRedirectResult(auth)
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
};


export const createUserWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.log(error);
      throw error.code;
    });
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.log(error);
      throw error.code;
    });
};

export const signOutOfApp = async () => {
  return await signOut(auth);
};

export const forgotPassword = (email: string) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("Password reset email sent");
    })
    .catch(error => {
      console.log(error);
    });
};