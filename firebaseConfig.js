// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFCyJjQ5DvKyj2_E6YgKQUOV2ipkwqpho",
  authDomain: "health-vault-4d4a5.firebaseapp.com",
  projectId: "health-vault-4d4a5",
  storageBucket: "health-vault-4d4a5.firebasestorage.app",
  messagingSenderId: "567763185073",
  appId: "1:567763185073:web:e45c09848ab082db462190",
  measurementId: "G-2HCZDQ7EYV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
