// Firebase Configuration
// Replace these values with your actual Firebase config

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// Your Firebase config (actual values from your console)
const firebaseConfig = {
  apiKey: "AIzaSyDmWm_n1ZuxlaZhepI_nxwN73NNPS8fGAI",
  authDomain: "neersetu-df972.firebaseapp.com",
  projectId: "neersetu-df972",
  storageBucket: "neersetu-df972.firebasestorage.app",
  messagingSenderId: "775472732535",
  appId: "1:775472732535:web:39bc4530e46e34adbce972",
  measurementId: "G-TM2L0L62QM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;
