import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD0CHPCuJKXZCSyGYGyKcwh_7AeaaVmhYc",
  authDomain: "dudhkela-6beea.firebaseapp.com",
  projectId: "dudhkela-6beea",
  storageBucket: "dudhkela-6beea.firebasestorage.app",
  messagingSenderId: "997624210609",
  appId: "1:997624210609:web:85e62942db2aea49ec6e90",
  measurementId: "G-5E729FV676"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

auth.settings = {
  ...auth.settings,
  passwordPolicy: {
    minimumLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumeric: true,
    requireSpecialCharacter: true
  }
}