import { useEffect, useRef, useState } from 'react';
import { X, MessageCircle, AlertCircle } from 'lucide-react';
import bookingBg from '../assets/booking-bg.jpg';

/* ── Constants ── */
const WA_NUMBER = '919046585943';

const SERVICES = [
  'Old Woman Care',
  'Old Man Care',
  'Pregnancy Woman Care',
  'Newborn Baby Care',
  'Child Care (2 to 7 Years)',
];

const TIME_SLOTS = [
  'Morning (6 AM – 10 AM)',
  'Forenoon (10 AM – 1 PM)',
  'Afternoon (1 PM – 4 PM)',
  'Evening (4 PM – 8 PM)',
  'Night (8 PM – 6 AM)',
  'Full Day (24 Hours)',
];

const EMPTY = {
  name: '', phone: '', service: '', startDate: '',
  days: '', time: '', address: '', requirements: '',
};

/* ── Helpers ── */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function validatePhone(raw) {
  return /^(?:91)?[6-9]\d{9}$/.test(raw.replace(/[\s\-().+]/g, ''));
}

function buildWAMessage(f) {
  return encodeURIComponent(
    `Hello Reeyansh Aya Care,\n\nI would like to book a care service.\n\n` +
    `Name: ${f.name}\nPhone: ${f.phone}\nService: ${f.service}\n` +
    `Start Date: ${f.startDate}\nDuration: ${f.days} day(s)\n` +
    `Preferred Time: ${f.time}\nAddress: ${f.address}\n` +
    (f.requirements ? `Requirements: ${f.requirements}\n` : '') +
    `\nPlease confirm availability. Thank you!`
  );
}

/* ── WhatsApp SVG icon ── */
function WAIcon({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.467-2.003A15.928 15.928 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.771-1.851l-.485-.29-5.025 1.188 1.22-4.896-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.28-9.907c-.398-.2-2.355-1.163-2.72-1.295-.366-.133-.632-.2-.898.2-.266.398-1.031 1.295-1.264 1.561-.232.266-.465.3-.864.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.055-1.984-2.357-2.217-2.755-.232-.398-.025-.613.175-.812.18-.178.398-.465.598-.697.199-.232.265-.398.398-.664.133-.265.066-.498-.034-.697-.1-.2-.898-2.165-1.23-2.963-.324-.779-.655-.674-.898-.686l-.765-.013c-.266 0-.697.1-1.063.498-.366.398-1.396 1.363-1.396 3.326 0 1.963 1.43 3.861 1.629 4.127.2.265 2.813 4.295 6.817 6.025.953.411 1.696.657 2.274.842.956.304 1.826.261 2.514.158.767-.114 2.355-.963 2.688-1.894.333-.93.333-1.728.232-1.894-.099-.165-.365-.265-.764-.465z"/>
    </svg>
  );
}

/* ── Field error ── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />{msg}
    </p>
  );
}

/* ── Label ── */
function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

