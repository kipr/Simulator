const { cert, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const axios = require('axios').default;

let firebaseAuth = null;

function initializeAuth(serviceAccountKey) {
  const firebaseApp = initializeApp({
    credential: cert(serviceAccountKey),
  });

  firebaseAuth = getAuth(firebaseApp);
}

// Create a custom token with specific claims
// Used to exchange for an ID token from firebase
function getCustomToken() {
  if (!firebaseAuth) {
    throw new Error('Firebase auth not initizlied');
  }

  return firebaseAuth.createCustomToken('simulator', { 'sim_backend': true });
}

// Get an ID token from firebase using a previously created custom token
function getIdTokenFromCustomToken(customToken) {
  if (!firebaseAuth) {
    throw new Error('Firebase auth not initizlied');
  }

  // TODO: move into config somewhere
  const apiKey = 'AIzaSyBiVC6umtYRy-aQqDUBv8Nn1txWLssix04';

  // Send request to auth emulator if using
  const urlPrefix = process.env.FIREBASE_AUTH_EMULATOR_HOST ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/` : 'https://';
  const url = `${urlPrefix}identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;

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

module.exports = {
  initializeAuth,
  getCustomToken,
  getIdTokenFromCustomToken,
};