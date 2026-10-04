import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadPage from "./pages/LeadPage";
import { useAuthStore } from "./store/authStore";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);

  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Trang đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard */}
      <Route
        path="/:role/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* S2-11 - Tạm bỏ PrivateRoute để test */}
      <Route path="/leads" element={<LeadPage />} />

      {/* URL không tồn tại */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}