import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  CalendarDays,
  Star,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, to: '/dashboard',  label: 'Dashboard' },
  { icon: BookOpen,        to: '/leituras',   label: 'Minhas Leituras' },
  { icon: ShoppingBag,     to: '/mercado',    label: 'Mercado Livre' },
  { icon: CalendarDays,    to: '/eventos',    label: 'Eventos' },
  { icon: Star,            to: '/pontos',     label: 'Pontos e Desafios' },
  { icon: User,            to: '/perfil',     label: 'Perfil' },
];

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
        {navItems.map(({ icon: Icon, to, label }) => (
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
            {/* Tooltip */}
            <span className="absolute left-14 bg-espresso text-cream text-xs font-body px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg">
              {label}
            </span>
          </NavLink>
        ))}
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
