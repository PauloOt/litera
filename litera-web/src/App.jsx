import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './routes/PrivateRoute';
import { RoleRoute } from './routes/RoleRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';

const Placeholder = ({ nome }) => (
  <div className="flex items-center justify-center h-screen">
    <p className="font-display text-2xl text-walnut">{nome} — em breve</p>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Autenticadas */}
      <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/leituras"       element={<PrivateRoute><Placeholder nome="Leituras" /></PrivateRoute>} />
      <Route path="/mercado"        element={<PrivateRoute><Placeholder nome="Mercado" /></PrivateRoute>} />
      <Route path="/eventos"        element={<PrivateRoute><Placeholder nome="Eventos" /></PrivateRoute>} />
      <Route path="/eventos/:id"    element={<PrivateRoute><Placeholder nome="Evento Detalhe" /></PrivateRoute>} />
      <Route path="/pontos"         element={<PrivateRoute><Placeholder nome="Pontos" /></PrivateRoute>} />
      <Route path="/perfil"         element={<PrivateRoute><Placeholder nome="Perfil" /></PrivateRoute>} />
      <Route path="/planos"         element={<PrivateRoute><Placeholder nome="Planos" /></PrivateRoute>} />
      <Route path="/meus-ingressos" element={<PrivateRoute><Placeholder nome="Meus Ingressos" /></PrivateRoute>} />

      {/* Admin / Organizador */}
      <Route path="/admin" element={
        <RoleRoute roles={['ROLE_ADMIN']}>
          <Placeholder nome="Admin" />
        </RoleRoute>
      } />
      <Route path="/organizador" element={
        <RoleRoute roles={['ROLE_ORGANIZADOR', 'ROLE_ADMIN']}>
          <Placeholder nome="Organizador" />
        </RoleRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
