import { useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
  address: "",
  department: "", // e.g. choir, ushering, youth
  joinDate: "",
};

export default function RegisterMember() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error" | "duplicate", text }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const checkDuplicate = async () => {
    if (!form.phone) return null;
    const q = query(collection(db, "members"), where("phone", "==", form.phone.trim()));
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const dup = await checkDuplicate();
      if (dup) {
        setMessage({
          type: "duplicate",
          text: `A member with this phone number already exists: ${dup.fullName}.`,
        });
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, "members"), {
        ...form,
        phone: form.phone.trim(),
        createdBy: user.uid,
        createdByName: profile?.name || profile?.email || "Unknown",
        createdAt: serverTimestamp(),
      });

      setMessage({ type: "success", text: "Member registered successfully." });
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Register Member</h1>
      <p className="text-sm text-gray-500 mb-6">Add a new church member to the records.</p>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : message.type === "duplicate"
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
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
        <div>
          <label className="block text-sm text-gray-600 mb-1">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <Field label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
        <Field label="Department" name="department" value={form.department} onChange={handleChange} />
        <Field label="Join Date" name="joinDate" type="date" value={form.joinDate} onChange={handleChange} />
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
          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 text-black font-medium rounded-lg px-5 py-2 text-sm hover:bg-yellow-300 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : "Register Member"}
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