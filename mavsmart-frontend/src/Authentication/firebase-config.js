// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfeJxLfl84d23T8hUSABA8657rdj5tcjc",
  authDomain: "mavsmart-63cc6.firebaseapp.com",
  projectId: "mavsmart-63cc6",
  storageBucket: "mavsmart-63cc6.appspot.com", // Corrected storageBucket URL
  messagingSenderId: "326539424134",
  appId: "1:326539424134:web:deedff7490d199494afc07",
  measurementId: "G-N58Q20VQV0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database
const analytics = getAnalytics(app); // Firebase Analytics

// Export initialized services
export { auth, db, analytics };
