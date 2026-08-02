import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { role } = useAuth();

  return (
    <div className="bg-white shadow rounded-xl p-5 flex justify-between items-center mb-8">

      <div>
        <h2 className="text-2xl font-bold text-blue-900">
          Ambassadors Registration Portal
        </h2>

        <p className="text-gray-500">
          Church Management System
        </p>
      </div>

      <div className="flex items-center gap-4">

        <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold">
          {role || "Secretary"}
        </span>

      </div>

    </div>
  );
}