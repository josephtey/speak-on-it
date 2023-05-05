// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9G_Rf6GVfbeTHMbRaetbExS2pqcMnYU4",
  authDomain: "speak-on-it-25d86.firebaseapp.com",
  projectId: "speak-on-it-25d86",
  storageBucket: "speak-on-it-25d86.appspot.com",
  messagingSenderId: "284014478181",
  appId: "1:284014478181:web:f1e6f1e5c0197e4e5d978c",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
