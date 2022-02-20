/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { 
  signInWithPopup, 
  signInWithRedirect,
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
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const signInWithEmail = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      console.log(error);
      if (error.code === 'auth/invalid-email') {
        console.log('Invalid email');
        window.location.reload();
      } else if (error.code === 'auth/wrong-password') {
        console.log('Wrong password');
        window.location.reload();
      } else {
        window.location.reload();
      }
    });
};

export const signOutOfApp = () => {
  signOut(auth)
    .then(() => {
      console.log("Logged out");
      window.location.reload();
    })
    .catch(error => {
      console.log(error);
    });
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