/* ═══════════════════════════════════════════════
   BOOKING MODAL
═══════════════════════════════════════════════ */
export default function BookingModal({ isOpen, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const backdropRef = useRef(null);

  /* Body scroll lock + form reset */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) { setForm(EMPTY); setErrors({}); }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Escape key close */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ── Handlers ── */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Full name required (min 2 characters).';
    if (!form.phone.trim() || !validatePhone(form.phone))
      e.phone = 'Valid 10-digit Indian mobile number required.';
    if (!form.service) e.service = 'Please select a service.';
    if (!form.startDate) e.startDate = 'Please choose a start date.';
    if (!form.days || Number(form.days) < 1) e.days = 'At least 1 day required.';
    if (!form.time) e.time = 'Please select a time slot.';
    if (!form.address.trim() || form.address.trim().length < 5)
      e.address = 'Full address required.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const msg = buildWAMessage({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      requirements: form.requirements.trim(),
    });
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
    onClose();
  }

  /* Close on backdrop click only */
  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  const base = 'w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all duration-150';
  const ok = 'border-slate-200 focus:ring-blue-950/20 focus:border-blue-900';
  const err = 'border-red-400 focus:ring-red-200';

  return (
    /* ══ BACKDROP — plain dark overlay over the normal website ══ */
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-3 py-4 sm:px-5 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bm-title"
    >
      {/* ══ MODAL — healthcare image is the modal's own background ══ */}
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '94vh' }}
      >
        {/* Image layer — clipped inside modal border-radius */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${bookingBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Navy gradient overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(7,15,50,0.70) 0%, rgba(6,14,46,0.76) 40%, rgba(5,12,40,0.93) 100%)',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close booking form"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors duration-150 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ══ SCROLLABLE CONTENT AREA ══ */}
        <div className="relative z-10 overflow-y-auto flex-1">

          {/* ── HERO: heading + CTA floats over the image ── */}
          <div className="px-6 sm:px-10 pt-9 pb-7 text-center">
            {/* WhatsApp pill */}
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-500/90 hover:bg-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 transition-colors duration-150"
            >
              <WAIcon className="w-3.5 h-3.5" />
              Connect Instantly — WhatsApp Now
            </a>

            <h2
              id="bm-title"
              className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase leading-tight mb-2"
            >
              Book Our Care
            </h2>
            <p className="text-sm text-blue-200/90 max-w-md mx-auto leading-relaxed">
              Tell us your care requirements and we'll connect with you on WhatsApp to confirm availability.
            </p>
          </div>

          {/* ── WHITE FORM CARD — sits below the heading, still inside modal ── */}
          <div className="mx-4 sm:mx-8 mb-7 bg-white rounded-2xl shadow-2xl">
            <div className="px-5 sm:px-8 py-6">
              <form id="bm-form" onSubmit={handleSubmit} noValidate>

                {/* Row 1: Full Name | Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="bm-name">Full Name <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <input id="bm-name" name="name" type="text" autoComplete="name"
                      value={form.name} onChange={handleChange} placeholder="e.g. Ravi Kumar"
                      className={`${base} ${errors.name ? err : ok}`} />
                    <FieldError msg={errors.name} />
                  </div>
                  <div>
                    <Label htmlFor="bm-phone">Phone Number <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <input id="bm-phone" name="phone" type="tel" autoComplete="tel"
                      value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210"
                      className={`${base} ${errors.phone ? err : ok}`} />
                    <FieldError msg={errors.phone} />
                  </div>
                </div>

                {/* Row 2: Select Service | Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="bm-service">Select Service <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <select id="bm-service" name="service"
                      value={form.service} onChange={handleChange}
                      className={`${base} ${errors.service ? err : ok}`}>
                      <option value="">— Choose a service —</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <FieldError msg={errors.service} />
                  </div>
                  <div>
                    <Label htmlFor="bm-date">Start Date <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <input id="bm-date" name="startDate" type="date"
                      min={todayISO()} value={form.startDate} onChange={handleChange}
                      className={`${base} ${errors.startDate ? err : ok}`} />
                    <FieldError msg={errors.startDate} />
                  </div>
                </div>

                {/* Row 3: How Many Days | Preferred Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="bm-days">How Many Days <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <input id="bm-days" name="days" type="number" min="1" step="1"
                      value={form.days} onChange={handleChange} placeholder="e.g. 7"
                      className={`${base} ${errors.days ? err : ok}`} />
                    <FieldError msg={errors.days} />
                  </div>
                  <div>
                    <Label htmlFor="bm-time">Preferred Time <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <select id="bm-time" name="time"
                      value={form.time} onChange={handleChange}
                      className={`${base} ${errors.time ? err : ok}`}>
                      <option value="">— Choose a time slot —</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <FieldError msg={errors.time} />
                  </div>
                </div>

                {/* Row 4: Full Address | Care Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="bm-address">Full Address <span className="text-pink-500 normal-case font-bold">*</span></Label>
                    <textarea id="bm-address" name="address" rows={3}
                      value={form.address} onChange={handleChange}
                      placeholder="House no., Street, City, State"
                      className={`${base} resize-none ${errors.address ? err : ok}`} />
                    <FieldError msg={errors.address} />
                  </div>
                  <div>
                    <Label htmlFor="bm-req">
                      Care Requirements{' '}
                      <span className="text-slate-400 normal-case font-normal">(optional)</span>
                    </Label>
                    <textarea id="bm-req" name="requirements" rows={3}
                      value={form.requirements} onChange={handleChange}
                      placeholder="Any specific needs, medical conditions, etc."
                      className={`${base} resize-none ${ok}`} />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="booking-modal-submit"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-sm tracking-wide transition-colors duration-150 shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  Book Now on WhatsApp
                </button>
                <p className="text-center text-xs text-slate-400 mt-2.5">
                  Opens WhatsApp with your booking details pre-filled.
                </p>

              </form>
            </div>
          </div>{/* end form card */}

        </div>{/* end scrollable content */}
      </div>{/* end modal */}
    </div>/* end backdrop */
  );
}
