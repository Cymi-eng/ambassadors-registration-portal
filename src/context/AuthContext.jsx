import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // firebase auth user
  const [role, setRole] = useState(null);       // "admin" | "secretary"
  const [profile, setProfile] = useState(null); // full users/{uid} doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({ uid: firebaseUser.uid, ...data });
          setRole(data.role || "secretary");
        } else {
          // No profile doc yet — default to secretary, don't lock them out
          setProfile({ uid: firebaseUser.uid, email: firebaseUser.email });
          setRole("secretary");
        }
      } catch (err) {
        console.error("Failed to load user role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email.trim(), password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}