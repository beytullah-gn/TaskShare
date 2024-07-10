import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAXRPtPtb11D36bqucUG0ZNfMEYjMdV918",
  authDomain: "taskshare-648cf.firebaseapp.com",
  databaseURL: "https://taskshare-648cf-default-rtdb.firebaseio.com",
  projectId: "taskshare-648cf",
  storageBucket: "taskshare-648cf.appspot.com",
  messagingSenderId: "185075008095",
  appId: "1:185075008095:web:93bc87445ec3625bbd11ea",
  measurementId: "G-CFD7FDE8Y5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };
