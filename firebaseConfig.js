// firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Securely read config from app.config.js (which reads from .env)
const firebaseConfig = {
  apiKey: "AIzaSyDvnoHJ83YRRhs_VUPwakV-lkbbfi0s_jQ",
  authDomain: "healthvault-auth-1d5d8.firebaseapp.com",
  projectId: "healthvault-auth-1d5d8",
  storageBucket: "healthvault-auth-1d5d8.firebasestorage.app",
  messagingSenderId: "968505675087",
  appId: "1:968505675087:web:68a83a5388c42994c0893a",
  measurementId: "G-J5VXKC6DCE"
};

// ✅ Initialize Firebase app only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// ✅ Initialize Auth with Persistence (Fixes the "AsyncStorage" warning)
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage)
});

// ✅ Initialize other services
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export them
export { app, auth, db, storage };