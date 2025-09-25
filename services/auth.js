// services/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Sign up new user
export async function signUpWithEmail(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Sign in existing user
export async function signInWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Sign out
export async function logout() {
  return await signOut(auth);
}
