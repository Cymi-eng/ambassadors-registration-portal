import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function SecretaryDashboard() {
  const { user, profile } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    let loaded = 0;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= 2) setLoading(false);
    };
    const handleError = (err) => {
      console.error("Secretary dashboard listener error:", err);
      setError(err.message || "Failed to load your records.");
      setLoading(false);
    };

    const unsubMembers = onSnapshot(
      query(collection(db, "members"), where("createdBy", "==", user.uid)),
      (snap) => {
        setMemberCount(snap.size);
        markLoaded();
      },
      handleError
    );

    const unsubVisitors = onSnapshot(
      query(collection(db, "visitors"), where("createdBy", "==", user.uid)),
      (snap) => {
        setVisitorCount(snap.size);
        markLoaded();
      },
      handleError
    );

    return () => {
      unsubMembers();
      unsubVisitors();
    };
  }, [user]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-sm text-red-600 font-medium mb-2">Couldn't load your records</p>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  const displayName = profile?.name || profile?.email?.split("@")[0] || "there";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Hi, {displayName}</h1>
      <p className="text-sm text-gray-500 mb-8">What would you like to do?</p>

      {/* Big primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/register-member"
          className="bg-amber-400 hover:bg-amber-300 rounded-xl p-6 text-center transition"
        >
          <p className="text-black font-semibold">Register Member</p>
          <p className="text-black/60 text-xs mt-1">Add a church member</p>
        </Link>
        <Link
          to="/register-visitor"
          className="bg-slate-900 hover:bg-slate-800 rounded-xl p-6 text-center transition"
        >
          <p className="text-white font-semibold">Register Visitor</p>
          <p className="text-white/60 text-xs mt-1">Log a first-time visitor</p>
        </Link>
      </div>

      {/* Personal stats, smaller */}
      <div className="flex items-center gap-6 mb-8">
        <div>
          <p className="text-2xl font-semibold text-gray-900">{memberCount}</p>
          <p className="text-xs text-gray-500">members you've registered</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-semibold text-gray-900">{visitorCount}</p>
          <p className="text-xs text-gray-500">visitors you've logged</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <Link to="/members" className="text-amber-700 hover:underline">
          View your members
        </Link>
        <Link to="/visitors" className="text-amber-700 hover:underline">
          View your visitors
        </Link>
      </div>
    </div>
  );
}