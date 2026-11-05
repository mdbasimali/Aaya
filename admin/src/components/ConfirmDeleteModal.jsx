import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';

const ConfirmDeleteModal = ({ isOpen, item, onClose, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const itemId = item._id || item.id;
  const isVideo = item.mediaType === 'video';

  const handleDelete = async () => {
    if (deleting) return;
    setError('');
    setDeleting(true);

    try {
      await api.delete(`/admin/gallery/${itemId}`);
      onSuccess('Media deleted permanently.');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (!err?.response) {
        setError('Network error. Unable to reach server.');
      } else {
        setError(msg || 'Unable to delete media. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 text-center space-y-4">
          {/* Warning Icon */}
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle size={28} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#1e3a5f]">
              Permanent Delete
            </h2>
            <p className="text-slate-700 text-sm font-semibold mt-1.5">
              Are you sure you want to permanently delete this media?
            </p>
            <p className="text-rose-600 text-xs font-medium mt-1">
              This action cannot be undone.
            </p>
          </div>

          {/* Small thumbnail preview */}
          <div className="w-40 h-24 mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
            {isVideo ? (
              <video
                src={item.mediaUrl}
                poster={item.thumbnailUrl || undefined}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt="Delete preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
