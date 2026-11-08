import SEO from '../components/SEO';
import { createBreadcrumbSchema } from '../data/seoSchemas';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  ShieldCheck,
  Sparkles,
  Clock,
  Target,
  Eye,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import aboutImage from '../assets/about-care.jpg';

const WHY_CHOOSE_US = [
  {
    icon: UserCheck,
    title: 'Trained & Caring Caregivers',
    desc: 'Our caregivers are trained to provide professional assistance with patience, kindness, and respect.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Reliable Care',
    desc: 'We focus on safety, hygiene, comfort, and dependable support for every family.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Support',
    desc: 'Every person has different needs, so our care is provided according to individual requirements.',
  },
  {
    icon: Clock,
    title: '24/7 Assistance',
    desc: 'Families can depend on us for support whenever they need assistance.',
  },
];

export default function About() {
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ]);

  return (
    <div className="bg-white text-slate-900">
      <SEO
        title="About Reeyansh Aya Care | Trusted Caregiver Agency in Rampurhat, WB"
        description="Learn about Reeyansh Aya Care, Rampurhat's premier home care provider. Verified, compassionate caregivers supporting families across Rampurhat, Birbhum, and West Bengal."
        canonical="/about"
        keywords="About Reeyansh Aya Care, Caregiver Agency in Rampurhat, Home Care Services in Rampurhat, Aya Centre in Rampurhat, Caregiver Services in West Bengal, Home Care Agency Birbhum, Verified Aya Care West Bengal"
        schema={breadcrumbs}
      />

      {/* ── Section 1: Hero / Overview ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pink-50/50 via-white to-slate-50/40 py-12 sm:py-16 lg:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 text-xs font-semibold uppercase tracking-wider w-fit mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
                About Us
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950 leading-tight mb-6">
                Caring Hands.{' '}
                <span className="text-pink-600">Trusted Support.</span>
                <br className="hidden sm:inline" /> In Rampurhat &amp; West Bengal.
              </h1>

              <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
                <p>
                  Located in <strong className="text-blue-950 font-semibold">Rampurhat Bharsala (near BLRO Office, Birbhum, West Bengal)</strong>, <strong className="text-blue-950 font-semibold">Reeyansh Aya Care</strong> provides trusted, background-verified, and compassionate in-home caregiver support for elderly seniors, newborn babies, expectant mothers, and growing children.
                </p>
                <p>
                  Whether serving local households right here in Rampurhat or assisting families with regional home-care needs across Birbhum and West Bengal, our caregivers assist with daily routines, mobility, hygiene, medication tracking, and warm companionship.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow group"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-sm sm:text-base font-semibold transition-all"
                >
                  Book Caregiver
                </Link>
              </div>
            </div>

            {/* Right: Caregiver Image Card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                <div className="absolute -inset-2 bg-gradient-to-tr from-pink-200/50 to-blue-200/50 rounded-3xl blur-md -z-10 transform -rotate-1"></div>
                <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-white">
                  <img
                    src={aboutImage}
                    alt="Reeyansh Aya Care - Verified caregivers supporting seniors and families in Rampurhat West Bengal"
                    className="w-full h-auto object-contain block select-none"
                    loading="eager"
                    decoding="async"
                    width="1600"
                    height="1066"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Mission & Vision ── */}
      <section className="py-14 sm:py-18 lg:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-950 text-xs font-semibold uppercase tracking-wider mb-3">
              Purpose & Direction
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-950 tracking-tight">
              Guided by Empathy and Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Mission Card */}
            <div className="p-8 sm:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-50/70 via-white to-white border border-pink-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center mb-6 shadow-sm">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-950 mb-4 tracking-tight">
                  OUR MISSION
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Our mission is to provide safe, compassionate, and reliable home-care support that makes everyday life easier for families. We believe that quality care is not only about assistance, but also about kindness, respect, patience, and understanding.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-pink-100/80 flex items-center gap-2 text-pink-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                Kindness · Respect · Patience · Understanding
              </div>
            </div>

            {/* Vision Card */}
            <div className="p-8 sm:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-white border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center mb-6 shadow-sm">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-950 mb-4 tracking-tight">
                  OUR VISION
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Our vision is to become a trusted and dependable home-care service that families can rely on whenever they need professional and compassionate support at home.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-100/80 flex items-center gap-2 text-blue-950 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-900" />
                Reliable · Dependable · Professional at Home
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Why Choose Us ── */}
      <section className="py-14 sm:py-18 lg:py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-3">
              Why Choose Us
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-950 tracking-tight">
              Trusted Care Tailored to Your Needs
            </h2>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              We focus on dependable assistance and complete peace of mind for every family member.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-950 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Our Commitment Banner ── */}
      <section className="py-14 sm:py-18 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-pink-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                Our Commitment
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-6">
                Dedicated to Dignity, Compassion, and Respect
              </h2>

              <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-8">
                At Reeyansh Aya Care, we are committed to treating every person with dignity, compassion, and respect. Whether it is pregnancy care, newborn support, or elderly care, our goal is to provide dependable assistance and create a safe and comfortable environment for every family.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm sm:text-base font-semibold shadow-md transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  Contact Us Today
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm sm:text-base font-semibold transition-all"
                >
                  View Our Services
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
