// firebaseConfig.js

// Import the Firebase SDK modules you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDvnoHJ83YRRhs_VUPwakV-lkbbfi0s_jQ",
  authDomain: "healthvault-auth-1d5d8.firebaseapp.com",
  projectId: "healthvault-auth-1d5d8",
  storageBucket: "healthvault-auth-1d5d8.appspot.com",
  messagingSenderId: "968505675087",
  appId: "1:968505675087:web:68a83a5388c42994c0893a",
  measurementId: "G-J5VXKC6DCE"
};

// ✅ Initialize Firebase app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Initialize Firebase services (Auth, Firestore, Storage)
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export them for use across the app
export { app, auth, db, storage };
