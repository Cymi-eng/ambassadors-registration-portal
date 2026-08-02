import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import AdminDashboard from "./AdminDashboard";
import SecretaryDashboard from "./SecretaryDashboard";

export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) return <Loader />;

  return role === "admin" ? <AdminDashboard /> : <SecretaryDashboard />;
}