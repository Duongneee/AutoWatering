
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyALwBsc9XNs9O4JG1QIG494XUPXhCF1CnM",
    authDomain: "auto-watering-7c50f.firebaseapp.com",
    databaseURL: "https://auto-watering-7c50f-default-rtdb.europe-west1.firebasedatabase.app", // Thay đổi ở đây
    projectId: "auto-watering-7c50f",
    storageBucket: "auto-watering-7c50f.appspot.com",
    messagingSenderId: "459475578720",
    appId: "1:459475578720:web:3f709de262e64497843805",
    measurementId: "G-D47T7JPX3H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export auth
export { auth };

// Initialize Realtime Database
const realtimedb = getDatabase(app);

// Export realtimedb
export { realtimedb };
