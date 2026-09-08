import { useState, useEffect } from 'react';
import { Images, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import MediaCard from '../components/MediaCard';
import MediaLightbox from '../components/MediaLightbox';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const fetchGallery = async (pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(false);

    try {
      const res = await api.get(`/gallery?page=${pageNum}&limit=12`);
      if (res.data?.success) {
        const newItems = res.data.data || [];
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setPage(res.data.pagination.page || 1);
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGallery(1, false);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchGallery(page + 1, true);
    }
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/70 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
          OUR GALLERY
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950">
          Moments of Care and Compassion
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          A glimpse into the heartfelt care, happy families, and trusted moments we create every day.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-full aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="py-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-md mx-auto">
          <p className="text-slate-600 text-sm font-medium mb-4">
            Gallery is temporarily unavailable. Please try again later.
          </p>
          <button
            type="button"
            onClick={() => fetchGallery(1, false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-20 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-4 border border-pink-100">
            <Images size={28} />
          </div>
          <h2 className="text-lg font-bold text-blue-950">No gallery moments yet.</h2>
          <p className="text-sm text-slate-500 mt-1">Photos and videos will appear here.</p>
        </div>
      ) : (
        /* Responsive 4-col desktop, 2-col tablet, 1-col mobile Grid */
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <MediaCard
                key={item._id || item.id}
                item={item}
                onClick={setSelectedMedia}
              />
            ))}
          </div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <span>Load More Moments</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox / Media Viewer */}
      <MediaLightbox
        item={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />
    </div>
  );
}
