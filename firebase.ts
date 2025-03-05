import { getApp ,getApps,initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG2DArpgkjOmeAehlDD0d39rlJbBuqafw",
  authDomain: "space-gpt-1f9ae.firebaseapp.com",
  projectId: "space-gpt-1f9ae",
  storageBucket: "space-gpt-1f9ae.appspot.com",
  messagingSenderId: "698268462032",
  appId: "1:698268462032:web:b53f13360f3435db25a7d5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };