import { useState, useEffect } from 'react';
import { Star, MessageSquareQuote, Heart } from 'lucide-react';
import api from '../services/api';

export default function HomeFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get('/feedback?page=1&limit=6');
        if (isMounted && res.data?.success) {
          setFeedbacks(res.data.data || []);
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

    fetchFeedbacks();

    return () => {
      isMounted = false;
    };
  }, []);

  // If error, don't crash home page, gracefully return null or simple fallback
  if (error) {
    return null;
  }

  return (
    <section className="w-full bg-slate-50/70 py-14 sm:py-18 lg:py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/70 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-3">
            <Heart size={14} className="fill-current" />
            <span>CUSTOMER FEEDBACK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-950">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Real experiences from families who trust Reeyansh Aya Care.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs animate-pulse space-y-4"
              >
                <div className="w-24 h-4 bg-slate-200 rounded-md" />
                <div className="w-full h-16 bg-slate-100 rounded-md" />
                <div className="w-32 h-4 bg-slate-200 rounded-md" />
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-3">
              <MessageSquareQuote size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Customer reviews will appear here soon.
            </p>
          </div>
        ) : (
          /* Reviews Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={
                          star <= item.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }
                      />
                    ))}
                  </div>

                  {/* Feedback Message */}
                  <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    "{item.message}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-950">{item.name}</span>
                  {item.createdAt && (
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
