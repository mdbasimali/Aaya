import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, HeartHandshake, Clock, UserCheck } from 'lucide-react';
import aboutImage from '../assets/about-care.jpg';

const HIGHLIGHTS = [
  {
    icon: UserCheck,
    title: 'Trained Caregivers',
    desc: 'Experienced in elderly, newborn & maternal care',
  },
  {
    icon: ShieldCheck,
    title: 'Verified & Safe',
    desc: 'Thorough background checks & strict hygiene',
  },
  {
    icon: HeartHandshake,
    title: 'Compassionate Support',
    desc: 'Respectful companionship & personal attention',
  },
  {
    icon: Clock,
    title: '24x7 Assistance',
    desc: 'Flexible shifts for day, night, or full-time care',
  },
];

export default function AboutSection() {
  return (
    <section className="w-full bg-slate-50/60 py-14 sm:py-18 lg:py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT: Text & Highlights */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/70 text-pink-600 text-xs font-semibold uppercase tracking-wider w-fit mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              About Us
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950 leading-tight mb-6">
              Caring Hands,{' '}
              <span className="text-pink-600 relative inline-block">
                Trusted Support
              </span>
            </h2>

            {/* Content Paragraphs */}
            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
              <p>
                Based in Rampurhat (Birbhum, West Bengal), at <strong className="text-slate-900 font-semibold">Reeyansh Aya Care</strong>, we provide reliable and compassionate home care support for elderly seniors, newborn babies, pregnant mothers, and growing children.
              </p>
              <p>
                Our trained caregivers assist with daily personal care, hygiene, mobility, medication reminders, meal support, and attentive companionship. We focus on delivering safe, respectful, and dignified in-home caregiving tailored to every family's routine.
              </p>
              <p className="font-medium text-slate-800 border-l-4 border-pink-500 pl-4 py-1.5 bg-white rounded-r-lg shadow-xs">
                Our goal is simple — to provide families in Rampurhat and across West Bengal complete peace of mind.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              {HIGHLIGHTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-xs"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-blue-900" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-950 text-white text-sm font-medium hover:bg-blue-900 active:bg-blue-950 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-950 group"
              >
                Learn More
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>

          {/* RIGHT: Complete Uncropped Care Image */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-none rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-white transition-all duration-300">
              <img
                src={aboutImage}
                alt="Reeyansh Aya Care - Compassionate in-home elderly care in Rampurhat West Bengal"
                className="w-full h-auto object-contain rounded-2xl md:rounded-3xl block select-none"
                loading="lazy"
                decoding="async"
                width="1600"
                height="1066"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
