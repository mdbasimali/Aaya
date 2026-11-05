import { useState, useRef } from 'react';
import { X, UploadCloud, FileVideo, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { validateFile, formatBytes } from '../utils/fileValidation';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setMediaType(validation.mediaType);

    // Revoke previous URL if any to avoid memory leak
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClose = () => {
    if (uploading) return; // Prevent closing mid-upload
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setError('');
    setUploadProgress(0);
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/admin/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      setUploadProgress(0);

      onSuccess('Media uploaded successfully.');
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
        setError(msg || 'Failed to upload media. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[#1e3a5f]">
            <UploadCloud size={20} className="text-[#e91e8c]" />
            <h2 className="font-bold text-lg">Upload Media</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* File Picker Zone */}
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-pink-400 hover:bg-pink-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mov"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 group-hover:bg-pink-100 text-slate-500 group-hover:text-pink-600 flex items-center justify-center mb-3 transition-colors">
                <UploadCloud size={26} />
              </div>
              <p className="font-semibold text-slate-800 text-sm">
                Click to select an image or video
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Images: JPEG, PNG, WebP (max 10MB) &bull; Videos: MP4, WebM, MOV (max 100MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Selected File Metadata */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate pr-2">
                  {mediaType === 'video' ? (
                    <FileVideo size={16} className="text-[#e91e8c] shrink-0" />
                  ) : (
                    <ImageIcon size={16} className="text-[#1e3a5f] shrink-0" />
                  )}
                  <span className="font-medium truncate">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 font-mono">{formatBytes(selectedFile.size)}</span>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Uploading...</span>
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
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1e3a5f] to-[#2b4c77] hover:from-[#152a45] hover:to-[#1e3a5f] rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <span>Upload</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
