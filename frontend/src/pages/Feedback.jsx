import { useState } from 'react';
import { Star, CheckCircle2, AlertCircle, Loader2, Heart } from 'lucide-react';
import api from '../services/api';

export default function Feedback() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend validation
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setErrorMsg('Please enter your full name (2 to 100 characters).');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 5 || trimmedMsg.length > 1000) {
      setErrorMsg('Feedback message must be between 5 and 1000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        rating,
        message: trimmedMsg,
        website: website.trim(), // Honeypot
      };

      const res = await api.post('/feedback', payload);

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Thank you for your feedback!');
        setName('');
        setRating(0);
        setHoverRating(0);
        setMessage('');
        setWebsite('');
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (!err?.response) {
        setErrorMsg('Network error. Unable to reach server. Please try again.');
      } else {
        setErrorMsg(msg || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-1 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/70 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-3">
          <Heart size={14} className="fill-current" />
          <span>CUSTOMER REVIEWS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-950">
          Share Your Experience
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          We would love to hear about your experience with Reeyansh Aya Care.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-xl mx-auto">
        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{successMsg}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your feedback has been received and will be reviewed shortly.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field (hidden from genuine users) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-2">
              Full Name <span className="text-pink-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-sm"
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Rating <span className="text-pink-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} star`}
                    className="p-1 text-2xl transition-transform hover:scale-115 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-slate-300 hover:text-amber-200'
                      }
                    />
                  </button>
                );
              })}
              <span className="text-xs font-semibold text-slate-500 ml-2">
                {rating ? `${rating} of 5 stars` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Feedback Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="message" className="block text-sm font-semibold text-slate-800">
                Feedback <span className="text-pink-600">*</span>
              </label>
              <span className="text-xs text-slate-400">{message.length}/1000</span>
            </div>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your experience..."
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-sm resize-y"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold shadow-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
