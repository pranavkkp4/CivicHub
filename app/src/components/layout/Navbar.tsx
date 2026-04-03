import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  Layers,
  Menu,
  MessageSquare,
  TrendingDown,
  X,
} from 'lucide-react';

import CivicHubMark from './CivicHubMark';

const educationLinks = [
  { path: '/education', label: 'Overview', icon: BookOpen },
  { path: '/education/materials', label: 'Materials', icon: FileText },
  { path: '/education/flashcards', label: 'Flashcards', icon: Layers },
  { path: '/education/mock-tests', label: 'Tests', icon: ClipboardList },
  { path: '/education/weak-topics', label: 'Review', icon: TrendingDown },
  { path: '/education/interview', label: 'Interview', icon: MessageSquare },
  { path: '/education/digit-recognizer', label: 'ML Demo', icon: Brain },
];

export default function Navbar() {
  const location = useLocation();
  const navRailRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const closeMenu = () => setIsMobileMenuOpen(false);

  const isLinkActive = (path: string) => {
    if (path === '/education') {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 28);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncIndicator = () => {
      const activeLink = educationLinks.find((link) => isLinkActive(link.path));
      const activeNode = activeLink ? linkRefs.current[activeLink.path] : null;
      const railNode = navRailRef.current;

      if (!activeNode || !railNode) {
        setActiveIndicator((current) => ({ ...current, opacity: 0 }));
        return;
      }

      const linkBox = activeNode.getBoundingClientRect();
      const railBox = railNode.getBoundingClientRect();
      setActiveIndicator({
        left: linkBox.left - railBox.left,
        width: linkBox.width,
        opacity: 1,
      });
    };

    const frame = window.requestAnimationFrame(syncIndicator);
    window.addEventListener('resize', syncIndicator);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', syncIndicator);
    };
  }, [location.pathname]);

  const shellTone = isScrolled
    ? 'border-kaleo-border bg-[rgba(13,13,18,0.9)] shadow-[0_32px_80px_-44px_rgba(0,0,0,0.86)]'
    : 'border-kaleo-border/80 bg-[rgba(22,24,33,0.76)] shadow-[0_26px_70px_-42px_rgba(0,0,0,0.78)]';

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <div className={`mx-auto max-w-7xl rounded-full backdrop-blur-2xl transition-all duration-300 ${shellTone}`}>
        <div className="relative overflow-hidden rounded-full border border-inherit">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_30%,rgba(255,255,255,0.05)_70%,transparent)]" />
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-4">
            <Link to="/education" className="shrink-0" onClick={closeMenu}>
              <CivicHubMark theme="dark" compact />
            </Link>

            <div
              ref={navRailRef}
              className="relative hidden items-center gap-1.5 rounded-full border border-kaleo-border/70 bg-[rgba(255,255,255,0.03)] px-1.5 py-1.5 lg:flex"
            >
              <span
                className="pointer-events-none absolute inset-y-1.5 left-0 rounded-full bg-[linear-gradient(135deg,rgba(139,92,246,0.98),rgba(255,107,107,0.92),rgba(245,158,11,0.82))] shadow-[0_18px_36px_-20px_rgba(139,92,246,0.9)] transition-[transform,width,opacity] duration-300 ease-smooth"
                style={{
                  width: `${activeIndicator.width}px`,
                  opacity: activeIndicator.opacity,
                  transform: `translateX(${activeIndicator.left}px)`,
                }}
              />

              {educationLinks.map((link) => {
                const isActive = isLinkActive(link.path);

                return (
                  <Link
                    key={link.path}
                    ref={(node) => {
                      linkRefs.current[link.path] = node;
                    }}
                    to={link.path}
                    onClick={closeMenu}
                    className={`relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-300 ease-out ${
                      isActive
                        ? 'text-kaleo-text'
                        : 'text-kaleo-muted hover:text-kaleo-text'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-kaleo-border/70 bg-white/[0.04] text-kaleo-muted transition duration-300 ease-out hover:border-kaleo-primary/35 hover:bg-white/[0.08] hover:text-kaleo-text lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMobileMenuOpen ? (
            <div className="border-t border-kaleo-border/60 px-3 pb-3 pt-2 lg:hidden">
              <div className="grid gap-2 rounded-[1.6rem] bg-[rgba(22,24,33,0.96)] p-2 backdrop-blur-md">
                {educationLinks.map((link) => {
                  const isActive = isLinkActive(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[linear-gradient(135deg,rgba(139,92,246,0.98),rgba(255,107,107,0.92),rgba(245,158,11,0.8))] text-kaleo-text shadow-[0_16px_28px_-18px_rgba(139,92,246,0.78)]'
                          : 'text-kaleo-muted hover:bg-white/[0.06] hover:text-kaleo-text'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
