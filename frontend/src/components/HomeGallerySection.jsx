import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Images } from 'lucide-react';
import api from '../services/api';
import MediaCard from './MediaCard';
import MediaLightbox from './MediaLightbox';

export default function HomeGallerySection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeGallery = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get('/gallery?page=1&limit=6');
        if (isMounted && res.data?.success) {
          setItems(res.data.data || []);
        }
      } catch {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHomeGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-white py-14 sm:py-18 lg:py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/70 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              GALLERY
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-950">
              Moments of Care and Compassion
            </h2>
          </div>

          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors group self-start md:self-auto"
          >
            <span>View Full Gallery</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Content Area */}
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="w-full aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : error ? (
          /* Error Fallback */
          <div className="py-12 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-lg mx-auto">
            <p className="text-sm font-medium text-slate-600">
              Gallery is temporarily unavailable. Please try again later.
            </p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3">
              <Images size={24} />
            </div>
            <p className="text-slate-600 text-sm font-medium">
              Gallery moments will appear here soon.
            </p>
          </div>
        ) : (
          /* Media Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <MediaCard
                key={item._id || item.id}
                item={item}
                onClick={setSelectedMedia}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA on mobile/tablet */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold shadow-xs transition-colors w-full"
          >
            <span>View Full Gallery</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      <MediaLightbox
        item={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </section>
  );
}
