import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronDown,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ImpactMark from './ImpactMark';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    closeMenus();
    logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  const showNavbar = isLandingPage || isAuthenticated;

  if (!showNavbar) {
    return null;
  }

  const shellTone =
    isLandingPage && !isScrolled
      ? 'border-white/10 bg-white/10 text-white shadow-[0_28px_60px_-36px_rgba(16,24,39,0.75)]'
      : 'border-kaleo-charcoal/10 bg-[rgba(251,247,240,0.86)] text-kaleo-charcoal shadow-[0_28px_60px_-38px_rgba(16,24,39,0.34)]';
  const navTextTone =
    isLandingPage && !isScrolled
      ? 'text-white/80 hover:text-white hover:bg-white/10'
      : 'text-kaleo-charcoal/60 hover:text-kaleo-charcoal hover:bg-kaleo-charcoal/5';

  const privateLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/education', label: 'Education', icon: BookOpen },
    { path: '/healthcare', label: 'Healthcare', icon: Heart },
    { path: '/sustainability', label: 'Sustainability', icon: Leaf },
    { path: '/accessibility', label: 'Accessibility', icon: Sparkles },
  ];

  const publicLinks = [
    { href: '#overview', label: 'Overview' },
    { href: '#domains', label: 'Domains' },
    { href: '#workflow', label: 'Workflow' },
  ];

  const profileName = user?.first_name || user?.email?.split('@')[0] || 'Profile';

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <div className={`mx-auto max-w-7xl rounded-full border backdrop-blur-xl transition-all duration-300 ${shellTone}`}>
        <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-4">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="shrink-0" onClick={closeMenus}>
            <ImpactMark theme={isLandingPage && !isScrolled ? 'light' : 'dark'} compact />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {isAuthenticated
              ? privateLinks.map((link) => {
                  const isActive =
                    location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMenus}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? isLandingPage && !isScrolled
                            ? 'bg-white/20 text-white'
                            : 'bg-kaleo-charcoal text-white'
                          : navTextTone
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })
              : publicLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenus}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${navTextTone}`}
                  >
                    {link.label}
                  </a>
                ))}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  className={`relative hidden h-11 w-11 items-center justify-center rounded-full transition sm:inline-flex ${navTextTone}`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-kaleo-clay" />
                </Link>

                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsProfileOpen((value) => !value)}
                    className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 transition ${
                      isLandingPage && !isScrolled
                        ? 'border-white/10 bg-white/10 text-white'
                        : 'border-kaleo-charcoal/10 bg-white/70 text-kaleo-charcoal'
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kaleo-charcoal text-white">
                      <User className="h-4 w-4" />
                    </span>
                    <span className="max-w-[8rem] truncate text-sm font-medium">{profileName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isProfileOpen ? (
                    <div className="absolute right-0 mt-3 w-56 rounded-[1.4rem] border border-kaleo-charcoal/10 bg-white/90 p-2 text-kaleo-charcoal shadow-[0_28px_50px_-34px_rgba(16,24,39,0.45)] backdrop-blur-xl">
                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition hover:bg-kaleo-charcoal/5"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/recommendations"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition hover:bg-kaleo-charcoal/5"
                      >
                        <Sparkles className="h-4 w-4" />
                        Recommendations
                      </Link>
                      <div className="my-2 soft-divider" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${navTextTone}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenus}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isLandingPage && !isScrolled
                      ? 'bg-white text-kaleo-charcoal'
                      : 'bg-kaleo-charcoal text-white'
                  }`}
                >
                  Launch Impact OS
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition lg:hidden ${navTextTone}`}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-inherit px-3 pb-3 pt-2 lg:hidden">
            <div className="flex flex-col gap-2 rounded-[1.6rem] bg-white/10 p-2 backdrop-blur-md">
              {isAuthenticated
                ? privateLinks.map((link) => {
                    const isActive =
                      location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);

                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeMenus}
                        className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-kaleo-charcoal text-white'
                            : isLandingPage && !isScrolled
                              ? 'text-white/80 hover:bg-white/10'
                              : 'text-kaleo-charcoal/70 hover:bg-kaleo-charcoal/5'
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })
                : publicLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className={`rounded-[1rem] px-4 py-3 text-sm font-medium transition ${navTextTone}`}
                    >
                      {link.label}
                    </a>
                  ))}

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={closeMenus} className="impact-button-secondary px-4 py-3 text-center text-sm">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={closeMenus} className="impact-button px-4 py-3 text-center text-sm">
                    Launch
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2 pt-2">
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="rounded-[1rem] px-4 py-3 text-sm font-medium text-kaleo-charcoal/70 transition hover:bg-kaleo-charcoal/5"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-[1rem] px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
