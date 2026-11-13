import { useState } from 'react';
import {
  X,
  CalendarCheck,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const STATUS_COLORS = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function BookingDetailsModal({
  isOpen,
  booking,
  onClose,
  onOpenAssignModal,
  onStatusUpdated,
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleUpdateStatus = async (newStatus) => {
    if (updating) return;
    setUpdating(true);
    setError('');

    const bookingId = booking._id || booking.id;
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus} by Admin`,
      });
      if (res.data?.success) {
        onStatusUpdated(res.data.message || `Booking status updated to ${newStatus}.`);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setUpdating(false);
    }
  };

  const cleanPhone = String(booking.clientPhone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const staff = booking.assignedStaff || booking.assignedStaffSnapshot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#E90075] flex items-center justify-center font-bold">
              <CalendarCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Order #{booking.bookingId}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={updating}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer Information */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User size={14} className="text-pink-600" />
                Customer Information
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:+91${cleanPhone}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-pink-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                >
                  <Phone size={11} />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${booking.clientName}, regarding your booking #${booking.bookingId} with Reeyansh Aya Care...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                >
                  <MessageCircle size={11} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="text-slate-900 font-bold text-sm">{booking.clientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="text-slate-900 font-mono font-medium">+91 {booking.clientPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Service Requested</span>
                <span className="text-pink-600 font-bold">{booking.service}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Start Date & Duration</span>
                <span className="text-slate-800 font-medium">
                  {booking.startDate} ({booking.durationDays} days)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated End Date</span>
                <span className="text-slate-800 font-medium">{booking.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Preferred Shift / Hours</span>
                <span className="text-slate-800 font-medium">{booking.timeSlot}</span>
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <span className="text-slate-400 block text-[11px]">Full Service Address</span>
                <span className="text-slate-800 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  {booking.address}
                </span>
              </div>
              {booking.requirements && (
                <div className="sm:col-span-2 md:col-span-3 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Special Requirements</span>
                  <p className="text-slate-700 italic mt-0.5">"{booking.requirements}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Assignment Information */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users size={14} className="text-pink-600" />
                Staff Assignment
              </h3>
              {staff && staff.name && ['Approved', 'In Progress'].includes(booking.status) && (
                <button
                  onClick={() => onOpenAssignModal(booking, 'reassign')}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
                >
                  Change Staff
                </button>
              )}
            </div>

            {staff && staff.name ? (
              <div className="p-4 rounded-xl bg-pink-50/40 border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-pink-100 text-[#E90075] flex items-center justify-center font-bold text-base">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{staff.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Staff ID: <strong className="text-slate-700">{staff.staffId}</strong>
                      {staff.gender ? ` • ${staff.gender}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone size={11} className="text-slate-400" />
                      +91 {staff.mobileNumber}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 sm:text-right">
                  <span className="block font-medium text-slate-700">
                    Assigned on {booking.assignmentDate ? new Date(booking.assignmentDate).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    By: {booking.assignedByAdmin?.name || 'Administrator'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-800 text-xs">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                  <div>
                    <strong className="block font-semibold">Caregiver Not Assigned</strong>
                    <span>Staff assignment is mandatory to approve this booking.</span>
                  </div>
                </div>
                {booking.status === 'Pending' && (
                  <button
                    onClick={() => onOpenAssignModal(booking, 'approve')}
                    className="px-3.5 py-1.5 bg-[#E90075] hover:bg-[#d00068] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Select Staff & Approve
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Status & Assignment Timeline History */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History size={14} className="text-slate-500" />
              Activity & Status History
            </h3>

            <div className="space-y-2">
              {booking.statusHistory && booking.statusHistory.length > 0 ? (
                booking.statusHistory.map((h, i) => (
                  <div key={i} className="text-xs flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">{h.status}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.changedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{h.note}</p>
                      <span className="text-[10px] text-slate-400">By: {h.changedBy}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No status history available.</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Actions: Cancel Booking */}
          {['Pending', 'Approved', 'In Progress'].includes(booking.status) ? (
            <button
              onClick={() => handleUpdateStatus('Cancelled')}
              disabled={updating}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          ) : <div />}

          {/* Right Transition Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>

            {/* Pending -> Approve via Staff Assignment */}
            {booking.status === 'Pending' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignModal(booking, 'approve');
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Approve & Assign Staff
              </button>
            )}

            {/* Approved -> In Progress */}
            {booking.status === 'Approved' && (
              <button
                onClick={() => handleUpdateStatus('In Progress')}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {updating && <Loader2 size={14} className="animate-spin" />}
                <span>Start Service (In Progress)</span>
              </button>
            )}

            {/* In Progress -> Completed */}
            {booking.status === 'In Progress' && (
              <button
                onClick={() => handleUpdateStatus('Completed')}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {updating && <Loader2 size={14} className="animate-spin" />}
                <span>Mark as Completed</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

