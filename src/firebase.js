// src/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { getFunctions } from "firebase/functions";


const firebaseConfig = {
  apiKey: "AIzaSyD4hc6yb6196XsOsaH6SFI6VMvoKB-5-BY",
  authDomain: "fit5032-a3-6fc3b.firebaseapp.com",
  projectId: "fit5032-a3-6fc3b",
  storageBucket: "fit5032-a3-6fc3b.firebasestorage.app",
  messagingSenderId: "1025908475487",
  appId: "1:1025908475487:web:4a2f6feefaf5752d02fdea"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, 'data-a3');
export const functions = getFunctions(app);