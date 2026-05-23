import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

export function RoleRoute({ children, roles }) {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role || decoded.roles || decoded.authorities;
    const hasRole = roles.some(r =>
      Array.isArray(userRole) ? userRole.includes(r) : userRole === r
    );
    return hasRole ? children : <Navigate to="/dashboard" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
