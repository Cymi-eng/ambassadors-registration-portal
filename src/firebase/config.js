import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOjZw0RxToCKNlMe0OCVAUWeq5BroV9GE",
  authDomain: "ambassodors--portal.firebaseapp.com",
  projectId: "ambassodors--portal",
  storageBucket: "ambassodors--portal.firebasestorage.app",
  messagingSenderId: "364847124588",
  appId: "1:364847124588:web:2b57f20b88196b16294849",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;