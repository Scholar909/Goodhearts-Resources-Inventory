// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsx3w_IZSgKWPB4PbG3uP1-2e7DDpXHDY",
  authDomain: "shop-inventory-goodhearts.firebaseapp.com",
  projectId: "shop-inventory-goodhearts",
  storageBucket: "shop-inventory-goodhearts.appspot.com",
  messagingSenderId: "706950196780",
  appId: "1:706950196780:web:ccccc869228a91d53c2b89"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other modules
export {
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  ref,
  uploadBytes,
  getDownloadURL
};