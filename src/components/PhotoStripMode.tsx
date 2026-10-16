import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Sparkles, Wand2, ArrowRight, Play, Check } from 'lucide-react';
import { FilterId, FrameId, StripConfig, StripLayout } from '../types';
import { PHOTO_FILTERS, getFilterById } from '../utils/filters';
import { FRAMES } from '../utils/stickersAndFrames';
import { cutieAudio } from '../utils/audio';

interface PhotoStripModeProps {
  onCompleteStrip: (images: string[], config: StripConfig) => void;
  onCancel: () => void;
}

const STRIP_COLORS = [
  { name: 'Baby Pink', value: '#FFCCD5' },
  { name: 'Sweet Cream', value: '#FFF8F0' },
  { name: 'Lavender Haze', value: '#E8DFF5' },
  { name: 'Baby Blue', value: '#CCE2FE' },
  { name: 'Soft Mint', value: '#D0F4DE' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Moody Mocha', value: '#3E343A' },
];

const PRESET_CAPTIONS = [
  'cutie of the day ♡',
  'my little moments',
  'sweet memories',
  'made of stardust ✧',
  'forever & always 🎀',
  'cutest girl in the universe',
];

export const PhotoStripMode: React.FC<PhotoStripModeProps> = ({
  onCompleteStrip,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [layout, setLayout] = useState<StripLayout>('vertical-4');
  const [stripColor, setStripColor] = useState<string>('#FFCCD5');
  const [filterId, setFilterId] = useState<FilterId>('rosy-cheeks');
  const [frameId, setFrameId] = useState<FrameId>('korean-studio');
  const [caption, setCaption] = useState<string>('cutie of the day ♡');
  const [customCaption, setCustomCaption] = useState<string>('');
  const [showDate, setShowDate] = useState<boolean>(true);

  // Formatted default date: "2026.10.16"
  const todayDate = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  // Shot slots
  const getSlotCount = (l: StripLayout) => (l === 'vertical-2' ? 2 : l === 'vertical-3' ? 3 : 4);
  const totalShots = getSlotCount(layout);

  const [capturedShots, setCapturedShots] = useState<(string | null)[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Reset captured shots array when layout changes
  useEffect(() => {
    setCapturedShots(new Array(totalShots).fill(null));
    setActiveSlotIndex(0);
    setIsAutoShooting(false);
  }, [layout, totalShots]);

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera error in strip mode:', err);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture single frame
  const takeShot = (targetIndex: number) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsFlashing(true);
    cutieAudio.playShutterSound();
    setTimeout(() => setIsFlashing(false), 300);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/png', 0.95);

      setCapturedShots((prev) => {
        const next = [...prev];
        next[targetIndex] = url;
        return next;
      });
    }
  };

  // Run full automatic Korean photo booth session: 3, 2, 1, SNAP! -> next -> SNAP!
  const runAutoSequence = async () => {
    if (isAutoShooting) return;
    setIsAutoShooting(true);

    for (let slot = 0; slot < totalShots; slot++) {
      setActiveSlotIndex(slot);
      // Countdown 3, 2, 1
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        cutieAudio.playCountdownBeep(false);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown(null);
      cutieAudio.playCountdownBeep(true);
      takeShot(slot);

      // Short breathing pause between photos
      if (slot < totalShots - 1) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    setIsAutoShooting(false);
    cutieAudio.playSparkleSound();
  };

  // Retake individual slot
  const handleRetakeSlot = async (slotIdx: number) => {
    setActiveSlotIndex(slotIdx);
    for (let c = 3; c > 0; c--) {
      setCountdown(c);
      cutieAudio.playCountdownBeep(false);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(null);
    cutieAudio.playCountdownBeep(true);
    takeShot(slotIdx);
  };

  // Restart entire strip
  const handleRestartAll = () => {
    cutieAudio.playPopSound();
    setCapturedShots(new Array(totalShots).fill(null));
    setActiveSlotIndex(0);
  };

  // Check if all shots are filled
  const isStripFilled = capturedShots.filter(Boolean).length === totalShots;

  const currentFilterDef = getFilterById(filterId);

  const handleFinish = () => {
    const validImages = capturedShots.filter((img): img is string => img !== null);
    if (validImages.length === 0) return;

    cutieAudio.playSparkleSound();
    onCompleteStrip(validImages, {
      layout,
      backgroundColor: stripColor,
      caption: customCaption.trim() ? customCaption.trim() : caption,
      showDate,
      dateText: todayDate,
      filterId,
      frameId,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-8">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-full bg-white/80 hover:bg-white text-pink-700 font-cute text-sm border border-pink-200 shadow-sm cursor-pointer"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          <span className="font-hand font-bold text-2xl text-pink-600">
            Korean Photo Strip Studio 🎀
          </span>
        </div>

        <button
          onClick={handleRestartAll}
          className="px-3.5 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-cute text-xs flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Strip</span>
        </button>
      </div>

      {/* Main Studio Workspace: Camera on Left/Top, Strip Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Camera & Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/3] bg-pink-950 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex items-center justify-center">
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-40 camera-flash pointer-events-none"></div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
              style={{
                filter: currentFilterDef.cssFilter !== 'none' ? currentFilterDef.cssFilter : undefined,
              }}
            />

            {/* Tint overlay */}
            {currentFilterDef.tintOverlay && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{ backgroundColor: currentFilterDef.tintOverlay }}
              ></div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="w-24 h-24 rounded-full bg-white/95 text-pink-600 font-hand font-bold text-6xl flex items-center justify-center shadow-2xl border-4 border-pink-400 animate-bounce">
                  {countdown}
                </div>
                <span className="mt-3 font-cute text-white text-base font-bold bg-pink-500/80 px-3 py-1 rounded-full">
                  Pose for Photo #{activeSlotIndex + 1}! ✨
                </span>
              </div>
            )}

            {/* Current slot indicator */}
            <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-black/50 text-white font-cute text-xs backdrop-blur-sm border border-white/20">
              Shot {activeSlotIndex + 1} of {totalShots}
            </div>
          </div>

          {/* Shooting Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 p-3 rounded-2xl border border-pink-200">
            <button
              onClick={runAutoSequence}
              disabled={isAutoShooting}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-cute font-bold shadow-md hover:from-pink-500 hover:to-rose-500 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isAutoShooting ? 'Taking Sequence...' : 'Start 4-Shot Sequence! 🎀'}</span>
            </button>

            <button
              onClick={() => handleRetakeSlot(activeSlotIndex)}
              disabled={isAutoShooting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-cute text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Shot #{activeSlotIndex + 1}</span>
            </button>
          </div>

          {/* Strip Layout & Background Style Options */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-pink-200/80 flex flex-col gap-4">
            {/* Layout Picker */}
            <div>
              <span className="font-cute font-bold text-xs text-pink-800 uppercase tracking-wider block mb-2">
                1. Select Layout
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'vertical-2', label: '2 Photos' },
                    { id: 'vertical-3', label: '3 Photos' },
                    { id: 'vertical-4', label: '4 Photos' },
                    { id: 'grid-2x2', label: '2×2 Collage' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setLayout(item.id);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-cute text-center transition-all cursor-pointer ${
                      layout === item.id
                        ? 'bg-pink-500 text-white font-bold shadow-md'
                        : 'bg-pink-50 hover:bg-pink-100 text-pink-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strip Color Picker */}
            <div>
              <span className="font-cute font-bold text-xs text-pink-800 uppercase tracking-wider block mb-2">
                2. Strip Background Color
              </span>
              <div className="flex flex-wrap gap-2">
                {STRIP_COLORS.map((col) => (
                  <button
                    key={col.value}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setStripColor(col.value);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cute border transition-all cursor-pointer ${
                      stripColor === col.value
                        ? 'ring-2 ring-pink-500 scale-105 font-bold shadow-sm'
                        : 'hover:scale-102 border-stone-200'
                    }`}
                    style={{
                      backgroundColor: col.value,
                      color: col.value === '#3E343A' ? '#FFF' : '#4A3B43',
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.value }}
                    ></span>
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Strip Caption & Date */}
            <div>
              <span className="font-cute font-bold text-xs text-pink-800 uppercase tracking-wider block mb-2">
                3. Caption & Date Stamp
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_CAPTIONS.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setCaption(cap);
                      setCustomCaption('');
                    }}
                    className={`text-xs font-cute px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      caption === cap && !customCaption
                        ? 'bg-pink-200 border-pink-400 text-pink-900 font-bold'
                        : 'bg-white border-pink-200 text-stone-600 hover:bg-pink-50'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Or write custom cute caption..."
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-pink-300 text-xs font-cute focus:outline-pink-500 bg-white"
                />
                <label className="flex items-center gap-1 text-xs font-cute text-pink-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="accent-pink-500 rounded"
                  />
                  <span>Show Date</span>
                </label>
              </div>
            </div>

            {/* Filter Picker for whole strip */}
            <div>
              <span className="font-cute font-bold text-xs text-pink-800 uppercase tracking-wider block mb-2">
                4. Strip Photo Filter
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setFilterId(f.id);
                    }}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-cute whitespace-nowrap cursor-pointer ${
                      filterId === f.id
                        ? 'bg-pink-500 text-white font-bold shadow'
                        : 'bg-white border border-pink-200 text-stone-700 hover:bg-pink-50'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Picker */}
            <div>
              <span className="font-cute font-bold text-xs text-pink-800 uppercase tracking-wider block mb-2">
                5. Strip Frame Style
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {FRAMES.map((fr) => (
                  <button
                    key={fr.id}
                    onClick={() => {
                      cutieAudio.playPopSound();
                      setFrameId(fr.id);
                    }}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-cute whitespace-nowrap cursor-pointer ${
                      frameId === fr.id
                        ? 'bg-pink-500 text-white font-bold shadow'
                        : 'bg-white border border-pink-200 text-stone-700 hover:bg-pink-50'
                    }`}
                  >
                    {fr.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Photostrip Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full text-center mb-2">
            <span className="font-cute font-bold text-sm text-pink-800 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-pink-500" />
              Live Strip Preview
            </span>
          </div>

          {/* Photostrip Card Container */}
          <div
            className="w-full max-w-[280px] p-4 rounded-2xl shadow-xl border border-white/60 flex flex-col items-center gap-3 transition-colors duration-300 relative select-none"
            style={{ backgroundColor: stripColor }}
          >
            {/* Header */}
            <div className="text-center font-cute font-bold text-xs text-pink-900 tracking-wider pt-1">
              🎀 CUTIE BOOTH 🎀
            </div>

            {/* Cells layout */}
            <div
              className={`w-full ${
                layout === 'grid-2x2' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2.5'
              }`}
            >
              {capturedShots.map((shot, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    cutieAudio.playPopSound();
                    setActiveSlotIndex(idx);
                  }}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-white/70 border-2 transition-all cursor-pointer group ${
                    activeSlotIndex === idx
                      ? 'border-pink-500 ring-2 ring-pink-300'
                      : 'border-white/90 shadow-sm'
                  }`}
                >
                  {shot ? (
                    <img
                      src={shot}
                      alt={`Shot ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{
                        filter: currentFilterDef.cssFilter !== 'none' ? currentFilterDef.cssFilter : undefined,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-pink-400 hover:text-pink-600 bg-pink-50/50">
                      <Camera className="w-6 h-6 mb-1 opacity-60 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-cute font-bold">Photo #{idx + 1}</span>
                      <span className="text-[9px] text-pink-400">Click to snap</span>
                    </div>
                  )}

                  {/* Retake badge overlay */}
                  {shot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetakeSlot(idx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-pink-600 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retake this photo"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Text */}
            <div className="w-full text-center flex flex-col items-center gap-0.5 pt-2 pb-1">
              <span className="font-hand font-bold text-base text-[#4A3B43] tracking-wide">
                {customCaption.trim() ? customCaption : caption}
              </span>
              {showDate && (
                <span className="text-[10px] font-cute text-stone-600">{todayDate}</span>
              )}
              <span className="text-[11px] text-pink-600 font-cute">♡ cutie booth ♡</span>
            </div>
          </div>

          {/* Finish & Decorate Strip Button */}
          <div className="w-full max-w-[280px] mt-4 flex flex-col gap-2">
            <button
              onClick={handleFinish}
              disabled={!capturedShots.some(Boolean)}
              className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white font-cute font-bold shadow-lg hover:shadow-pink-300/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>Decorate & Save Strip!</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isStripFilled && (
              <span className="text-[11px] font-cute text-pink-600 text-center">
                Take all {totalShots} photos to fill the strip ♡
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
