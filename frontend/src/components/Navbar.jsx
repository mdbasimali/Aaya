import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us', end: false },
  { to: '/services', label: 'Our Services', end: false },
  { to: '/gallery', label: 'Gallery', end: false },
  { to: '/contact', label: 'Contact Us', end: false },
  { to: '/feedback', label: 'Feedback', end: false },
];

export default function Navbar({ onOpenBooking }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Subtle shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-sm border-b border-slate-100' : 'border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LEFT: Official Reeyansh AYA CARE Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-lg py-1"
              aria-label="Reeyansh AYA CARE Home"
            >
              <img
                src={logoImg}
                alt="Reeyansh Aya Care Logo - Home Care Services in Rampurhat"
                className="h-11 sm:h-13 w-auto object-contain select-none"
                width="180"
                height="52"
                decoding="async"
              />
            </Link>
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center space-x-7 lg:space-x-9"
            aria-label="Primary Navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-150 relative py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded ${
                    isActive
                      ? 'text-blue-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-950 after:rounded-full'
                      : 'text-slate-600 hover:text-blue-950'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT: Book Now CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              id="navbar-book-now"
              onClick={onOpenBooking}
              className="inline-flex items-center justify-center px-3.5 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2.5 rounded-lg bg-blue-950 text-white text-xs sm:text-sm font-medium hover:bg-blue-900 active:bg-blue-950 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-900 cursor-pointer whitespace-nowrap"
            >
              Book Now
            </button>

            {/* MOBILE: Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="flex md:hidden p-2 rounded-lg text-slate-700 hover:text-blue-950 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-3"
        >
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-950 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-950'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
