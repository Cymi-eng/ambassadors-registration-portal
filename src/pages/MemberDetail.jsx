import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import Loader from "../components/Loader";

export default function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const snap = await getDoc(doc(db, "members", id));
        if (snap.exists()) {
          setMember({ id: snap.id, ...snap.data() });
        } else {
          setError("This member record no longer exists.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load member.");
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
        <Link to="/members" className="text-sm text-amber-700 hover:underline">
          Back to members
        </Link>
      </div>
    );
  }

  const joined =
    member.createdAt?.toDate?.() ? member.createdAt.toDate().toLocaleDateString() : "—";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to="/members" className="text-sm text-gray-500 hover:text-gray-800 transition mb-4 inline-block">
        ← Back to members
      </Link>

      <div className="border border-gray-100 rounded-xl p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{member.fullName}</h1>
        <p className="text-sm text-gray-500 mb-6">Recorded by {member.createdByName || "Unknown"} on {joined}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail label="Phone" value={member.phone} />
          <Detail label="Email" value={member.email} />
          <Detail label="Gender" value={member.gender} capitalize />
          <Detail label="Date of Birth" value={member.dob} />
          <Detail label="Department" value={member.department} />
          <Detail label="Join Date" value={member.joinDate} />
          <div className="sm:col-span-2">
            <Detail label="Address" value={member.address} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, capitalize = false }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm text-gray-900 ${capitalize ? "capitalize" : ""}`}>
        {value || <span className="text-gray-300">Not provided</span>}
      </p>
    </div>
  );
}