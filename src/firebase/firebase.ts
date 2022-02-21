/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, getRedirectResult } from 'firebase/auth';
import config from './config';

const Firebase = initializeApp(config.firebase);

// Add or Remove authentication methods here
export const Providers = {
  google: new GoogleAuthProvider(),
};

export const auth = getAuth();
export default Firebase;