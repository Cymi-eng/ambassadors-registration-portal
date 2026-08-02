import { Users, UserPlus, Home, LogOut } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6">

        <h1 className="text-2xl font-bold mb-10">
          Ambassadors Portal
        </h1>

        <nav className="space-y-4">

          <a
            href="/dashboard"
            className="flex items-center gap-3 hover:text-yellow-300"
          >
            <Home size={20} />
            Dashboard
          </a>

          <a
            href="/register-member"
            className="flex items-center gap-3 hover:text-yellow-300"
          >
            <Users size={20} />
            Register Member
          </a>

          <a
            href="/register-visitor"
            className="flex items-center gap-3 hover:text-yellow-300"
          >
            <UserPlus size={20} />
            Register Visitor
          </a>

          <a
            href="/"
            className="flex items-center gap-3 hover:text-red-300"
          >
            <LogOut size={20} />
            Logout
          </a>

        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">

        <h2 className="text-3xl font-bold text-blue-900">
          Dashboard
        </h2>

        <p className="text-gray-500 mt-2">
          Welcome to the Ambassadors Registration Portal
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Members</h3>
            <p className="text-4xl font-bold mt-3">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Visitors</h3>
            <p className="text-4xl font-bold mt-3">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Today's Members</h3>
            <p className="text-4xl font-bold mt-3">0</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500">Today's Visitors</h3>
            <p className="text-4xl font-bold mt-3">0</p>
          </div>

        </div>

      </main>

    </div>
  );
}