import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  HeartHandshake,
  CalendarCheck,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { servicesData } from '../data/servicesData';

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];

  if (!service) {
    return (
      <div className="py-20 px-4 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-950 mb-4">Service Not Found</h2>
        <p className="text-slate-600 mb-6">The service you are looking for does not exist.</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-950 text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      {/* ── Top Header / Breadcrumb & Service Hero ── */}
      <section className="relative bg-gradient-to-b from-pink-50/60 via-white to-slate-50/40 py-10 sm:py-14 lg:py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Services link */}
          <div className="mb-6">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-pink-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to All Services</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Info & CTA */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 text-xs font-semibold uppercase tracking-wider w-fit mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                {service.category} · {service.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950 leading-tight mb-4">
                {service.title}
              </h1>

              <p className="text-lg sm:text-xl font-medium text-pink-700 leading-relaxed mb-6">
                {service.tagline}
              </p>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
                {service.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book This Service
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-sm sm:text-base font-semibold transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  Request Callback
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Service Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-auto object-contain block select-none"
                  loading="eager"
                />
              </div>

              {/* Quick Trust Badges below image */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-800 block">Verified Care</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-5 h-5 text-blue-950 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-800 block">24/7 Support</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <HeartHandshake className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-800 block">Trained Staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Detailed Care Inclusions ── */}
      <section className="py-14 sm:py-18 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-950 text-xs font-semibold uppercase tracking-wider mb-3">
              Comprehensive Support
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-950 tracking-tight">
              What This Service Includes
            </h2>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              Our experienced caregivers take care of every essential daily need with kindness and attentiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {service.keyPoints.map((item, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-950 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Why Choose Us For This Care ── */}
      <section className="py-14 sm:py-18 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              The Reeyansh Advantage
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-950 mb-6">
              Why Families Rely On Our {service.title}
            </h3>

            <div className="space-y-4">
              {service.whyChoose.map((point, index) => (
                <div key={index} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base font-medium">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-blue-950">Have Special Care Requirements?</div>
                <div className="text-xs text-slate-500">We customize daily routines according to doctor guidance.</div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-950 hover:bg-blue-900 text-white text-xs sm:text-sm font-semibold transition-all"
              >
                Talk to a Care Coordinator
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Call to Action Banner ── */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 sm:p-12 text-center shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Ready to Book {service.title}?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Get compassionate, verified, and dependable care at home. Book today or reach out to our team for custom shift arrangements.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book Now
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  Contact Us
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-transparent hover:bg-white/5 text-slate-300 hover:text-white text-sm font-semibold transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
