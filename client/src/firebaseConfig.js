import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY, // eslint-disable-line no-undef
  authDomain: "greentech-753ab.firebaseapp.com",
  projectId: "greentech-753ab",
  storageBucket: "greentech-753ab.firebasestorage.app",
  messagingSenderId: "951343265846",
  appId: "1:951343265846:web:dc77812eee194f0b9a8097",
  measurementId: "G-Y3ZL93SR4G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db, analytics };
