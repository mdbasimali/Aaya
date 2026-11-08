import { useState } from 'react';
import SEO from '../components/SEO';
import { createBreadcrumbSchema } from '../data/seoSchemas';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ExternalLink,
} from 'lucide-react';

const WA_NUMBER = '919046585943';
const WA_ENQUIRY = encodeURIComponent(
  'Hello Reeyansh Aya Care, I would like to know more about your home-care services.'
);

/* ── Validation helpers ── */
function validatePhone(raw) {
  const cleaned = raw.replace(/[\s\-().+]/g, '');
  return /^(?:91)?[6-9]\d{9}$/.test(cleaned);
}

function buildWAMessage(name, phone, message) {
  return encodeURIComponent(
    `Hello Reeyansh Aya Care,\n\nI would like to contact you.\n\nName: ${name}\nPhone: ${phone}\n\nMessage:\n${message}`
  );
}

/* ── Contact info items ── */
const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'reeyanshayacare@gmail.com',
    href: 'mailto:reeyanshayacare@gmail.com',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hoverBg: 'hover:bg-blue-100',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 90465 85943',
    href: 'tel:+919046585943',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    hoverBg: 'hover:bg-pink-100',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 90465 85943',
    href: `https://wa.me/${WA_NUMBER}?text=${WA_ENQUIRY}`,
    color: 'text-green-600',
    bg: 'bg-green-50',
    hoverBg: 'hover:bg-green-100',
    external: true,
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Rampurhat Bharsala near BLRO OFFICE',
    href: null,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    hoverBg: '',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    } else if (form.name.trim().length > 100) {
      errs.name = 'Name must be under 100 characters.';
    }

    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!validatePhone(form.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (!form.message.trim()) {
      errs.message = 'Message is required.';
    } else if (form.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters.';
    } else if (form.message.trim().length > 1000) {
      errs.message = 'Message must be under 1000 characters.';
    }

    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const msg = buildWAMessage(form.name.trim(), form.phone.trim(), form.message.trim());
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
    setForm({ name: '', phone: '', message: '' });
  }

  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Contact Reeyansh Aya Care Rampurhat | Phone, WhatsApp & Address"
        description="Contact Reeyansh Aya Care in Rampurhat Bharsala near BLRO Office, West Bengal. Call or WhatsApp +91 90465 85943 for trusted elderly, infant, pregnancy, and child care."
        canonical="/contact"
        keywords="Contact Reeyansh Aya Care, Rampurhat Aya Care phone number, Reeyansh Aya Care address, Aya service WhatsApp Rampurhat, Home care agency Rampurhat Birbhum"
        schema={breadcrumbs}
      />

      {/* ── HERO HEADER ── */}
      <section className="bg-blue-950 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-pink-300 mb-3">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Contact Reeyansh Aya Care in Rampurhat
          </h1>
          <p className="text-blue-200 text-base sm:text-lg leading-relaxed">
            We're here to help. Reach out to our Rampurhat center for trusted home caregiver services across Birbhum and West Bengal.
          </p>
        </div>
      </section>

      {/* ── QUICK ACTION BUTTONS ── */}
      <section className="bg-white border-b border-slate-100 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          <a
            href="tel:+919046585943"
            id="contact-call-now"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-sm font-medium hover:bg-pink-100 transition-colors duration-150"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${WA_ENQUIRY}`}
            id="contact-whatsapp-quick"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-sm font-medium hover:bg-green-100 transition-colors duration-150"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <a
            href="mailto:reeyanshayacare@gmail.com"
            id="contact-email-quick"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium hover:bg-blue-100 transition-colors duration-150"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </a>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── LEFT: CONTACT INFO ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Contact Information</h2>
              <p className="text-sm text-slate-500">
                Reach us through any of the channels below.
              </p>
            </div>

            {CONTACT_ITEMS.map((item) => {
              const Icon = item.icon;
              const inner = (
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-colors duration-150 ${
                    item.href ? item.hoverBg + ' cursor-pointer' : ''
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${item.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
                      {item.label}
                    </p>
                    <p className={`text-sm font-medium break-words ${item.href ? item.color : 'text-slate-700'}`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              );

              if (!item.href) return <div key={item.label}>{inner}</div>;

              return item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block no-underline"
                >
                  {inner}
                </a>
              ) : (
                <a key={item.label} href={item.href} className="block no-underline">
                  {inner}
                </a>
              );
            })}

            {/* ── WORKING HOURS ── */}
            <div className="mt-2 p-4 rounded-xl bg-blue-950 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-300 mb-2">
                Availability
              </p>
              <p className="text-sm font-medium text-white">Mon – Sun: 8:00 AM – 8:00 PM</p>
              <p className="text-xs text-blue-300 mt-1">
                We respond to WhatsApp messages quickly.
              </p>
            </div>
          </div>

          {/* ── RIGHT: CONTACT FORM ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-0.5">Send Us a Message</h2>
              <p className="text-sm text-slate-500 mb-4">
                Fill in your details and we'll connect on WhatsApp instantly.
              </p>

              {submitted && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">WhatsApp opened!</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Your message has been prepared. Complete the send in WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Full Name <span className="text-pink-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ravi Kumar"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${
                      errors.name
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-200 focus:ring-blue-950/30 focus:border-blue-950'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Phone Number <span className="text-pink-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210 or +91 98765 43210"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${
                      errors.phone
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-200 focus:ring-blue-950/30 focus:border-blue-950'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Message <span className="text-pink-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 resize-none ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-200 focus:ring-blue-950/30 focus:border-blue-950'
                    }`}
                  />
                  <div className="flex items-start justify-between mt-1">
                    {errors.message ? (
                      <p className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {form.message.length}/1000
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="contact-submit"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-semibold text-sm transition-colors duration-150 shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Message on WhatsApp
                </button>

                <p className="text-center text-xs text-slate-400">
                  Clicking the button will open WhatsApp with your message pre-filled.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP SECTION ── */}
      <section className="py-7 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">

          {/* Heading row + Get Directions inline */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-pink-500 mb-0.5">
                Our Location
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Find Us Here</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Rampurhat Bharsala near BLRO OFFICE
              </p>
            </div>
            <a
              id="contact-get-directions"
              href="https://www.google.com/maps/search/?api=1&query=Rampurhat+Bharsala+near+BLRO+OFFICE+Rampurhat+West+Bengal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-semibold transition-colors duration-150 shadow-sm self-start sm:self-auto flex-shrink-0"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Map wrapper */}
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">

            {/* Google Maps iframe */}
            <iframe
              id="contact-map"
              title="Reeyansh Aya Care Location — Rampurhat Bharsala near BLRO OFFICE"
              src="https://maps.google.com/maps?q=Rampurhat+Bharsala+near+BLRO+OFFICE,+Rampurhat,+West+Bengal&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-[300px] sm:h-[380px] lg:h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Branded location overlay — top-left */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-100 px-3 py-2 flex items-center gap-2.5 max-w-[200px] sm:max-w-[240px]">
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-red-50">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">Reeyansh Aya Care</p>
                <p className="text-[10px] text-slate-500 leading-snug break-words">
                  Rampurhat Bharsala near BLRO OFFICE
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

