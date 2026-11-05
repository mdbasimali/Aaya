import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, ImagePlus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import GalleryCard from '../components/GalleryCard';
import UploadModal from '../components/UploadModal';
import EditMediaModal from '../components/EditMediaModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Toast / Notification State
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/gallery?status=${statusFilter}&limit=100`);
      if (response.data?.success) {
        setItems(response.data.data || []);
      }
    } catch (err) {
      if (!err?.response) {
        setError('Network error. Failed to reach server.');
      } else {
        setError(err?.response?.data?.message || 'Failed to load gallery items.');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleToggleStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/gallery/${id}`, { isActive: newStatus });
      showToast('Status updated successfully.', 'success');
      // If we are currently filtered by active/inactive, refetch so list reflects status
      if (statusFilter !== 'all') {
        fetchGallery();
      } else {
        // Optimistically update the item in local state
        setItems((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, isActive: newStatus } : item
          )
        );
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Gallery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your images and videos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2a4f80] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white text-sm font-semibold rounded-xl shadow-xs transition-all duration-200 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchGallery}
            className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline text-xs cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 size={32} className="animate-spin text-[#e91e8c]" />
          <p className="text-sm font-medium text-slate-600">Loading gallery...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#e91e8c] flex items-center justify-center mx-auto mb-4 border border-pink-100">
            <ImagePlus size={30} />
          </div>
          <h3 className="text-lg font-bold text-[#1e3a5f]">No gallery media yet.</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Upload your first image or video.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2a4f80] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Upload Media</span>
          </button>
        </div>
      ) : (
        /* Gallery Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <GalleryCard
              key={item._id || item.id}
              item={item}
              onEdit={(target) => setEditingItem(target)}
              onDelete={(target) => setDeletingItem(target)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchGallery();
        }}
      />

      {/* Edit / Replace Modal */}
      <EditMediaModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchGallery();
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingItem)}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchGallery();
        }}
      />
    </div>
  );
};

export default Gallery;
