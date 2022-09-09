// Contains Global Configurations

import { FirebaseOptions } from "firebase/app";

const configMap: Record<string, FirebaseOptions> = {
  'PROD': {
    apiKey: "AIzaSyBiVC6umtYRy-aQqDUBv8Nn1txWLssix04",
    authDomain: "kipr-321905.firebaseapp.com",
    databaseURL: "https://kipr-321905-default-rtdb.firebaseio.com",
    projectId: "kipr-321905",
    storageBucket: "kipr-321905.appspot.com",
    messagingSenderId: "705985154569",
    appId: "1:705985154569:web:b929e7adb37cdebfe032d8",
    measurementId: "G-4HZ6TGQZ25"
  },
  'PRERELEASE': {
    apiKey: "AIzaSyBiVC6umtYRy-aQqDUBv8Nn1txWLssix04",
    authDomain: "kipr-321905.firebaseapp.com",
    databaseURL: "https://kipr-321905-default-rtdb.firebaseio.com",
    projectId: "kipr-321905",
    storageBucket: "kipr-321905.appspot.com",
    messagingSenderId: "705985154569",
    appId: "1:705985154569:web:b929e7adb37cdebfe032d8",
    measurementId: "G-4HZ6TGQZ25"
  },
  'DEV': {
    apiKey: "AIzaSyBiVC6umtYRy-aQqDUBv8Nn1txWLssix04",
    authDomain: "kipr-321905.firebaseapp.com",
    databaseURL: "https://kipr-321905-default-rtdb.firebaseio.com",
    projectId: "kipr-321905",
    storageBucket: "kipr-321905.appspot.com",
    messagingSenderId: "705985154569",
    appId: "1:705985154569:web:b929e7adb37cdebfe032d8",
    measurementId: "G-4HZ6TGQZ25"
  },
};

export default configMap[SIMULATOR_ENVIRONMENT];