import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Share2,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ArrowLeft,
  Check,
  Heart,
  Smile,
  Shuffle,
  Wand2,
  Undo2,
} from 'lucide-react';
import { CapturedPhoto, FilterId, FrameId, PlacedSticker, StripConfig } from '../types';
import { PHOTO_FILTERS, getFilterById } from '../utils/filters';
import { FRAMES, STICKERS } from '../utils/stickersAndFrames';
import { renderSinglePhotoCanvas, renderPhotoStripCanvas } from '../utils/canvasRenderer';
import { savePhotoToDB } from '../utils/db';
import { cutieAudio } from '../utils/audio';

interface PhotoEditorProps {
  photoSrc: string | string[]; // Single image URL or array of strip images
  isStrip: boolean;
  initialFilterId?: FilterId;
  initialFrameId?: FrameId;
  stripConfig?: StripConfig;
  onBack: () => void;
  onSavedToGallery: () => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  photoSrc,
  isStrip,
  initialFilterId = 'rosy-cheeks',
  initialFrameId = isStrip ? 'korean-studio' : 'polaroid-classic',
  stripConfig,
  onBack,
  onSavedToGallery,
}) => {
  const [filterId, setFilterId] = useState<FilterId>(initialFilterId);
  const [frameId, setFrameId] = useState<FrameId>(initialFrameId);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>(
    stripConfig?.caption || (isStrip ? 'cutie of the day ♡' : 'my pretty moment ♡')
  );

  const [activeTab, setActiveTab] = useState<'stickers' | 'frames' | 'filters'>('stickers');
  const [stickerCategory, setStickerCategory] = useState<'all' | 'bows' | 'hearts' | 'sweets' | 'sparkles' | 'cute'>('all');

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [isSavedInGallery, setIsSavedInGallery] = useState(false);

  // Dragging sticker state
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update canvas render when filters, frames, stickers, or caption change
  const updateRender = async () => {
    setIsRendering(true);
    try {
      if (isStrip && Array.isArray(photoSrc)) {
        const config: StripConfig = {
          layout: stripConfig?.layout || 'vertical-4',
          backgroundColor: stripConfig?.backgroundColor || '#FFCCD5',
          caption,
          showDate: stripConfig?.showDate ?? true,
          dateText: stripConfig?.dateText || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          filterId,
          frameId,
        };
        const rendered = await renderPhotoStripCanvas({
          images: photoSrc,
          config,
          stickers,
        });
        setPreviewDataUrl(rendered);
      } else {
        const singleSrc = typeof photoSrc === 'string' ? photoSrc : photoSrc[0];
        const rendered = await renderSinglePhotoCanvas({
          imageSrc: singleSrc,
          filterId,
          frameId,
          stickers,
          caption,
        });
        setPreviewDataUrl(rendered);
      }
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    updateRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, frameId, stickers, caption]);

  // Add sticker to center
  const handleAddSticker = (stickerId: string) => {
    cutieAudio.playPopSound();
    const newSticker: PlacedSticker = {
      id: 'sticker_' + Date.now(),
      stickerId,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1,
      rotation: Math.floor(Math.random() * 30) - 15,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Sticker adjustments
  const handleScaleSticker = (delta: number) => {
    if (!selectedStickerId) return;
    cutieAudio.playPopSound();
    setStickers((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStickerId) return s;
        const nextScale = Math.max(0.4, Math.min(2.5, s.scale + delta));
        return { ...s, scale: nextScale };
      })
    );
  };

  const handleRotateSticker = () => {
    if (!selectedStickerId) return;
    cutieAudio.playPopSound();
    setStickers((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStickerId) return s;
        return { ...s, rotation: (s.rotation + 25) % 360 };
      })
    );
  };

  const handleDeleteSticker = () => {
    if (!selectedStickerId) return;
    cutieAudio.playPopSound();
    setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  // Clear all stickers
  const handleClearAllStickers = () => {
    cutieAudio.playPopSound();
    setStickers([]);
    setSelectedStickerId(null);
  };

  // Handle pointer down on sticker for dragging
  const handleStickerPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setSelectedStickerId(id);
    setIsDragging(true);

    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onPointerMove = (moveEvt: PointerEvent) => {
      const xPercent = ((moveEvt.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((moveEvt.clientY - rect.top) / rect.height) * 100;
      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x: Math.max(5, Math.min(95, xPercent)), y: Math.max(5, Math.min(95, yPercent)) } : s))
      );
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Surprise Me! (random filter + frame + cute sticker)
  const handleSurpriseMe = () => {
    cutieAudio.playSparkleSound();
    const randomFilter = PHOTO_FILTERS[Math.floor(Math.random() * PHOTO_FILTERS.length)];
    const randomFrame = FRAMES[Math.floor(Math.random() * FRAMES.length)];
    const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];

    setFilterId(randomFilter.id);
    setFrameId(randomFrame.id);
    handleAddSticker(randomSticker.id);
  };

  // Save to IndexedDB Gallery
  const saveToGallery = async (dataUrlToSave: string) => {
    try {
      const newPhoto: CapturedPhoto = {
        id: 'cutie_' + Date.now(),
        timestamp: Date.now(),
        dataUrl: dataUrlToSave,
        type: isStrip ? 'strip' : 'single',
        filterId,
        frameId,
        stickers,
        caption,
        isFavorite: false,
      };
      await savePhotoToDB(newPhoto);
      setIsSavedInGallery(true);
    } catch (e) {
      console.warn('Gallery save error:', e);
    }
  };

  // Download high-res photo or strip
  const handleDownload = async () => {
    cutieAudio.playSparkleSound();
    const link = document.createElement('a');
    const filename = isStrip
      ? `cutie-booth-photo-strip-${Date.now().toString().slice(-4)}.png`
      : `cutie-booth-photo-${Date.now().toString().slice(-4)}.png`;

    link.download = filename;
    link.href = previewDataUrl;
    link.click();

    await saveToGallery(previewDataUrl);

    setDownloadSuccessMsg('Your little memory is ready to keep! ♡');
    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 4000);
  };

  // Web Share API
  const handleShare = async () => {
    cutieAudio.playSparkleSound();
    await saveToGallery(previewDataUrl);

    try {
      if (navigator.share && previewDataUrl) {
        // Convert data URL to blob file for sharing
        const blob = await (await fetch(previewDataUrl)).blob();
        const file = new File([blob], isStrip ? 'cutie-strip.png' : 'cutie-photo.png', {
          type: 'image/png',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Cutie Booth Memory 🎀',
            text: 'A little cute memory from Cutie Booth! ♡',
            files: [file],
          });
          setDownloadSuccessMsg('Shared with love! ♡');
          return;
        }
      }
    } catch {
      // User cancelled share or unsupported
    }
    // Fallback: download directly
    handleDownload();
  };

  const filteredStickers =
    stickerCategory === 'all'
      ? STICKERS
      : STICKERS.filter((s) => s.category === stickerCategory);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onBack}
          className="px-4 py-1.5 rounded-full bg-white/80 hover:bg-white text-pink-700 font-cute text-sm border border-pink-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retake Photo</span>
        </button>

        <h2 className="font-hand font-bold text-2xl sm:text-3xl text-pink-600">
          Decorate Your Memory 🎀
        </h2>

        {/* Surprise Me button */}
        <button
          onClick={handleSurpriseMe}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-cute text-xs shadow-md hover:from-pink-500 hover:to-rose-500 flex items-center gap-1.5 cursor-pointer"
          title="Surprise me with a random combination!"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Surprise Me!</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Canvas Preview Box (6 or 7 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            ref={previewContainerRef}
            className={`relative max-w-[340px] sm:max-w-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-pink-100 flex items-center justify-center select-none ${
              isStrip ? 'aspect-[1/2.8] max-h-[70vh]' : 'aspect-[1/1.18]'
            }`}
          >
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Photobooth memory preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-pink-500">
                <Sparkles className="w-8 h-8 animate-spin mb-2" />
                <span className="font-cute text-sm">Rendering pretty photo...</span>
              </div>
            )}

            {/* Interactive Sticker Drag Handles on top of preview */}
            {stickers.map((s) => {
              const stickerDef = STICKERS.find((st) => st.id === s.stickerId);
              if (!stickerDef) return null;
              const isSelected = selectedStickerId === s.id;

              return (
                <div
                  key={s.id}
                  onPointerDown={(e) => handleStickerPointerDown(e, s.id)}
                  className={`absolute pointer-events-auto cursor-move transition-transform ${
                    isSelected ? 'ring-2 ring-pink-500 ring-offset-2 rounded-xl' : ''
                  }`}
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                    width: '60px',
                    height: '60px',
                  }}
                >
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: stickerDef.svgContent }}
                  />
                </div>
              );
            })}

            {isRendering && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-30">
                <div className="w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Sticker Controls floating bar when a sticker is active */}
          {selectedStickerId && (
            <div className="mt-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-200 shadow-md text-xs font-cute animate-fade-in">
              <span className="text-pink-800 font-bold mr-1">Sticker:</span>
              <button
                onClick={() => handleScaleSticker(0.15)}
                className="p-1 text-pink-600 hover:bg-pink-100 rounded cursor-pointer"
                title="Make bigger"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScaleSticker(-0.15)}
                className="p-1 text-pink-600 hover:bg-pink-100 rounded cursor-pointer"
                title="Make smaller"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotateSticker}
                className="p-1 text-pink-600 hover:bg-pink-100 rounded cursor-pointer"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSticker}
                className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                title="Delete sticker"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toast Download Message */}
          {downloadSuccessMsg && (
            <div className="mt-4 px-5 py-2.5 rounded-full bg-emerald-500 text-white font-cute text-sm shadow-xl flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>{downloadSuccessMsg}</span>
            </div>
          )}

          {/* Action Download / Share Bar */}
          <div className="w-full max-w-sm mt-5 flex flex-col gap-2.5">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-cute font-bold text-base shadow-xl hover:shadow-pink-300/60 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-white"
            >
              <Download className="w-5 h-5" />
              <span>{isStrip ? 'Download Photo Strip 🎀' : 'Download Photo ♡'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/90 hover:bg-white text-pink-700 border border-pink-300 font-cute text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-500" />
                <span>Share Memory</span>
              </button>

              <button
                onClick={onSavedToGallery}
                className="flex-1 py-2.5 px-4 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-cute text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-500" />
                <span>View In Gallery</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Decoration Toolbox (6 cols) */}
        <div className="lg:col-span-6 bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-pink-200/80 shadow-lg flex flex-col gap-4">
          {/* Tabs: Stickers | Frames | Filters */}
          <div className="flex rounded-2xl bg-pink-100/70 p-1">
            {(
              [
                { id: 'stickers', label: '🎀 Stickers' },
                { id: 'frames', label: '🖼️ Cute Frames' },
                { id: 'filters', label: '✨ Filters' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  cutieAudio.playPopSound();
                  setActiveTab(tab.id);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-cute font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-pink-900/70 hover:text-pink-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: STICKERS TRAY */}
          {activeTab === 'stickers' && (
            <div className="flex flex-col gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'bows', label: 'Bows' },
                    { id: 'hearts', label: 'Hearts' },
                    { id: 'sweets', label: 'Sweets' },
                    { id: 'sparkles', label: 'Sparkles' },
                    { id: 'cute', label: 'Doodles' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setStickerCategory(cat.id);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-cute transition-colors cursor-pointer ${
                      stickerCategory === cat.id
                        ? 'bg-pink-500 text-white font-bold'
                        : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of stickers */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-56 overflow-y-auto p-1">
                {filteredStickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleAddSticker(sticker.id)}
                    className="p-2 rounded-2xl bg-pink-50/70 hover:bg-pink-100 border border-pink-200/60 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer shadow-sm"
                    title={sticker.name}
                  >
                    <div
                      className="w-10 h-10 group-hover:scale-110 transition-transform"
                      dangerouslySetInnerHTML={{ __html: sticker.svgContent }}
                    />
                    <span className="text-[10px] font-cute text-stone-600 truncate max-w-full">
                      {sticker.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {stickers.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-pink-100 text-xs font-cute text-stone-500">
                  <span>{stickers.length} stickers added (tap sticker to adjust/drag)</span>
                  <button
                    onClick={handleClearAllStickers}
                    className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" /> Clear stickers
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FRAMES */}
          {activeTab === 'frames' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                {FRAMES.map((frame) => {
                  const isSelected = frameId === frame.id;
                  return (
                    <button
                      key={frame.id}
                      onClick={() => {
                        cutieAudio.playPopSound();
                        setFrameId(frame.id);
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-pink-100/90 border-pink-500 ring-2 ring-pink-400 shadow-sm'
                          : 'bg-white/70 border-pink-200/80 hover:bg-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-cute font-bold text-xs text-pink-900">
                          {frame.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-600" />}
                      </div>
                      <span className="text-[10px] text-stone-600 leading-tight">
                        {frame.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Caption text for polaroid/korean frame */}
              <div className="pt-2 border-t border-pink-100 flex flex-col gap-1.5">
                <span className="font-cute font-bold text-xs text-pink-800">
                  Custom Frame Note / Caption:
                </span>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. cutie of the day ♡"
                  className="px-3 py-2 rounded-xl border border-pink-300 text-xs font-cute focus:outline-pink-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FILTERS */}
          {activeTab === 'filters' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
              {PHOTO_FILTERS.map((f) => {
                const isSelected = filterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setFilterId(f.id);
                    }}
                    className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-pink-200/90 border-pink-500 ring-2 ring-pink-400 shadow-sm'
                        : 'bg-white/80 border-pink-200 hover:bg-pink-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg border border-pink-200 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: f.previewColor }}
                    />
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-xs font-cute font-bold text-pink-900 truncate">
                        {f.name}
                      </span>
                      <span className="text-[9px] text-stone-500 truncate">{f.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
