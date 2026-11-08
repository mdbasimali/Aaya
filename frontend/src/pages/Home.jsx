import SEO from '../components/SEO';
import HeroCarousel from '../components/HeroCarousel';
import AboutSection from '../components/AboutSection';
import BenefitsSection from '../components/BenefitsSection';
import HomeServicesSection from '../components/HomeServicesSection';
import HomeGallerySection from '../components/HomeGallerySection';
import HomeFeedbackSection from '../components/HomeFeedbackSection';
import { localBusinessSchema, websiteSchema } from '../data/seoSchemas';

export default function Home() {
  return (
    <>
      <SEO
        title="Aaya Care & Home Caregiver Services in Rampurhat | Reeyansh Aya Care"
        description="Trusted Aya care and home care services in Rampurhat, West Bengal. Experienced caregivers for elderly old woman care, old man care, pregnancy woman care, newborn baby care, and child care (2 to 7 years)."
        canonical="/"
        keywords="Aya Care Services in Rampurhat, Home Care Services in Rampurhat, Elderly Care Services in Rampurhat, Old Woman Care in Rampurhat, Old Man Care in Rampurhat, Newborn Baby Care in Rampurhat, Pregnancy Woman Care in Rampurhat, Child Care Services in Rampurhat, Caregiver Services in Rampurhat, Home Caregiver in Rampurhat, Aya Care Services in West Bengal, Home Care Services in West Bengal, Elderly Care Services in India, Caregiver Services in India"
        schema={{
          '@context': 'https://schema.org',
          '@graph': [localBusinessSchema, websiteSchema],
        }}
      />
      <HeroCarousel />
      <AboutSection />
      <BenefitsSection />
      <HomeServicesSection />
      <HomeGallerySection />
      <HomeFeedbackSection />
    </>
  );
}
