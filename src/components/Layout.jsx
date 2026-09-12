// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Listings', end: true },
  { to: '/rentals', label: 'Rentals' },
  { to: '/projects', label: 'Projects' },
  { to: '/favourites', label: 'Saved' },
  { to: '/insights', label: 'Insights' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-gray-300">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-serif text-xl text-ink">Ivy Homes</span>
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'text-ink font-medium' : 'text-muted hover:text-ink'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted">{user?.email}</span>
            <button onClick={handleLogout} className="text-slate hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
