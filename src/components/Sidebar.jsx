import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  ClipboardList,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Register Member",
      path: "/register-member",
      icon: UserPlus,
    },
    {
      name: "Register Visitor",
      path: "/register-visitor",
      icon: ClipboardList,
    },
    {
      name: "Members",
      path: "/members",
      icon: Users,
    },
    {
      name: "Visitors",
      path: "/visitors",
      icon: Users,
    },
  ];

  return (
    <aside className="w-72 bg-blue-900 text-white min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-10">
        Ambassadors Portal
      </h1>

      <div className="space-y-2">

        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                location.pathname === menu.path
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-blue-800"
              }`}
            >
              <Icon size={20} />
              {menu.name}
            </Link>
          );
        })}

      </div>

      <button className="flex items-center gap-3 mt-20 text-red-300 hover:text-red-500">
        <LogOut size={20} />
        Logout
      </button>

    </aside>
  );
}