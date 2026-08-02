import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function Members() {
  const { user, role } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const base = collection(db, "members");
    const q =
      role === "admin"
        ? query(base, orderBy("createdAt", "desc"))
        : query(base, where("createdBy", "==", user.uid), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [user, role]);

  const filtered = members.filter((m) =>
    `${m.fullName} ${m.phone} ${m.department}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Members {role === "admin" ? <span className="text-gray-400 font-normal">(all)</span> : null}
          </h1>
          <p className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No members found.</p>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.fullName}</p>
                <p className="text-xs text-gray-500">
                  {m.phone} {m.department ? `· ${m.department}` : ""}
                </p>
              </div>
              {role === "admin" && (
                <span className="text-xs text-gray-400">by {m.createdByName}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}