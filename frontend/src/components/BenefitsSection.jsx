import {
  UserCheck,
  Clock,
  HeartHandshake,
  ShieldCheck,
  BadgeCheck,
  Award,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: UserCheck,
    title: 'Trained Caregivers',
    desc: 'Skilled and trained caregivers who provide safe and compassionate support.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    desc: 'Reliable care and assistance whenever your family needs it.',
  },
  {
    icon: HeartHandshake,
    title: 'Personalized Care',
    desc: 'Care plans designed around the individual needs and comfort of every client.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Hygienic Care',
    desc: 'Clean, safe and hygienic care with a strong focus on health and well-being.',
  },
  {
    icon: BadgeCheck,
    title: 'Trusted & Verified Staff',
    desc: 'Verified and dependable caregivers you can feel confident about.',
  },
  {
    icon: Award,
    title: 'Affordable & Reliable',
    desc: 'Quality care at affordable rates with dependable service and support.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="w-full bg-slate-50/70 py-16 sm:py-20 lg:py-24 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/70 border border-pink-200 text-pink-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-600"></span>
            Our Benefits
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950 mb-4">
            Why Families Trust Reeyansh Aya Care
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            We are dedicated to providing compassionate, safe, and dependable in-home care that gives your family complete peace of mind.
          </p>
        </div>

        {/* 6 Benefit Cards Grid (3 per row on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Icon Container with subtle pink accent */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center mb-6 shadow-xs">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-blue-950 mb-3 group-hover:text-pink-600 transition-colors duration-200">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
