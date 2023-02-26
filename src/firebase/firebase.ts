import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import config from './config';

const firebase = initializeApp(config.firebase);

// Add or Remove authentication methods here
export const Providers = {
  google: new GoogleAuthProvider(),
};

export const auth = getAuth();

export default firebase;