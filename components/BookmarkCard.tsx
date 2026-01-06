
import React, { useState, useRef } from 'react';
import { TravelBookmark } from '../types';
import { storageService } from '../services/storageService';

interface BookmarkCardProps {
  bookmark: TravelBookmark;
  onUpdate: (updated: TravelBookmark) => void;
  onDelete: (id: string) => void;
  onViewImages: (images: string[], index: number) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onUpdate, onDelete, onViewImages }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingCover, setIsChangingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      ...bookmark,
      status: bookmark.status === 'planned' ? 'visited' : 'planned'
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: string[] = [...bookmark.images];
      for (let i = 0; i < files.length; i++) {
        const base64 = await storageService.fileToBase64(files[i]);
        const resized = await storageService.resizeImage(base64);
        newImages.push(resized);
      }
      onUpdate({ ...bookmark, images: newImages });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsChangingCover(true);
    try {
      const base64 = await storageService.fileToBase64(file);
      const resized = await storageService.resizeImage(base64);
      onUpdate({ ...bookmark, coverImage: resized });
    } catch (err) {
      console.error('Cover update failed', err);
    } finally {
      setIsChangingCover(false);
    }
    e.target.value = '';
  };

  const removeCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove cover image for this trip?')) {
      onUpdate({ ...bookmark, coverImage: undefined });
    }
  };

  const triggerCoverChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    coverInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newImages = bookmark.images.filter((_, i) => i !== index);
    onUpdate({ ...bookmark, images: newImages });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(bookmark.id);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full relative">
      {/* Hidden inputs */}
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />

      {/* Header Image or Placeholder */}
      <div className="relative h-56 bg-slate-200 overflow-hidden">
        {bookmark.coverImage ? (
          <img 
            src={bookmark.coverImage} 
            alt={bookmark.title} 
            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
            onClick={() => onViewImages([bookmark.coverImage!], 0)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <i className={`fa-solid ${isChangingCover ? 'fa-spinner fa-spin' : 'fa-map-location-dot'} text-4xl text-blue-200`}></i>
          </div>
        )}
        
        {/* TOP LAYER ACTIONS (Absolute positioned buttons with high z-index) */}
        <div className="absolute top-3 right-3 z-[100] flex gap-2">
          {/* Change Cover Button (only on hover or if placeholder) */}
          <button 
            type="button"
            onClick={triggerCoverChange}
            className="w-9 h-9 bg-white/95 hover:bg-blue-600 text-slate-400 hover:text-white rounded-full transition-all shadow-lg flex items-center justify-center border border-white active:scale-90 opacity-0 group-hover:opacity-100"
            title="Change trip cover"
          >
            <i className="fa-solid fa-camera text-sm"></i>
          </button>

          {/* Delete Bookmark Button - Main action */}
          <button 
            type="button"
            onClick={handleDelete}
            className="w-9 h-9 bg-white/95 hover:bg-red-500 text-slate-400 hover:text-white rounded-full transition-all shadow-lg flex items-center justify-center border border-white active:scale-90"
            title="Delete bookmark"
          >
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>

        {/* Floating Cover Action (Bottom Right) */}
        {bookmark.coverImage && (
          <div className="absolute bottom-3 right-3 z-[100] opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={removeCover}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg shadow-lg transition-all flex items-center gap-1.5 active:scale-95" 
              title="Remove Cover Image"
            >
              <i className="fa-solid fa-image-slash"></i> Remove Cover
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 ${
            bookmark.status === 'visited' 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-amber-500/90 text-white'
          }`}>
            {bookmark.status === 'visited' ? 'Completed' : 'Planned'}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
          {bookmark.title}
        </h3>
        <p className="text-sm text-slate-500 flex items-center mb-4">
          <i className="fa-solid fa-location-dot mr-1.5 text-blue-400"></i>
          {bookmark.location}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <button 
            onClick={toggleStatus}
            className={`flex items-center text-sm font-bold transition-all px-4 py-2 rounded-xl active:scale-95 shadow-sm hover:shadow-md ${
              bookmark.status === 'visited' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
            }`}
          >
            <i className={`fa-solid ${bookmark.status === 'visited' ? 'fa-rotate-left' : 'fa-check'} mr-2`}></i>
            {bookmark.status === 'visited' ? 'Reset Status' : 'Mark Visited'}
          </button>
          
          <div className="flex -space-x-2">
             {bookmark.images.slice(0, 3).map((img, i) => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm cursor-zoom-in hover:z-10 transition-transform hover:scale-110" onClick={() => onViewImages(bookmark.images, i)}>
                 <img src={img} alt="" className="w-full h-full object-cover" />
               </div>
             ))}
             {bookmark.images.length > 3 && (
               <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                 +{bookmark.images.length - 3}
               </div>
             )}
          </div>
        </div>

        {/* Memory Gallery (Only if visited) */}
        {bookmark.status === 'visited' && (
          <div className="mt-4 border-t border-slate-50 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memories Gallery</span>
              <label className="cursor-pointer text-[10px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-all border border-blue-100">
                <i className="fa-solid fa-plus mr-1"></i> Add Memories
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <div className="animate-pulse flex items-center text-[10px] text-blue-500 mb-2 font-bold p-2 bg-blue-50/50 rounded-lg">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i> Optimizing photos...
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {bookmark.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square group/img cursor-zoom-in overflow-hidden rounded-xl shadow-sm" onClick={() => onViewImages(bookmark.images, idx)}>
                  <img src={img} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                  <button 
                    onClick={(e) => removeImage(e, idx)}
                    className="absolute top-1 right-1 bg-white shadow-lg border border-slate-100 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <i className="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </div>
              ))}
              {bookmark.images.length === 0 && !isUploading && (
                <div className="col-span-4 py-5 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300">
                  <i className="fa-solid fa-camera-retro text-2xl mb-1"></i>
                  <p className="text-[10px] font-bold uppercase tracking-tighter">Empty Gallery</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkCard;
