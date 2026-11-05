import { useState, useRef } from 'react';
import { X, RefreshCw, AlertCircle, Loader2, FileVideo, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { validateFile, formatBytes } from '../utils/fileValidation';

const EditMediaModal = ({ isOpen, item, onClose, onSuccess }) => {
  const [replacementFile, setReplacementFile] = useState(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState(null);
  const [newMediaType, setNewMediaType] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  if (!isOpen || !item) return null;

  const itemId = item._id || item.id;
  const isCurrentVideo = item.mediaType === 'video';

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setReplacementFile(null);
      setNewPreviewUrl(null);
      setNewMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setReplacementFile(file);
    setNewMediaType(validation.mediaType);

    if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    setNewPreviewUrl(URL.createObjectURL(file));
  };

  const handleClose = () => {
    if (updating) return;
    if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    setReplacementFile(null);
    setNewPreviewUrl(null);
    setNewMediaType(null);
    setError('');
    setUploadProgress(0);
    onClose();
  };

  const handleReplace = async () => {
    if (!replacementFile || updating) return;

    setError('');
    setUpdating(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', replacementFile);

    try {
      await api.put(`/admin/gallery/${itemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
      setReplacementFile(null);
      setNewPreviewUrl(null);
      setNewMediaType(null);
      setUploadProgress(0);

      onSuccess('Media updated successfully.');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 413) {
        setError('File size is too large.');
      } else if (err?.response?.status === 400) {
        setError(msg || 'Unsupported file type.');
      } else if (err?.response?.status === 502) {
        setError('Upload service failed. Please try again.');
      } else if (!err?.response) {
        setError('Network error. Unable to reach server.');
      } else {
        setError(msg || 'Failed to update media. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[#1e3a5f]">
            <RefreshCw size={20} className="text-[#e91e8c]" />
            <h2 className="font-bold text-lg">Replace Media</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={updating}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Previews side by side or stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Media */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Media
              </p>
              <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                {isCurrentVideo ? (
                  <video
                    src={item.mediaUrl}
                    poster={item.thumbnailUrl || undefined}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt="Current media"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Replacement Preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                New Media Preview
              </p>
              <div className="aspect-video rounded-xl bg-slate-100 border border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
                {replacementFile && newPreviewUrl ? (
                  newMediaType === 'video' ? (
                    <video
                      src={newPreviewUrl}
                      controls
                      className="w-full h-full object-contain bg-slate-900"
                    />
                  ) : (
                    <img
                      src={newPreviewUrl}
                      alt="Replacement preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs text-slate-400">
                      No new file selected yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Replacement File Picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mov"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={updating}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-pink-400 hover:bg-pink-50/20 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className="text-[#e91e8c]" />
              <span>{replacementFile ? 'Choose Different Replacement' : 'Select Replacement Image / Video'}</span>
            </button>
            <p className="text-xs text-slate-400 text-center mt-1.5">
              Images max 10MB &bull; Videos max 100MB
            </p>
          </div>

          {/* Replacement File Info & Progress */}
          {replacementFile && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-2">
                {newMediaType === 'video' ? (
                  <FileVideo size={16} className="text-[#e91e8c] shrink-0" />
                ) : (
                  <ImageIcon size={16} className="text-[#1e3a5f] shrink-0" />
                )}
                <span className="font-medium text-slate-700 truncate">{replacementFile.name}</span>
              </div>
              <span className="text-slate-400 font-mono shrink-0">{formatBytes(replacementFile.size)}</span>
            </div>
          )}

          {updating && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Replacing media...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#e91e8c] transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={updating}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReplace}
            disabled={!replacementFile || updating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1e3a5f] to-[#2b4c77] hover:from-[#152a45] hover:to-[#1e3a5f] rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {updating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <span>Replace Media</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMediaModal;
