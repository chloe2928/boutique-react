import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

// Comme ProtectedRoute, mais réservée à l'admin
export default function AdminRoute() {
  const { estConnecte, estAdmin, chargement } = useAuth();

  if (chargement) {
    return <p>Chargement...</p>;
  }

  if (!estConnecte) {
    return <Navigate to="/login" replace />;
  }

  // Un client connecté n'a pas accès à /admin
  if (!estAdmin) {
    return <Navigate to="/catalogue" replace />;
  }

  return <Outlet />;
}
