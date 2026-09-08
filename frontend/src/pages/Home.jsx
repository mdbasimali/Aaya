import HeroCarousel from '../components/HeroCarousel';
import AboutSection from '../components/AboutSection';
import BenefitsSection from '../components/BenefitsSection';
import HomeServicesSection from '../components/HomeServicesSection';
import HomeGallerySection from '../components/HomeGallerySection';
import HomeFeedbackSection from '../components/HomeFeedbackSection';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <AboutSection />
      <BenefitsSection />
      <HomeServicesSection />
      <HomeGallerySection />
      <HomeFeedbackSection />
    </>
  );
}
