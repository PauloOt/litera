import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './routes/PrivateRoute';
import { RoleRoute } from './routes/RoleRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Leituras from './pages/Leituras';
import Mercado from './pages/Mercado';
import Eventos from './pages/Eventos';
import EventoDetalhe from './pages/EventoDetalhe';
import MeusIngressos from './pages/MeusIngressos';
import Pontos from './pages/Pontos';
import Perfil from './pages/Perfil';
import Planos from './pages/Planos';
import Organizador from './pages/Organizador';
import Admin from './pages/Admin';
import LivroDetalhe from './pages/LivroDetalhe';
import PagamentoSucesso from './pages/PagamentoSucesso';
import PagamentoCancelado from './pages/PagamentoCancelado';

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
      <Route path="/leituras"       element={<PrivateRoute><Leituras /></PrivateRoute>} />
      <Route path="/mercado"       element={<PrivateRoute><Mercado /></PrivateRoute>} />
      <Route path="/livros/:id"    element={<PrivateRoute><LivroDetalhe /></PrivateRoute>} />
      <Route path="/eventos"          element={<PrivateRoute><Eventos /></PrivateRoute>} />
      <Route path="/eventos/:id"       element={<PrivateRoute><EventoDetalhe /></PrivateRoute>} />
      <Route path="/pontos"         element={<PrivateRoute><Pontos /></PrivateRoute>} />
      <Route path="/perfil"         element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/planos"         element={<PrivateRoute><Planos /></PrivateRoute>} />
      <Route path="/meus-ingressos"    element={<PrivateRoute><MeusIngressos /></PrivateRoute>} />
      <Route path="/pagamento/sucesso"  element={<PrivateRoute><PagamentoSucesso /></PrivateRoute>} />
      <Route path="/pagamento/cancelado" element={<PrivateRoute><PagamentoCancelado /></PrivateRoute>} />

      {/* Admin / Organizador */}
      <Route path="/admin" element={
        <RoleRoute roles={['ROLE_ADMIN']}>
          <Admin />
        </RoleRoute>
      } />
      <Route path="/organizador" element={
        <RoleRoute roles={['ROLE_ORGANIZADOR', 'ROLE_ADMIN']}>
          <Organizador />
        </RoleRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
