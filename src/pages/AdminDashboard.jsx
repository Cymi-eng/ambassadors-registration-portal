import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let loaded = 0;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= 2) setLoading(false);
    };
    const handleError = (err) => {
      console.error("Admin dashboard listener error:", err);
      setError(err.message || "Failed to load dashboard data.");
      setLoading(false);
    };

    const unsubMembers = onSnapshot(
      collection(db, "members"),
      (snap) => {
        setMembers(snap.docs.map((d) => d.data()));
        markLoaded();
      },
      handleError
    );

    const unsubVisitors = onSnapshot(
      collection(db, "visitors"),
      (snap) => {
        setVisitors(snap.docs.map((d) => d.data()));
        markLoaded();
      },
      handleError
    );

    return () => {
      unsubMembers();
      unsubVisitors();
    };
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-sm text-red-600 font-medium mb-2">Couldn't load dashboard data</p>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  const followUpCount = visitors.filter((v) => v.followUpNeeded).length;
  const displayName = profile?.name || profile?.email?.split("@")[0] || "Admin";

  // Per-secretary breakdown
  const bySecretary = {};
  [...members.map((m) => ({ ...m, kind: "member" })), ...visitors.map((v) => ({ ...v, kind: "visitor" }))].forEach(
    (r) => {
      const name = r.createdByName || "Unknown";
      if (!bySecretary[name]) bySecretary[name] = { members: 0, visitors: 0 };
      bySecretary[name][r.kind === "member" ? "members" : "visitors"] += 1;
    }
  );
  const secretaryRows = Object.entries(bySecretary).sort(
    (a, b) => b[1].members + b[1].visitors - (a[1].members + a[1].visitors)
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Hi, {displayName}</h1>
      <p className="text-sm text-gray-500 mb-8">Here's what's happening across the church.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Members" value={members.length} accent="bg-amber-50 text-amber-700" />
        <StatCard label="Visitors" value={visitors.length} accent="bg-sky-50 text-sky-700" />
        <StatCard label="Need follow-up" value={followUpCount} accent="bg-rose-50 text-rose-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <ActionCard to="/register-member" title="Register a member" desc="Add a new church member." />
        <ActionCard to="/register-visitor" title="Register a visitor" desc="Log a first-time visitor." />
        <ActionCard to="/members" title="View all members" desc="Browse and search member records." />
        <ActionCard to="/visitors" title="View all visitors" desc="Browse and search visitor records." />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">By secretary</h2>
        {secretaryRows.length === 0 ? (
          <p className="text-sm text-gray-400">No records yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {secretaryRows.map(([name, counts]) => (
              <div key={name} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">
                  {counts.members} member{counts.members !== 1 ? "s" : ""} · {counts.visitors} visitor
                  {counts.visitors !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
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