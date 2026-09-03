import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import elderlyFemaleImg from '../assets/hero/elderly-care-female.jpg';
import elderlyMaleImg from '../assets/hero/elderly-care-male.jpg';
import pregnantWomanImg from '../assets/hero/pregnant-woman-care.jpg';
import newbornBabyImg from '../assets/hero/newborn-baby-care.jpg';

const SHORT_SERVICES = [
  {
    id: 'old-woman-care',
    title: 'Old Woman Care',
    image: elderlyFemaleImg,
    description: 'Compassionate daily care and personal assistance for elderly women.',
  },
  {
    id: 'old-man-care',
    title: 'Old Man Care',
    image: elderlyMaleImg,
    description: 'Reliable support, personal care and companionship for elderly men.',
  },
  {
    id: 'pregnancy-woman-care',
    title: 'Pregnancy Woman Care',
    image: pregnantWomanImg,
    description: 'Gentle support, daily assistance and care throughout pregnancy.',
  },
  {
    id: 'newborn-baby-care',
    title: 'Newborn Baby Care',
    image: newbornBabyImg,
    description: 'Safe and loving care, feeding support and assistance for newborn babies.',
  },
];

export default function HomeServicesSection() {
  return (
    <section className="w-full bg-white py-14 sm:py-18 lg:py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
            Our Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-950 mb-3">
            Care That Fits Your Family’s Needs
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore our specialized home-care services tailored for your loved ones at every stage of life.
          </p>
        </div>

        {/* 4 Compact Service Cards (4 on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {SHORT_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Compact Card Image */}
              <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 select-none"
                  loading="lazy"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-950 mb-2 group-hover:text-pink-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>
                </div>

                {/* Learn More Action Button */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={`/services/${service.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all group/btn"
                  >
                    Learn More
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Services Link */}
        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors group"
          >
            <span>View All Detailed Services</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
