import { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import BookingModal from './components/BookingModal';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Booking from './pages/Booking';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  /* Session flag — once auto-shown (or dismissed), don't auto-show again
     this visit. Lives only in memory, so a page refresh resets it. */
  const autoShownRef = useRef(false);

  /* ── Auto-popup: show after 5 seconds, once per session ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autoShownRef.current) {
        setIsBookingOpen(true);
        autoShownRef.current = true;
      }
    }, 5000);
    return () => clearTimeout(timer); // cleanup on unmount
  }, []); // runs once on mount

  function openBooking() {
    autoShownRef.current = true; // prevents duplicate auto-popup
    setIsBookingOpen(true);
  }

  function closeBooking() {
    setIsBookingOpen(false);
    // autoShownRef stays true → no re-trigger this session
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar onOpenBooking={openBooking} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/book" element={<Booking />} />
        </Routes>
      </main>
      <Footer />
      <FloatingButtons />
      <BookingModal isOpen={isBookingOpen} onClose={closeBooking} />
    </div>
  );
}

