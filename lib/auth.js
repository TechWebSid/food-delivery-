import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export const registerUser = async (name, email, password, role) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    name,
    email,
    role,
    approved: role === "delivery" ? false : true,
    isAvailable: false,
    createdAt: new Date(),
  });

  return res.user;
};

export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", res.user.uid));
  return snap.data();
};

export const googleAuth = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      role: "user",
      approved: true,
      isAvailable: false,
      createdAt: new Date(),
    });
  }

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const approveDelivery = async (uid) => {
  await updateDoc(doc(db, "users", uid), {
    approved: true,
  });
};