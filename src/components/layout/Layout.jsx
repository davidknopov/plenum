import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/new', label: 'New Analysis', icon: '🔍' },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#faf9f6' }}>
      {/* Mobile header */}
      <header className="lg:hidden p-4 flex items-center justify-between sticky top-0 z-50" style={{ background: '#1A4D2E', color: '#faf9f6' }}>
        <h1 className="text-xl font-bold">
          <span style={{ color: '#A3B859' }}>P</span>lenum
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-xl hover:opacity-80"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden fixed top-14 left-0 right-0 z-40"
            style={{ background: '#1A4D2E' }}
          >
            <nav className="p-4">
              {navItems.map(({ to, label, icon }) => (
                <NavLink
                  key={to} to={to} end={to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                      isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
                    }`
                  }
                >
                  <span>{icon}</span>
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <aside className="hidden lg:flex w-64 flex-col fixed h-screen" style={{ background: '#1A4D2E', color: '#faf9f6' }}>
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <h1 className="text-2xl font-bold tracking-tight">
              <span style={{ color: '#A3B859' }}>P</span>lenum
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Spatial Intelligence Platform</p>
          </div>
          <nav className="flex-1 p-4">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
                  }`
                }
              >
                <span>{icon}</span>
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
