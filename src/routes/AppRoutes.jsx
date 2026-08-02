import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../auth/Login";
import Dashboard from "../pages/Dashboard";
import RegisterMember from "../pages/RegisterMember";
import RegisterVisitor from "../pages/RegisterVisitor";
import Members from "../pages/Members";
import Visitors from "../pages/Visitors";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Any logged-in user (admin or secretary) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register-member" element={<RegisterMember />} />
        <Route path="/register-visitor" element={<RegisterVisitor />} />
        <Route path="/members" element={<Members />} />
        <Route path="/visitors" element={<Visitors />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}