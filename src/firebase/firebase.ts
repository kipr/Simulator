import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, connectAuthEmulator, getAuth } from 'firebase/auth';
import config from './config';

const firebase = initializeApp(config.firebase);

// Add or Remove authentication methods here
export const Providers = {
  google: new GoogleAuthProvider(),
};

export const auth = getAuth();

// Uncomment if using the Firebase local emulator
// connectAuthEmulator(auth, "http://127.0.0.1:9099");

export default firebase;