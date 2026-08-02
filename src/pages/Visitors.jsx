import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function Visitors() {
  const { user, role } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const base = collection(db, "visitors");
    const q =
      role === "admin"
        ? query(base, orderBy("createdAt", "desc"))
        : query(base, where("createdBy", "==", user.uid), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setVisitors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [user, role]);

  const filtered = visitors.filter((v) =>
    `${v.fullName} ${v.phone} ${v.invitedBy}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Visitors {role === "admin" ? <span className="text-gray-400 font-normal">(all)</span> : null}
          </h1>
          <p className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <input
          type="text"
          placeholder="Search visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No visitors found.</p>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {filtered.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{v.fullName}</p>
                <p className="text-xs text-gray-500">
                  {v.phone} {v.visitDate ? `· visited ${v.visitDate}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {v.followUpNeeded && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                    Follow-up
                  </span>
                )}
                {role === "admin" && (
                  <span className="text-xs text-gray-400">by {v.createdByName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}