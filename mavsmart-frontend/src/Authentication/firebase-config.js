import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDfeJxLfl84d23T8hUSABA8657rdj5tcjc",
  authDomain: "mavsmart-63cc6.firebaseapp.com",
  projectId: "mavsmart-63cc6",
  storageBucket: "mavsmart-63cc6.appspot.com",
  messagingSenderId: "326539424134",
  appId: "YOUR_APP_ID", // You can find this in your Firebase console
  measurementId: "YOUR_MEASUREMENT_ID", // You can find this in your Firebase console
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
