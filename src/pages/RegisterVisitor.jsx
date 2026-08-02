import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  invitedBy: "",
  howHeard: "", // friend, social media, crusade, walk-in...
  visitDate: new Date().toISOString().slice(0, 10),
  followUpNeeded: false,
  notes: "",
};

export default function RegisterVisitor() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await addDoc(collection(db, "visitors"), {
        ...form,
        phone: form.phone.trim(),
        createdBy: user.uid,
        createdByName: profile?.name || profile?.email || "Unknown",
        createdAt: serverTimestamp(),
      });

      setMessage({ type: "success", text: "Visitor logged successfully." });
      setForm({ ...emptyForm, visitDate: new Date().toISOString().slice(0, 10) });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Register Visitor</h1>
      <p className="text-sm text-gray-500 mb-6">Log a first-time or returning visitor.</p>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
        <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Invited By" name="invitedBy" value={form.invitedBy} onChange={handleChange} />
        <div>
          <label className="block text-sm text-gray-600 mb-1">How did they hear about us?</label>
          <select
            name="howHeard"
            value={form.howHeard}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select</option>
            <option value="friend">Friend / Family</option>
            <option value="social_media">Social Media</option>
            <option value="crusade">Crusade / Outreach</option>
            <option value="walk_in">Walk-in</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Field label="Visit Date" name="visitDate" type="date" value={form.visitDate} onChange={handleChange} required />
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="followUpNeeded"
            checked={form.followUpNeeded}
            onChange={handleChange}
            id="followUp"
            className="h-4 w-4"
          />
          <label htmlFor="followUp" className="text-sm text-gray-600">
            Needs follow-up
          </label>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 text-black font-medium rounded-lg px-5 py-2 text-sm hover:bg-yellow-300 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : "Register Visitor"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}