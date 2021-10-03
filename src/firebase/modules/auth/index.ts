/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { 
  signInWithPopup, 
  AuthProvider, 
  UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../firebase';

export const SignInWithSocialMedia = (provider: AuthProvider) =>
  new Promise<UserCredential>((resolve, reject) => {
    signInWithPopup(auth, provider)
      .then(result => resolve(result))
      .catch(error => reject(error));
  });

export const CreateUserWithEmail = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const SignInWithEmail = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      console.log(error);
      if (error.code === 'auth/invalid-email') {
        console.log('Invalid email');
        alert('Invalid email');
        window.location.reload();
      } else if (error.code === 'auth/wrong-password') {
        console.log('Wrong password');
        alert('Wrong password');
        window.location.reload();
      } else {
        alert('Unknown Error');
        window.location.reload();
      }
    });
};

export const SignOut = () => {
  signOut(auth)
    .then(() => {
      console.log("Logged out");
      window.location.reload();
    })
    .catch(error => {
      console.log(error);
    });
};

export const ForgotPassword = (email: string) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("Password reset email sent");
    })
    .catch(error => {
      console.log(error);
    });
};