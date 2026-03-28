// models/firebase.js — Firebase initialization (Model layer)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config — client-side keys are safe to expose
// Bảo mật thực sự nằm ở Firestore Security Rules
const firebaseConfig = {
  apiKey: "AIzaSyBUoHZ-9AurMu5SqSIzfVvTcYKfPrz37Yk",
  authDomain: "kdhelpmap.firebaseapp.com",
  projectId: "kdhelpmap",
  storageBucket: "kdhelpmap.firebasestorage.app",
  messagingSenderId: "979831969947",
  appId: "1:979831969947:web:946b9994908bf7a220ce3e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
