import { useEffect } from 'react';
import { X, Play } from 'lucide-react';

export default function MediaLightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [item, onClose]);

  if (!item) return null;

  const isVideo = item.mediaType === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Card — stopPropagation so clicking inside doesn't close */}
      <div
        className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <X size={24} />
        </button>

        {/* Media Container */}
        <div className="w-full max-h-[82vh] overflow-hidden rounded-2xl bg-black shadow-2xl flex items-center justify-center border border-white/10">
          {isVideo ? (
            <video
              src={item.mediaUrl}
              poster={item.thumbnailUrl || undefined}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={item.mediaUrl}
              alt="Gallery moment"
              className="w-full max-h-[80vh] object-contain select-none rounded-2xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}
