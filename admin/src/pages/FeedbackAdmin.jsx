import { useState, useEffect, useCallback } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Check,
  EyeOff,
} from 'lucide-react';
import api from '../services/api';

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Toast
  const [notification, setNotification] = useState(null);

  // Delete modal
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/feedback?status=${statusFilter}&limit=100`);
      if (res.data?.success) {
        setFeedbacks(res.data.data || []);
      }
    } catch (err) {
      if (!err?.response) {
        setError('Network error. Failed to reach server.');
      } else {
        setError(err?.response?.data?.message || 'Failed to load feedbacks.');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Approve or Hide Feedback
  const handleToggleApproval = async (id, currentApproval) => {
    const nextApproval = !currentApproval;
    setActionLoadingId(id);

    try {
      const res = await api.put(`/admin/feedback/${id}/status`, {
        isApproved: nextApproval,
      });

      if (res.data?.success) {
        showToast(nextApproval ? 'Feedback approved.' : 'Feedback hidden.', 'success');
        if (statusFilter !== 'all') {
          fetchFeedbacks();
        } else {
          setFeedbacks((prev) =>
            prev.map((item) =>
              (item._id || item.id) === id ? { ...item, isApproved: nextApproval } : item
            )
          );
        }
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanent Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem || isDeleting) return;
    const id = deletingItem._id || deletingItem.id;
    setIsDeleting(true);

    try {
      const res = await api.delete(`/admin/feedback/${id}`);
      if (res.data?.success) {
        showToast('Feedback deleted permanently.', 'success');
        setDeletingItem(null);
        fetchFeedbacks();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to delete feedback.', 'error');
    } finally {
      setIsDeleting(false);
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Customer Feedback</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve, hide, or delete customer ratings and reviews
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'approved', label: 'Approved' },
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
            onClick={fetchFeedbacks}
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
          <p className="text-sm font-medium text-slate-600">Loading feedbacks...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#e91e8c] flex items-center justify-center mx-auto mb-4 border border-pink-100">
            <Clock size={30} />
          </div>
          <h3 className="text-lg font-bold text-[#1e3a5f]">No feedbacks found.</h3>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter === 'pending'
              ? 'No pending feedbacks to review.'
              : statusFilter === 'approved'
              ? 'No approved feedbacks currently public.'
              : 'Customer feedbacks will appear here once submitted.'}
          </p>
        </div>
      ) : (
        /* Feedback Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedbacks.map((item) => {
            const itemId = item._id || item.id;
            const isActing = actionLoadingId === itemId;

            return (
              <div
                key={itemId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Stars + Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.isApproved ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>Pending</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Feedback Message */}
                  <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
                    "{item.message}"
                  </p>
                </div>

                <div>
                  {/* Customer Name & Date */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>

                  {/* Actions: Approve/Hide, Delete */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {item.isApproved ? (
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(itemId, true)}
                        disabled={isActing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isActing ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <EyeOff size={13} />
                        )}
                        <span>Hide</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(itemId, false)}
                        disabled={isActing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isActing ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        <span>Approve</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      title="Permanently Delete"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <AlertTriangle size={28} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#1e3a5f]">
                  Delete Feedback
                </h2>
                <p className="text-slate-700 text-sm font-semibold mt-1.5">
                  Are you sure you want to permanently delete this feedback?
                </p>
                <p className="text-rose-600 text-xs font-medium mt-1">
                  This action cannot be undone.
                </p>
              </div>

              {/* Preview of item */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                <p className="font-bold text-slate-800">{deletingItem.name}</p>
                <p className="text-slate-600 line-clamp-2 italic">
                  "{deletingItem.message}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
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
      )}
    </div>
  );
}
