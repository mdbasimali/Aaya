import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function StaffDeleteModal({ isOpen, staff, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !staff) return null;

  const staffId = staff._id || staff.id;

  const handleDelete = async () => {
    if (deleting) return;
    setError('');
    setDeleting(true);

    try {
      const res = await api.delete(`/admin/staff/${staffId}`);
      if (res.data?.success) {
        onSuccess(res.data.message || 'Staff member deleted successfully.');
        onClose();
      }
    } catch (err) {
      if (!err?.response) {
        setError('Network error. Unable to reach server.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete staff member.');
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
            <h2 className="text-lg font-bold text-slate-900">Delete Staff Member</h2>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-800">{staff.name}</strong>{' '}
              (Staff ID: <span className="font-mono text-pink-600 font-semibold">{staff.staffId}</span>)?
            </p>
            <p className="text-xs text-rose-500 mt-2 bg-rose-50/60 py-1.5 px-3 rounded-lg border border-rose-100">
              This action cannot be undone and will remove all associated caregiver records.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-xs hover:shadow-md transition-all disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Delete Record</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

