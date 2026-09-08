import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Heart,
  ArrowRight,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Our Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/book', label: 'Book Now' },
];

const SERVICES = [
  { label: 'Old Woman Care',           to: '/services/old-woman-care' },
  { label: 'Old Man Care',             to: '/services/old-man-care' },
  { label: 'Pregnancy Woman Care',     to: '/services/pregnancy-woman-care' },
  { label: 'Newborn Baby Care',        to: '/services/newborn-baby-care' },
  { label: 'Child Care (2 to 7 Years)', to: '/services/child-care' },
];

const WHATSAPP_NUMBER = '919046585943';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hello Reeyansh Aya Care, I would like to enquire about your services.'
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* ── TOP WAVE DIVIDER ── */}
      <div className="overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 56"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
          style={{ height: '40px' }}
        >
          <path
            d="M0,0 C360,56 1080,0 1440,40 L1440,0 L0,0 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* ── MAIN FOOTER BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── COL 1: BRAND ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logoImg}
                alt="Reeyansh Aya Care"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-5">
              Compassionate and reliable home-care support for families, elderly
              people, mothers, newborn babies and children.
            </p>

            {/* ── SOCIAL / CONTACT BADGES ── */}
            <div className="flex gap-3 flex-wrap">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="mailto:reeyanshayacare@gmail.com"
                aria-label="Send Email"
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>

          {/* ── COL 2: QUICK LINKS ── */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-1.5 text-sm text-slate-400 hover:text-pink-400 transition-colors duration-150"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COL 3: SERVICES ── */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.label}>
                  <Link
                    to={service.to}
                    className="group flex items-center gap-1.5 text-sm text-slate-400 hover:text-pink-400 transition-colors duration-150"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COL 4: CONTACT INFO ── */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {/* Email */}
              <li>
                <a
                  href="mailto:reeyanshayacare@gmail.com"
                  className="flex items-start gap-3 group"
                >
                  <span className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 group-hover:bg-blue-700 transition-colors duration-200">
                    <Mail className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors duration-200" />
                  </span>
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors duration-150 break-all">
                    reeyanshayacare@gmail.com
                  </span>
                </a>
              </li>

              {/* Phone */}
              <li>
                <a
                  href="tel:+919046585943"
                  className="flex items-start gap-3 group"
                >
                  <span className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 group-hover:bg-pink-600 transition-colors duration-200">
                    <Phone className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors duration-200" />
                  </span>
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors duration-150">
                    +91 90465 85943
                  </span>
                </a>
              </li>

              {/* WhatsApp */}
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <span className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 group-hover:bg-green-600 transition-colors duration-200">
                    <MessageCircle className="w-4 h-4 text-green-400 group-hover:text-white transition-colors duration-200" />
                  </span>
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors duration-150">
                    WhatsApp: +91 90465 85943
                  </span>
                </a>
              </li>

              {/* Address */}
              <li>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </span>
                  <span className="text-sm text-slate-400 leading-relaxed">
                    Rampurhat Bharsala near BLRO OFFICE
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="mt-12 border-t border-slate-700/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            &copy; {currentYear} Reeyansh Aya Care. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            Made with{' '}
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for
            compassionate care
          </p>
        </div>
      </div>
    </footer>
  );
}
