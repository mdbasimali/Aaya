import { useState } from 'react';
import { Edit2, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const GalleryCard = ({ item, onEdit, onDelete, onToggleStatus }) => {
  const [toggling, setToggling] = useState(false);

  const itemId = item._id || item.id;
  const isVideo = item.mediaType === 'video';

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await onToggleStatus(itemId, !item.isActive);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Media Preview Container */}
      <div className="relative aspect-video bg-slate-900 w-full overflow-hidden flex items-center justify-center">
        {isVideo ? (
          <video
            src={item.mediaUrl}
            poster={item.thumbnailUrl || undefined}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={item.mediaUrl}
            alt="Gallery media"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Status Indicator Badge (Overlay on top-right) */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${
              item.isActive
                ? 'bg-emerald-500/90 text-white'
                : 'bg-slate-700/90 text-slate-200'
            }`}
          >
            {item.isActive ? (
              <>
                <CheckCircle2 size={12} />
                <span>Active</span>
              </>
            ) : (
              <>
                <XCircle size={12} />
                <span>Inactive</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="p-3.5 flex items-center justify-between gap-2 border-t border-slate-100 bg-white mt-auto">
        {/* Active / Inactive Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          title={item.isActive ? 'Set Inactive' : 'Set Active'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
            item.isActive
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {toggling ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <span
              className={`w-2 h-2 rounded-full ${
                item.isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          )}
          <span>{item.isActive ? 'Active' : 'Inactive'}</span>
        </button>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit / Replace Media"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#1e3a5f] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Delete Media"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
