import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDS_4BRL4ecdzdneNOyNudVTfE7vsDEsYo",
  authDomain: "habitplus-f3664.firebaseapp.com",
  projectId: "habitplus-f3664",
  storageBucket: "habitplus-f3664.firebasestorage.app",
  messagingSenderId: "940708495865",
  appId: "1:940708495865:web:a2a86f5ed888d1777e7d28",
  measurementId: "G-8BLGDQN2W7",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
