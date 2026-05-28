import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  CalendarDays,
  Star,
  User,
  LogOut,
  CalendarPlus,
  Shield,
  Ticket,
  Crown,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const baseNavItems = [
  { icon: LayoutDashboard, to: '/dashboard',   label: 'Dashboard' },
  { icon: BookOpen,        to: '/leituras',    label: 'Minhas Leituras' },
  { icon: ShoppingBag,     to: '/mercado',     label: 'Livros' },
  { icon: CalendarDays,    to: '/eventos',     label: 'Eventos' },
  { icon: Ticket,          to: '/meus-ingressos', label: 'Meus Ingressos' },
  { icon: Star,            to: '/pontos',      label: 'Pontos e Desafios' },
  { icon: Crown,           to: '/planos',      label: 'Planos' },
  { icon: Receipt,         to: '/pagamentos/historico', label: 'Pagamentos' },
  { icon: User,            to: '/perfil',      label: 'Perfil' },
];

const organizadorItem = { icon: CalendarPlus, to: '/organizador', label: 'Meus Eventos' };
const adminItem = { icon: Shield, to: '/admin', label: 'Painel Admin' };

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [inadimplente, setInadimplente] = useState(false);

  const isOrganizador = user?.perfil === 'ROLE_ORGANIZADOR' || user?.perfil === 'ROLE_ADMIN';
  const isAdmin = user?.perfil === 'ROLE_ADMIN';
  const navItems = [
    ...baseNavItems,
    ...(isOrganizador ? [organizadorItem] : []),
    ...(isAdmin ? [adminItem] : []),
  ];

  useEffect(() => {
    let cancelado = false;
    api.get('/perfil')
      .then(({ data }) => {
        if (!cancelado) setInadimplente(data?.statusAssinatura === 'INADIMPLENTE');
      })
      .catch(() => {});
    return () => { cancelado = true; };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] bg-espresso flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div
        className="mb-6 text-cream font-display font-bold text-lg leading-none text-center select-none"
      >
        L
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ icon: Icon, to, label }) => {
          const mostrarBadge = inadimplente && to === '/pagamentos/historico';
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-200 ` +
                (isActive
                  ? 'bg-bark text-stone'
                  : 'text-walnut hover:text-stone')
              }
            >
              <Icon size={22} />
              {mostrarBadge && (
                <span
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-espresso"
                  aria-label="Pagamento pendente"
                />
              )}
              {/* Tooltip */}
              <span className="absolute left-14 bg-espresso text-cream text-xs font-body px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg">
                {label}{mostrarBadge ? ' — inadimplente' : ''}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center w-11 h-11 rounded-full text-walnut hover:text-red-400 transition-colors duration-200 group relative"
      >
        <LogOut size={22} />
        <span className="absolute left-14 bg-espresso text-cream text-xs font-body px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg">
          Sair
        </span>
      </button>
    </aside>
  );
}
