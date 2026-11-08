import SEO from '../components/SEO';
import { createBreadcrumbSchema } from '../data/seoSchemas';
import { Link } from 'react-router-dom';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  PhoneCall,
  CalendarCheck,
} from 'lucide-react';

import elderlyFemaleImg from '../assets/hero/elderly-care-female.jpg';
import elderlyMaleImg from '../assets/hero/elderly-care-male.jpg';
import pregnantWomanImg from '../assets/hero/pregnant-woman-care.jpg';
import newbornBabyImg from '../assets/hero/newborn-baby-care.jpg';
import childCareImg from '../assets/hero/child-care.jpg';

const SERVICES = [
  {
    id: 'old-woman-care',
    title: 'Old Woman Care',
    category: 'Senior Care',
    image: elderlyFemaleImg,
    description:
      'Compassionate and reliable care for elderly women, including daily assistance, personal care, mobility support, medication reminders, meal support, companionship, and general household assistance.',
    features: [
      'Daily Assistance & Personal Care',
      'Mobility Support & Companionship',
      'Medication Reminders & Meal Support',
    ],
  },
  {
    id: 'old-man-care',
    title: 'Old Man Care',
    category: 'Senior Care',
    image: elderlyMaleImg,
    description:
      'Respectful and dependable care for elderly men, including personal assistance, mobility support, medication reminders, meal support, companionship, and daily living assistance.',
    features: [
      'Personal Care & Grooming',
      'Mobility & Doctor Appointments',
      'Nutritious Meals & 24/7 Support',
    ],
  },
  {
    id: 'pregnancy-woman-care',
    title: 'Pregnancy Woman Care',
    category: 'Maternity Care',
    image: pregnantWomanImg,
    description:
      'Professional support for pregnant women, including pregnancy care assistance, nutrition and diet support, regular health monitoring, preparation for delivery, postnatal support, and daily assistance.',
    features: [
      'Pregnancy Care & Daily Assistance',
      'Nutrition & Diet Support',
      'Delivery Prep & Postnatal Care',
    ],
  },
  {
    id: 'newborn-baby-care',
    title: 'Newborn Baby Care',
    category: 'Infant Care',
    image: newbornBabyImg,
    description:
      'Gentle and reliable care for newborn babies, including newborn care assistance, feeding support, bathing and hygiene, sleep support, growth monitoring, umbilical cord care, and 24/7 support.',
    features: [
      'Feeding & Sleep Support',
      'Bathing, Hygiene & Cord Care',
      'Growth Monitoring & 24/7 Assistance',
    ],
  },
  {
    id: 'child-care',
    title: 'Child Care (2 to 7 Years)',
    category: 'Child Care',
    image: childCareImg,
    description:
      'Safe, nurturing, and engaging care for children aged 2 to 7 years, including day care routines, early play-learning activities, homework support, and nutritious meals.',
    features: [
      'Day Care (2 to 7 Years)',
      'Play & Learn Activities',
      'Nutritious Meals & Hygiene',
    ],
  },
];

export default function Services() {
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
  ]);

  return (
    <div className="bg-white text-slate-900">
      <SEO
        title="Our Caregiver Services in Rampurhat & West Bengal | Reeyansh Aya Care"
        description="Explore our 5 verified caregiver services in Rampurhat, WB: Old Woman Care, Old Man Care, Pregnancy Woman Care, Newborn Baby Care, and Child Care (2 to 7 Years)."
        canonical="/services"
        keywords="Aya Care Services in Rampurhat, Home Care Services in Rampurhat, Elderly Care Services in Rampurhat, Old Woman Care in Rampurhat, Old Man Care in Rampurhat, Newborn Baby Care in Rampurhat, Pregnancy Woman Care in Rampurhat, Child Care Services in Rampurhat, Caregiver Services in West Bengal"
        schema={breadcrumbs}
      />

      {/* ── Page Header / Hero ── */}
      <section className="bg-gradient-to-b from-pink-50/60 via-white to-slate-50/40 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
            Our Services
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950 mb-4">
            Aya &amp; Home Caregiver Services in Rampurhat &amp; West Bengal
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed">
            Personalized, trustworthy, and respectful in-home aya support across Rampurhat, Birbhum, and West Bengal — from senior elderly care to newborn and pregnancy assistance.
          </p>
        </div>
      </section>

      {/* ── 5 Main Services Grid ── */}
      <section className="py-14 sm:py-18 lg:py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive Layout: 5 on XL/Desktop, 3 on Tablet, 2 on Small Tablet, 1 on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                {/* Card Image */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={`${service.title} - Reeyansh Aya Care Services in Rampurhat West Bengal`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="240"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-blue-950 shadow-sm border border-slate-100">
                    {service.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-blue-950 mb-2.5 group-hover:text-pink-600 transition-colors">
                      {service.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-2 mb-6 border-t border-slate-100 text-xs text-slate-700">
                      {service.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      to={`/services/${service.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all group/btn"
                    >
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Indicators Strip ── */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-blue-950 text-base mb-1">
                Verified & Background-Checked
              </h4>
              <p className="text-xs text-slate-600">
                All caregivers undergo strict background verification and identity checks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-blue-950 text-base mb-1">
                24/7 Availability & Flexibility
              </h4>
              <p className="text-xs text-slate-600">
                Round-the-clock service options tailored to your family's schedule and shift needs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-blue-950 text-base mb-1">
                Respectful & Compassionate Care
              </h4>
              <p className="text-xs text-slate-600">
                Trained to provide personal care with dignity, patience, and warmth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ── */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 sm:p-12 text-center shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Need Help Choosing the Right Care?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Our care coordinators are here to assist you in selecting the ideal caregiver for your loved ones. Contact us today for personalized guidance.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  Contact Us
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book a Caregiver
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
