// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkNbrBIBekGwaUdoGOXIyHDepMhaB5zHQ",
  authDomain: "proyecto-facturas-475d0.firebaseapp.com",
  projectId: "proyecto-facturas-475d0",
  storageBucket: "proyecto-facturas-475d0.firebasestorage.app",
  messagingSenderId: "372357498281",
  appId: "1:372357498281:web:2e31428d171715d4f2b0b8",
  measurementId: "G-LSCDH16J7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Acceder a la Base de Datos
export const db = getFirestore(app);
