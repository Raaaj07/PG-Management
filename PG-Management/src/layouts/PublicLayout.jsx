import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';
import { PageTransition } from '../components/ui/PageTransition';
import { Menu, X, Sun, Moon, Home, Users, Mail, Compass } from 'lucide-react';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [pgName, setPgName] = useState('Elite Residency PG');

  useEffect(() => {
    const fetchHostelName = async () => {
      try {
        const response = await client.get('/hostels');
        if (response.data.data && response.data.data.length > 0) {
          setPgName(response.data.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load hostel name:', err);
      }
    };
    fetchHostelName();
  }, []);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Amenities', path: '/features', icon: Compass },
    { name: 'About PG', path: '/about', icon: Users },
    { name: 'Contact Us', path: '/contact', icon: Mail },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student': return '/tenant';
      default: return '/hostel-admin';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20">
                H
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                {pgName}
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400'
                        : 'text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={getDashboardLink()}
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-4 py-2 text-sm font-semibold text-slate-650 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 transition-all"
                  >
                    Apply for Admission
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
            >
            <div className="py-4 px-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                    isActive(link.path)
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400'
                      : 'text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <div className="border-t border-slate-200 dark:border-slate-800 my-4 pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={handleNavClick}
                    className="w-full text-center py-2.5 rounded-lg bg-indigo-600 text-white font-semibold shadow-md"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      handleNavClick();
                    }}
                    className="w-full text-center py-2.5 rounded-lg border border-slate-350 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className="w-full text-center py-2.5 rounded-lg border border-slate-350 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavClick}
                    className="w-full text-center py-2.5 rounded-lg bg-indigo-600 text-white font-semibold shadow-md"
                  >
                    Apply for Admission
                  </Link>
                </>
              )}
            </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-955 border-t border-slate-200 dark:border-slate-850/80 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  H
                </div>
                <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {pgName}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                A premium and fully managed PG residency providing secure, clean, and healthy co-living spaces for students and working professionals.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase mb-4">Explore</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/features" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Amenities & Gallery</Link></li>
                <li><Link to="/about" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">About our PG</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/contact" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Inquiries & Admissions</Link></li>
                <li className="text-xs mt-1 text-slate-400 dark:text-slate-500">Phone: +91 99999 88888</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-slate-550 dark:text-slate-450">
            &copy; {new Date().getFullYear()} {pgName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
