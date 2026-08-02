import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { profile, role, logout } = useAuth();

  const displayName = profile?.name || profile?.email?.split("@")[0] || "User";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome, {displayName}
        </h2>
        <p className="text-gray-500">Church Management System</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium capitalize">
          {role || "Secretary"}
        </span>

        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
}