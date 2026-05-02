import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Helper function to set up RecaptchaVerifier for phone authentication
 * This is used to verify that the user is not a bot before sending SMS
 * @param {string} containerId - ID of the container element for reCAPTCHA
 * @param {Function} callback - Callback function for verification success
 * @param {Function} errorCallback - Callback function for verification error
 * @returns {RecaptchaVerifier} - Firebase RecaptchaVerifier instance
 */
export const setupRecaptcha = (containerId, callback, errorCallback) => {
  return new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': callback,
    'expired-callback': errorCallback
  });
};