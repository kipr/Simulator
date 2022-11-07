import { Auth } from 'firebase/auth';
import TokenManager from '../db/TokenManager';

class FirebaseTokenManager implements TokenManager {
  private auth_: Auth;
  
  constructor(auth: Auth) {
    this.auth_ = auth;
  }

  async token(): Promise<string> {
    const user = this.auth_.currentUser;
    if (!user) throw new Error('No user is signed in');
    const token = await user.getIdToken();
    return token;
  }
}

export default FirebaseTokenManager;