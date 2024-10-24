// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 apiKey: process.env.FIREBASE_API_KEY,
 authDomain: process.env.FIREBASE_AUTHDOMAIN,
 databaseURL: process.env.FIREBASE_DATA_BASE_URL,
 projectId: process.env.FIREBASE_PROJECT_ID,
 storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
 messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
 appId: process.env.FIREBASE_APP_ID,
 measurementId: process.env.FIREBASE_MEASURE_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

console.log(firebaseApp);

export default firebaseApp;
