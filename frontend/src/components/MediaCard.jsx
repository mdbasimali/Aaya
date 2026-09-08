import { useState } from 'react';
import { Play, ImageOff, VideoOff, Maximize2 } from 'lucide-react';

export default function MediaCard({ item, onClick }) {
  const [hasError, setHasError] = useState(false);

  const isVideo = item.mediaType === 'video';

  if (hasError) {
    return (
      <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
        {isVideo ? <VideoOff size={28} className="mb-2 text-slate-300" /> : <ImageOff size={28} className="mb-2 text-slate-300" />}
        <p className="text-xs font-medium text-slate-500">
          {isVideo ? 'Video unavailable' : 'Image unavailable'}
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      aria-label="View media"
    >
      {isVideo ? (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
          <video
            src={item.mediaUrl}
            poster={item.thumbnailUrl || undefined}
            preload="metadata"
            muted
            playsInline
            onError={() => setHasError(true)}
            className="w-full h-full object-contain pointer-events-none"
          />
          {/* Play Badge Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-pink-600 text-[#1e3a5f] group-hover:text-white flex items-center justify-center shadow-md transition-all duration-300 transform group-hover:scale-110">
              <Play size={20} className="ml-0.5 fill-current" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-50">
          <img
            src={item.mediaUrl}
            alt="Gallery moment"
            loading="lazy"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover sm:object-contain group-hover:scale-105 transition-transform duration-500"
          />
          {/* Expand icon on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
            <div className="w-10 h-10 rounded-full bg-white/90 text-[#1e3a5f] flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform">
              <Maximize2 size={18} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
