
import { TravelBookmark } from '../types';

const STORAGE_KEY = 'wanderlist_bookmarks_v1';

export const storageService = {
  saveBookmarks: (bookmarks: TravelBookmark[]) => {
    try {
      const serialized = JSON.stringify(bookmarks);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save bookmarks to storage', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Local storage is full. Consider removing some high-resolution images.');
      }
    }
  },

  loadBookmarks: (): TravelBookmark[] => {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      return serialized ? JSON.parse(serialized) : [];
    } catch (error) {
      console.error('Failed to load bookmarks from storage', error);
      return [];
    }
  },

  // Helper to convert File to Base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  // Helper to resize image before storing to save space
  resizeImage: (base64Str: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  }
};
