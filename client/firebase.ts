import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD8fLirUW1W0LA5t6W90Kxh0H69nnkvTGk",
  authDomain: "demolition-3cfc0.firebaseapp.com",
  databaseURL: "https://demolition-3cfc0-default-rtdb.firebaseio.com",
  projectId: "demolition-3cfc0",
  storageBucket: "demolition-3cfc0.firebasestorage.app",
  messagingSenderId: "752367402614",
  appId: "1:752367402614:web:4f637754849c6d1004a957",
  measurementId: "G-N35BWBH26T"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);

export default app;
