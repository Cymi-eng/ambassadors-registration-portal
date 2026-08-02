import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function Dashboard() {
  const { user, role, profile } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const membersBase = collection(db, "members");
    const visitorsBase = collection(db, "visitors");

    const membersQuery =
      role === "admin" ? membersBase : query(membersBase, where("createdBy", "==", user.uid));
    const visitorsQuery =
      role === "admin" ? visitorsBase : query(visitorsBase, where("createdBy", "==", user.uid));

    let loaded = 0;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= 2) setLoading(false);
    };

    const handleError = (err) => {
      console.error("Dashboard listener error:", err);
      setError(err.message || "Failed to load dashboard data.");
      setLoading(false);
    };

    const unsubMembers = onSnapshot(
      membersQuery,
      (snap) => {
        setMemberCount(snap.size);
        markLoaded();
      },
      handleError
    );

    const unsubVisitors = onSnapshot(
      visitorsQuery,
      (snap) => {
        setVisitorCount(snap.size);
        setFollowUpCount(snap.docs.filter((d) => d.data().followUpNeeded).length);
        markLoaded();
      },
      handleError
    );

    return () => {
      unsubMembers();
      unsubVisitors();
    };
  }, [user, role]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-sm text-red-600 font-medium mb-2">
          Couldn't load dashboard data
        </p>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  const displayName = profile?.name || profile?.email?.split("@")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        Hi, {displayName}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {role === "admin"
          ? "Here's what's happening across the church."
          : "Here's a summary of what you've recorded."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Members" value={memberCount} accent="bg-amber-50 text-amber-700" />
        <StatCard label="Visitors" value={visitorCount} accent="bg-sky-50 text-sky-700" />
        <StatCard
          label="Need follow-up"
          value={followUpCount}
          accent="bg-rose-50 text-rose-700"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard
          to="/register-member"
          title="Register a member"
          desc="Add a new church member to the records."
        />
        <ActionCard
          to="/register-visitor"
          title="Register a visitor"
          desc="Log a first-time or returning visitor."
        />
        <ActionCard to="/members" title="View members" desc="Browse and search member records." />
        <ActionCard to="/visitors" title="View visitors" desc="Browse and search visitor records." />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <span className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-2xl font-semibold ${accent}`}>
        {value}
      </span>
    </div>
  );
}

function ActionCard({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="border border-gray-100 rounded-xl p-5 hover:border-amber-300 hover:bg-amber-50/30 transition group"
    >
      <p className="text-sm font-medium text-gray-900 group-hover:text-amber-700">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </Link>
  );
}