import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/register-member", label: "Register Member" },
  { to: "/register-visitor", label: "Register Visitor" },
  { to: "/members", label: "Members" },
  { to: "/visitors", label: "Visitors" },
];

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();

  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40"
          aria-hidden="true"
        />
      )}

      {/* drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Ambassadors</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 capitalize">Signed in as {role || "secretary"}</p>
        </div>
      </aside>
    </>
  );
}