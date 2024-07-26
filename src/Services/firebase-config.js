import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Alternatif olarak initializeApp çağrısını firebase'den değil 'firebase/app' den yapabilirsiniz.
// const app = firebase.apps.length ? firebase.app() : initializeApp(firebaseConfig);
const app = firebase.apps.length ? firebase.app() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth, firebase };
