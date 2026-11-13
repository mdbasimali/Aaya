import { useState, useEffect } from 'react';
import { X, User, Phone, CreditCard, Hash, MapPin, Calendar, Users, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const INITIAL_FORM = {
  name: '',
  address: '',
  mobileNumber: '',
  aadhaarNumber: '',
  staffId: '',
  age: '',
  gender: 'Female',
};

export default function StaffModal({ isOpen, onClose, onSuccess, initialStaff = null }) {
  const isEdit = Boolean(initialStaff);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialStaff) {
      setFormData({
        name: initialStaff.name || '',
        address: initialStaff.address || '',
        mobileNumber: initialStaff.mobileNumber || '',
        aadhaarNumber: initialStaff.aadhaarMasked || '',
        staffId: initialStaff.staffId || '',
        age: initialStaff.age ? String(initialStaff.age) : '',
        gender: initialStaff.gender || 'Female',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
    setServerError('');
  }, [initialStaff, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Full address must be at least 5 characters.';
    }

    const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number (e.g. 9832109876).';
    }

    // Aadhaar validation
    const cleanAadhaar = formData.aadhaarNumber.replace(/[\s-]/g, '');
    if (!isEdit) {
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        newErrors.aadhaarNumber = 'Aadhaar card number must be exactly 12 numeric digits.';
      }
    } else {
      // In edit mode: if changed from masked, must be 12 digits
      const isMasked = cleanAadhaar.includes('X') || cleanAadhaar.includes('*');
      if (!isMasked && cleanAadhaar.length > 0 && !/^\d{12}$/.test(cleanAadhaar)) {
        newErrors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number or leave unchanged.';
      }
    }

    if (!formData.staffId.trim() || formData.staffId.trim().length < 2) {
      newErrors.staffId = 'Staff ID is required (min 2 characters, e.g. STF-01).';
    }

    const numAge = parseInt(formData.age, 10);
    if (!formData.age || Number.isNaN(numAge) || numAge < 18 || numAge > 100) {
      newErrors.age = 'Age must be between 18 and 100 years.';
    }

    if (!['Male', 'Female', 'Other'].includes(formData.gender)) {
      newErrors.gender = 'Please select a valid gender.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'staffId') {
      formattedValue = value.toUpperCase();
    } else if (name === 'mobileNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadhaarNumber') {
      // Allow user to type digits, strip anything else unless it's the edit mask
      if (!isEdit || !value.includes('X')) {
        formattedValue = value.replace(/\D/g, '').slice(0, 12);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        staffId: formData.staffId.trim().toUpperCase(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
      };

      const cleanAadhaar = formData.aadhaarNumber.replace(/[\s-]/g, '');
      if (!isEdit || (!cleanAadhaar.includes('X') && !cleanAadhaar.includes('*'))) {
        payload.aadhaarNumber = cleanAadhaar;
      }

      if (isEdit) {
        const id = initialStaff._id || initialStaff.id;
        const res = await api.put(`/admin/staff/${id}`, payload);
        if (res.data?.success) {
          onSuccess(res.data.message || 'Staff details updated successfully.');
          onClose();
        }
      } else {
        const res = await api.post('/admin/staff', payload);
        if (res.data?.success) {
          onSuccess(res.data.message || 'New staff member added successfully.');
          onClose();
        }
      }
    } catch (err) {
      if (!err?.response) {
        setServerError('Network error. Unable to reach backend server.');
      } else {
        setServerError(err.response?.data?.message || 'Operation failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update caregiver or staff profile details' : 'Register a new aya or caregiver into the system'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User size={14} className="text-slate-400" />
                Full Name <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Kalyani Das"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-all ${
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Staff ID */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Hash size={14} className="text-slate-400" />
                Unique Staff ID <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                placeholder="e.g. STF-01"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden transition-all ${
                  errors.staffId
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                }`}
              />
              {errors.staffId && <p className="text-xs text-rose-500">{errors.staffId}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                Mobile Number <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-medium">+91</span>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="9832109876"
                  className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-all ${
                    errors.mobileNumber
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                  }`}
                />
              </div>
              {errors.mobileNumber && <p className="text-xs text-rose-500">{errors.mobileNumber}</p>}
            </div>

            {/* Aadhaar Card Number */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-slate-400" />
                  Aadhaar Card Number <span className="text-pink-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Encrypted (AES-256)</span>
              </div>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder={isEdit ? 'Leave unchanged or type new 12-digit number' : '12-digit number (e.g. 123456789012)'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden transition-all ${
                  errors.aadhaarNumber
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                }`}
              />
              {errors.aadhaarNumber ? (
                <p className="text-xs text-rose-500">{errors.aadhaarNumber}</p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  {isEdit
                    ? 'Current Aadhaar is masked. To update, enter a new 12-digit number.'
                    : 'Securely encrypted in database. Only the last 4 digits are displayed in dashboard.'}
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Age (Years) <span className="text-pink-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 35"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-all ${
                  errors.age
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                }`}
              />
              {errors.age && <p className="text-xs text-rose-500">{errors.age}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                Gender <span className="text-pink-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-rose-500">{errors.gender}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                Full Address <span className="text-pink-500">*</span>
              </label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Bharsala, Near BLRO Office, Rampurhat, Birbhum, West Bengal"
                className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-hidden transition-all resize-none ${
                  errors.address
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                }`}
              />
              {errors.address && <p className="text-xs text-rose-500">{errors.address}</p>}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>{isEdit ? 'Save Changes' : 'Add Staff Member'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

