
import React, { useState, useEffect, useMemo } from 'react';
import { TravelBookmark, BookmarkStatus } from './types';
import { storageService } from './services/storageService';
import BookmarkCard from './components/BookmarkCard';
import AddBookmarkModal from './components/AddBookmarkModal';
import ImageLightbox from './components/ImageLightbox';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<TravelBookmark[]>([]);
  const [filter, setFilter] = useState<BookmarkStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Lightbox state
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const saved = storageService.loadBookmarks();
    setBookmarks(saved);
    setIsInitialLoad(false);
  }, []);

  // Save to local storage whenever bookmarks change
  useEffect(() => {
    if (!isInitialLoad) {
      storageService.saveBookmarks(bookmarks);
    }
  }, [bookmarks, isInitialLoad]);

  const addBookmark = (data: Omit<TravelBookmark, 'id' | 'createdAt'>) => {
    // Robust ID generation
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);

    const newBookmark: TravelBookmark = {
      ...data,
      id,
      createdAt: Date.now()
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  };

  const updateBookmark = (updated: TravelBookmark) => {
    setBookmarks(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBookmark = (id: string) => {
    // Use a simple prompt-less delete for debugging if confirm is the issue, 
    // but standard confirm is better UI. Ensuring it's called correctly.
    if (window.confirm('Delete this travel bookmark permanently?')) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
    }
  };

  const filteredBookmarks = useMemo(() => {
    return bookmarks
      .filter(b => filter === 'all' || b.status === filter)
      .filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [bookmarks, filter, searchQuery]);

  return (
    <div className="min-h-screen pb-20 bg-[#fbfcfd]">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <i className="fa-solid fa-plane-departure"></i>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">WanderList</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input 
                type="text" 
                placeholder="Search places..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-100 flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Create Bookmark
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="md:hidden w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200"
            title="Create Bookmark"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </header>

      {/* Hero / Filter Section */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">My Adventures</h2>
            <p className="text-slate-500 mt-1 font-medium italic">Collect moments, not things.</p>
          </div>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {[
              { id: 'all', label: 'All' },
              { id: 'planned', label: 'Bucket List' },
              { id: 'visited', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === tab.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
              <i className="fa-solid fa-compass text-4xl text-blue-200 animate-pulse"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">No bookmarks yet</h3>
            <p className="text-slate-500 max-w-xs mt-2 font-medium">
              Start your journey by adding your favorite or dream destinations.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
            >
              Create first bookmark
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBookmarks.map(bookmark => (
              <BookmarkCard 
                key={bookmark.id} 
                bookmark={bookmark} 
                onUpdate={updateBookmark}
                onDelete={deleteBookmark}
                onViewImages={(images, index) => setLightboxData({ images, index })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && (
        <AddBookmarkModal 
          onAdd={addBookmark} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {/* Lightbox */}
      {lightboxData && (
        <ImageLightbox 
          images={lightboxData.images} 
          initialIndex={lightboxData.index}
          onClose={() => setLightboxData(null)} 
        />
      )}

      {/* Footer Branding */}
      <footer className="mt-20 py-12 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          WanderList &bull; Developed by -<i>Rohit Vemula</i>
        </p>
      </footer>
    </div>
  );
};

export default App;
