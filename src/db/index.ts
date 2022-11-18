import { auth } from '../firebase/firebase';
import FirebaseTokenManager from '../firebase/FirebaseTokenManager';
import Db from './Db';

export default new Db(`/api`, new FirebaseTokenManager(auth));