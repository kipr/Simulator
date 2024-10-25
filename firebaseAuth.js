/* eslint-env node */

const { cert, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const axios = require('axios').default;

class FirebaseTokenManager {
  constructor(serviceAccountKey, firebaseApiKey) {
    this.firebaseApiKey = firebaseApiKey;

    const firebaseApp = initializeApp({
      credential: cert(serviceAccountKey),
    });
  
    this.firebaseAuth = getAuth(firebaseApp);

    this.idToken = null;
    this.idTokenExp = null;

    // Immediately schedule a refresh to get the initial token
    this.refreshTimerId = setTimeout(this.refreshToken.bind(this), 0);
  }

  getToken() {
    // May return an expired token if token refresh is failing
    console.log('using firebase token', this.idToken);
    return this.idToken;
  }

  refreshToken() {
    console.log('REFRESHING FIREBASE TOKEN');
    return this.getCustomToken()
      .then(customToken => {
        console.log('GOT CUSTOM TOKEN:', customToken);
        return this.getIdTokenFromCustomToken(customToken);
      })
      .then(idToken => {
        console.log('GOT ID TOKEN:', idToken);

        if (!idToken) {
          throw new Error('Failed to get ID token');
        }

        const base64Url = idToken.split('.')[1];
        console.log('base64Url', base64Url);

        const buff = Buffer.from(base64Url, 'base64url');
        const raw = buff.toString('ascii');
        console.log('raw', raw);

        const parsed = JSON.parse(raw);
        console.log('parsed', parsed);

        const exp = parsed['exp'];
        console.log('exp', exp);

        this.idTokenExp = exp;
        this.idToken = idToken;

        // Schedule refresh 5 mins before expiration
        const msUntilExpiration = (exp * 1000) - Date.now();
        const refreshAt = msUntilExpiration - (5 * 60 * 1000);
        if (refreshAt > 0) {
          console.log('scheduling refresh in', refreshAt, 'ms');
          this.refreshTimerId = setTimeout(this.refreshToken.bind(this), refreshAt); 
        } else {
          console.log('GOT NEGATIVE REFRESH AT TIME');
        }
      })
      .catch(e => {
        // Try again in 1 minute
        console.error('Token refresh failed, retrying in 1 min', e);
        this.refreshTimerId = setTimeout(this.refreshToken.bind(this), 60 * 1000);
      });
  }

  // Create a custom token with specific claims
  // Used to exchange for an ID token from firebase
  getCustomToken() {
    if (!this.firebaseAuth) {
      throw new Error('Firebase auth not initizlied');
    }

    return this.firebaseAuth.createCustomToken('simulator', { 'sim_backend': true });
  }

  // Get an ID token from firebase using a previously created custom token
  getIdTokenFromCustomToken(customToken) {
    if (!this.firebaseAuth) {
      throw new Error('Firebase auth not initizlied');
    }

    // Send request to auth emulator if using
    const urlPrefix = process.env.FIREBASE_AUTH_EMULATOR_HOST ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/` : 'https://';
    const url = `${urlPrefix}identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${this.firebaseApiKey}`;

    return axios.post(url, {
      token: customToken,
      returnSecureToken: true,
    })
      .then(response => {
        const responseBody = response.data;
        return responseBody.idToken;
      })
      .catch(error => {
        console.error('FAILED TO GET ID TOKEN', error?.response?.data?.error);
        return null;
      });
  }
}

module.exports = {
  FirebaseTokenManager,
};