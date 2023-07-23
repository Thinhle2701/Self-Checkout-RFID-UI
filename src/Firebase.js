// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_YoVsFgXmp8b8LQtSqls2g33Tm9v_TpU",
  authDomain: "selfcheckout-c9beb.firebaseapp.com",
  projectId: "selfcheckout-c9beb",
  storageBucket: "selfcheckout-c9beb.appspot.com",
  messagingSenderId: "114580332101",
  appId: "1:114580332101:web:57620ade6d5783aeb88d2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app)