import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebaseConfig from './config';

const Firebase = initializeApp(firebaseConfig);

// Add or Remove authentication methods here
export const Providers = {
  google: new GoogleAuthProvider(),
};

export const auth = getAuth();
export default Firebase;