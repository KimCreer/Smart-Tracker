// Import necessary Firebase services
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDFAUXV-pJxgI8OsekKNDrZ6K4yrb2XaE",
  authDomain: "gmeet-tracker-a2cf7.firebaseapp.com",
  projectId: "gmeet-tracker-a2cf7",
  storageBucket: "gmeet-tracker-a2cf7.firebasestorage.app",
  messagingSenderId: "802437833146",
  appId: "1:802437833146:web:2900cd8606821af493bd83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services for use in other files
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, addDoc, collection };
