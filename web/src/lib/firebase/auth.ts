import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirebaseAuthClient } from "@/lib/firebase/config";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuthClient(), callback);
}

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuthClient(), provider);
}

export async function signOutUser() {
  return signOut(getFirebaseAuthClient());
}
