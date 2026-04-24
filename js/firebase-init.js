import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVZTTqGhpWXBruK27tW3ofVSLTFrOwBMY",
  authDomain: "metas-operativas.firebaseapp.com",
  projectId: "metas-operativas",
  storageBucket: "metas-operativas.firebasestorage.app",
  messagingSenderId: "777458970974",
  appId: "1:777458970974:web:65dbb714c4f4898cd99fcf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };