
import React, { useState, useRef } from 'react';
import { TravelBookmark, BookmarkStatus } from '../types';
import { storageService } from '../services/storageService';

interface AddBookmarkModalProps {
  onAdd: (bookmark: Omit<TravelBookmark, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<BookmarkStatus>('planned');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64 = await storageService.fileToBase64(file);
      const resized = await storageService.resizeImage(base64);
      setCoverImage(resized);
    } catch (err) {
      console.error('Image processing failed', err);
    } finally {
      setIsProcessing(false);
    }
    e.target.value = '';
  };

  const removeCover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverImage(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;
    
    onAdd({ 
      title, 
      location, 
      status, 
      coverImage: coverImage || undefined,
      images: [], 
      tags: [] 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">New Travel Bookmark</h2>
            <p className="text-xs text-slate-500 font-medium">Capture your next adventure</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Image Upload Area */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Trip Cover Image</label>
            <div className="relative h-48 w-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden group">
              {coverImage ? (
                <>
                  <img src={coverImage} className="w-full h-full object-cover" />
                  {/* Overlay for actions - ensures Remove is clickable over the Change area */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button 
                      type="button"
                      onClick={triggerFileSelect}
                      className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                    >
                      Change Cover
                    </button>
                    <button 
                      type="button" 
                      onClick={removeCover}
                      className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <i className="fa-solid fa-trash-can"></i> Remove Cover
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  type="button"
                  onClick={triggerFileSelect}
                  className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200/50 transition-colors"
                >
                  <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-camera'} text-3xl mb-2`}></i>
                  <span className="text-xs font-bold">{isProcessing ? 'Processing...' : 'Upload Cover Image'}</span>
                </button>
              )}
              {/* Hidden file input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Trip Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="e.g. Summer in Tokyo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Where to?</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Current Status</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('planned')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                    status === 'planned' 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}
                >
                  <i className="fa-solid fa-clock mr-2"></i> Planned
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('visited')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                    status === 'visited' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600' 
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}
                >
                  <i className="fa-solid fa-check mr-2"></i> Completed
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-bookmark"></i>
            Create Bookmark
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkModal;
