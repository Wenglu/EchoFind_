// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQL7wqVfn6cLs62QogXcqpYSpLa_9h7Ao",
  authDomain: "echofind-8b1fa.firebaseapp.com",
  projectId: "echofind-8b1fa",
  storageBucket: "echofind-8b1fa.firebasestorage.app",
  messagingSenderId: "793602128785",
  appId: "1:793602128785:web:8bda1c29376336666cf830",
  measurementId: "G-L3LDM70CFT",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
