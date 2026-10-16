import React, { useState, useEffect } from 'react';
import {
  Heart,
  Download,
  Trash2,
  X,
  Sparkles,
  ArrowLeft,
  Share2,
  Archive,
  Eye,
  Calendar,
  Lock,
  Filter,
} from 'lucide-react';
import JSZip from 'jszip';
import { CapturedPhoto } from '../types';
import {
  getAllPhotosFromDB,
  deletePhotoFromDB,
  toggleFavoriteInDB,
  clearAllPhotosFromDB,
} from '../utils/db';
import { cutieAudio } from '../utils/audio';

interface GalleryViewProps {
  onBackToBooth: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onBackToBooth }) => {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Load photos on mount
  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const items = await getAllPhotosFromDB();
      setPhotos(items);
    } catch (e) {
      console.warn('Failed to load gallery photos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // Toggle favorite
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cutieAudio.playSparkleSound();
    const isFav = await toggleFavoriteInDB(id);
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: isFav } : p))
    );
    if (selectedPhoto && selectedPhoto.id === id) {
      setSelectedPhoto((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
    }
  };

  // Delete individual photo
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    cutieAudio.playPopSound();
    await deletePhotoFromDB(deleteTargetId);
    setPhotos((prev) => prev.filter((p) => p.id !== deleteTargetId));
    if (selectedPhoto?.id === deleteTargetId) {
      setSelectedPhoto(null);
    }
    setDeleteTargetId(null);
  };

  // Clear all
  const handleConfirmClearAll = async () => {
    cutieAudio.playPopSound();
    await clearAllPhotosFromDB();
    setPhotos([]);
    setSelectedPhoto(null);
    setShowClearConfirm(false);
  };

  // Download single image
  const handleDownloadSingle = (photo: CapturedPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    cutieAudio.playSparkleSound();
    const link = document.createElement('a');
    link.download = `cutie-booth-${photo.type}-${new Date(photo.timestamp).toISOString().slice(0, 10)}.png`;
    link.href = photo.dataUrl;
    link.click();
  };

  // Download All as ZIP (using JSZip)
  const handleDownloadAllZip = async () => {
    if (photos.length === 0 || isZipping) return;
    cutieAudio.playSparkleSound();
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('cutie-booth-memories');

      photos.forEach((p, idx) => {
        // Extract base64 data
        const base64Data = p.dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        const filename = `cutie-${p.type}-${idx + 1}-${new Date(p.timestamp).toISOString().slice(0, 10)}.png`;
        folder?.file(filename, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `cutie-booth-all-memories-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('ZIP creation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Filtered list
  const displayedPhotos = onlyFavorites
    ? photos.filter((p) => p.isFavorite)
    : photos;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <button
          onClick={onBackToBooth}
          className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-pink-700 font-cute text-sm border border-pink-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Photobooth</span>
        </button>

        <div className="text-center">
          <h2 className="font-hand font-bold text-3xl sm:text-4xl text-pink-600 flex items-center justify-center gap-2">
            <span>My Photo Gallery</span>
            <Sparkles className="w-6 h-6 text-pink-400" />
          </h2>
          <p className="text-xs font-cute text-pink-800/80">
            {photos.length} cute {photos.length === 1 ? 'memory' : 'memories'} captured ♡
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <>
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-cute text-xs shadow-md hover:from-pink-500 hover:to-rose-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Download all photos as a ZIP archive"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{isZipping ? 'Zipping...' : 'Save All (ZIP)'}</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-full text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors cursor-pointer"
                title="Clear gallery"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter / Favorites Bar & Privacy Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-pink-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyFavorites(false)}
            className={`px-3 py-1 rounded-full text-xs font-cute transition-all cursor-pointer ${
              !onlyFavorites
                ? 'bg-pink-500 text-white font-bold shadow-sm'
                : 'text-stone-600 hover:bg-pink-100'
            }`}
          >
            All Photos ({photos.length})
          </button>

          <button
            onClick={() => setOnlyFavorites(true)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-cute transition-all cursor-pointer ${
              onlyFavorites
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'text-stone-600 hover:bg-pink-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
            <span>Favorites ({photos.filter((p) => p.isFavorite).length})</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-1 text-[11px] font-cute text-stone-500">
          <Lock className="w-3 h-3 text-pink-400" />
          <span>Photos stay private on your browser. Saved safely in local storage ♡</span>
        </div>
      </div>

      {/* Gallery Photos Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-pink-400">
          <Sparkles className="w-8 h-8 animate-spin mb-2" />
          <span className="font-cute text-sm">Opening memory album...</span>
        </div>
      ) : displayedPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 rounded-3xl border-2 border-dashed border-pink-200 p-8">
          <div className="text-4xl mb-3">🎀</div>
          <h3 className="font-hand font-bold text-2xl text-pink-700 mb-1">
            {onlyFavorites ? 'No favorite memories yet!' : 'Your gallery is waiting for pictures!'}
          </h3>
          <p className="text-xs font-cute text-pink-900/70 max-w-sm mb-4">
            {onlyFavorites
              ? 'Click the little heart on any photo to add it to your favorites list ♡'
              : 'Take a picture or create a cute photostrip to save your memories here!'}
          </p>
          <button
            onClick={onBackToBooth}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-cute text-sm font-bold shadow hover:from-pink-500 hover:to-rose-500 cursor-pointer"
          >
            Let's Take Pictures! 📷
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayedPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md border-2 border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              <div
                className={`w-full overflow-hidden bg-pink-50 flex items-center justify-center ${
                  photo.type === 'strip' ? 'aspect-[1/2]' : 'aspect-square'
                }`}
              >
                <img
                  src={photo.dataUrl}
                  alt="Captured memory"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Card Footer */}
              <div className="p-2.5 flex items-center justify-between bg-white text-xs font-cute text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-pink-400" />
                  <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleToggleFavorite(photo.id, e)}
                    className="p-1 text-pink-500 hover:scale-125 transition-transform"
                    title="Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        photo.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                      }`}
                    />
                  </button>

                  <button
                    onClick={(e) => handleDownloadSingle(photo, e)}
                    className="p-1 text-stone-500 hover:text-pink-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(photo.id);
                    }}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Type pill */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white font-cute">
                {photo.type === 'strip' ? 'Strip' : 'Photo'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] bg-white rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview Container */}
            <div className="w-full max-h-[65vh] overflow-y-auto rounded-2xl bg-pink-50 flex items-center justify-center p-2">
              <img
                src={selectedPhoto.dataUrl}
                alt="Enlarged memory"
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Modal Controls */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-pink-100">
              <button
                onClick={(e) => handleToggleFavorite(selectedPhoto.id, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cute text-pink-700 hover:bg-pink-50 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    selectedPhoto.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                  }`}
                />
                <span>{selectedPhoto.isFavorite ? 'Favorited ♡' : 'Add to Favorites'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteTargetId(selectedPhoto.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-full text-xs font-cute flex items-center gap-1 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDownloadSingle(selectedPhoto)}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-cute text-xs font-bold shadow hover:from-pink-500 hover:to-rose-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-pink-200">
            <div className="text-3xl mb-2">🎀</div>
            <h4 className="font-bold font-cute text-lg text-stone-800 mb-1">
              Delete this memory?
            </h4>
            <p className="text-xs text-stone-500 mb-5">
              Are you sure you want to remove this photo from your Cutie Booth gallery?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-cute text-xs"
              >
                Keep it
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-cute text-xs font-bold shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-pink-200">
            <div className="text-3xl mb-2">⚠️</div>
            <h4 className="font-bold font-cute text-lg text-stone-800 mb-1">
              Clear entire gallery?
            </h4>
            <p className="text-xs text-stone-500 mb-5">
              This will remove all {photos.length} captured memories from this device. Download all photos first if you want to keep them!
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-cute text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-cute text-xs font-bold shadow"
              >
                Clear All Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
