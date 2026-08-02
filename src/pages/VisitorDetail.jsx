import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import Loader from "../components/Loader";

const HOW_HEARD_LABELS = {
  friend: "Friend / Family",
  social_media: "Social Media",
  crusade: "Crusade / Outreach",
  walk_in: "Walk-in",
  other: "Other",
};

export default function VisitorDetail() {
  const { id } = useParams();
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisitor = async () => {
      try {
        const snap = await getDoc(doc(db, "visitors", id));
        if (snap.exists()) {
          setVisitor({ id: snap.id, ...snap.data() });
        } else {
          setError("This visitor record no longer exists.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load visitor.");
      } finally {
        setLoading(false);
      }
    };
    fetchVisitor();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
        <Link to="/visitors" className="text-sm text-amber-700 hover:underline">
          Back to visitors
        </Link>
      </div>
    );
  }

  const logged =
    visitor.createdAt?.toDate?.() ? visitor.createdAt.toDate().toLocaleDateString() : "—";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to="/visitors" className="text-sm text-gray-500 hover:text-gray-800 transition mb-4 inline-block">
        ← Back to visitors
      </Link>

      <div className="border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-gray-900">{visitor.fullName}</h1>
          {visitor.followUpNeeded && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
              Follow-up needed
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">Recorded by {visitor.createdByName || "Unknown"} on {logged}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail label="Phone" value={visitor.phone} />
          <Detail label="Email" value={visitor.email} />
          <Detail label="Invited By" value={visitor.invitedBy} />
          <Detail label="How They Heard" value={HOW_HEARD_LABELS[visitor.howHeard] || visitor.howHeard} />
          <Detail label="Visit Date" value={visitor.visitDate} />
          <div className="sm:col-span-2">
            <Detail label="Address" value={visitor.address} />
          </div>
          <div className="sm:col-span-2">
            <Detail label="Notes" value={visitor.notes} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-900">
        {value || <span className="text-gray-300">Not provided</span>}
      </p>
    </div>
  );
}