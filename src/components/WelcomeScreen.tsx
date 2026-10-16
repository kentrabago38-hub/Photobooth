import React, { useState } from 'react';
import { Camera, Film, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cutieAudio } from '../utils/audio';

interface WelcomeScreenProps {
  onStart: (mode: 'single' | 'strip') => void;
  onOpenGallery: () => void;
  onOpenCompliment: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  onOpenGallery,
  onOpenCompliment,
}) => {
  const [isEntering, setIsEntering] = useState(false);
  const [targetMode, setTargetMode] = useState<'single' | 'strip'>('strip');

  const handleEnter = (mode: 'single' | 'strip') => {
    cutieAudio.playSparkleSound();
    // Also politely start background romantic music if user hasn't toggled yet
    if (!cutieAudio.getIsPlaying()) {
      cutieAudio.startMusic();
    }
    setTargetMode(mode);
    setIsEntering(true);
    setTimeout(() => {
      onStart(mode);
    }, 700);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 text-center max-w-4xl mx-auto z-10">
      {/* Decorative top badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-300 text-pink-600 font-cute text-sm mb-6 shadow-sm animate-pulse-gentle">
        <Sparkles className="w-4 h-4 text-pink-500" />
        <span>Korean-Style Aesthetic Photobooth</span>
        <Sparkles className="w-4 h-4 text-pink-500" />
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-hand font-bold text-pink-600 tracking-wide drop-shadow-sm mb-3">
        Welcome to Cutie Booth! 🎀
      </h1>
      <p className="text-lg sm:text-2xl font-cute text-pink-900/80 max-w-xl mx-auto mb-8 leading-relaxed">
        A little place to capture your prettiest moments ♡
      </p>

      {/* Cute Photobooth / Camera Illustration */}
      <div className="relative my-4 group">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-3xl bg-gradient-to-br from-pink-200 via-pink-100 to-rose-200 p-4 shadow-xl border-4 border-white flex flex-col items-center justify-center transform transition-transform hover:scale-105 duration-300">
          {/* Booth Roof with Scallops */}
          <div className="absolute -top-5 inset-x-4 h-8 bg-pink-400 rounded-t-2xl border-2 border-white flex items-center justify-around px-2 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-pink-200"></div>
            <div className="w-3 h-3 rounded-full bg-pink-100"></div>
            <div className="w-3 h-3 rounded-full bg-pink-200"></div>
            <div className="w-3 h-3 rounded-full bg-pink-100"></div>
          </div>

          {/* Camera Lens */}
          <div className="relative w-32 h-32 rounded-full bg-white shadow-inner flex items-center justify-center border-4 border-pink-300">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 via-slate-800 to-indigo-950 flex items-center justify-center shadow-md relative overflow-hidden">
              {/* Glass Reflection */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full blur-[2px]"></div>
              <div className="w-10 h-10 rounded-full bg-pink-500/40 border-2 border-pink-300/60 animate-ping" style={{ animationDuration: '3s' }}></div>
              <Camera className="w-8 h-8 text-pink-200 relative z-10" />
            </div>
            {/* Flashing cute indicator LED */}
            <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-rose-400 border border-white animate-pulse"></div>
          </div>

          {/* Cute Bow & Korean Studio Text */}
          <div className="mt-4 flex flex-col items-center">
            <div className="text-3xl select-none animate-float">🎀</div>
            <span className="font-hand font-bold text-pink-700 text-lg tracking-wider">
              셀프 포토부스 ♡ SELF PHOTO
            </span>
          </div>

          {/* Floating mini polaroid preview tags */}
          <div className="absolute -bottom-4 -left-4 bg-white px-3 py-1.5 rounded-xl shadow-md border border-pink-200 text-xs font-cute text-pink-600 rotate-[-8deg] flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-500" />
            <span>16 Pastel Filters</span>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white px-3 py-1.5 rounded-xl shadow-md border border-pink-200 text-xs font-cute text-pink-600 rotate-[8deg] flex items-center gap-1">
            <Film className="w-3.5 h-3.5 text-pink-500" />
            <span>Korean Strips</span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <button
          onClick={() => handleEnter('strip')}
          disabled={isEntering}
          className="w-full sm:flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-cute font-bold text-lg shadow-lg hover:shadow-pink-300/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-white"
        >
          <Film className="w-5 h-5" />
          <span>Korean Photo Strip 🎀</span>
        </button>

        <button
          onClick={() => handleEnter('single')}
          disabled={isEntering}
          className="w-full sm:flex-1 py-4 px-6 rounded-full bg-white text-pink-600 border-2 border-pink-300 font-cute font-bold text-lg shadow-md hover:bg-pink-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-5 h-5 text-pink-500" />
          <span>Single Photo 📷</span>
        </button>
      </div>

      {/* Secondary cute actions */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
        <button
          onClick={onOpenGallery}
          className="px-4 py-2 rounded-full bg-pink-100/90 hover:bg-pink-200 text-pink-700 font-cute flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          <span>My Photo Gallery</span>
        </button>

        <button
          onClick={onOpenCompliment}
          className="px-4 py-2 rounded-full bg-rose-100/90 hover:bg-rose-200 text-rose-700 font-cute flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-rose-400 text-rose-500" />
          <span>A Note For You ♡</span>
        </button>
      </div>

      {/* Small personalized message */}
      <div className="mt-10 pt-4 border-t border-pink-200/60 max-w-xs mx-auto">
        <p className="font-hand text-lg text-pink-500 flex items-center justify-center gap-1.5">
          <span>Made with love, just for you</span>
          <Heart className="w-4 h-4 fill-pink-400 text-pink-500 inline" />
        </p>
      </div>

      {/* Loading overlay when transition into photobooth */}
      {isEntering && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF5F7]/90 backdrop-blur-md animate-fade-in">
          <div className="text-5xl animate-bounce mb-3">🎀</div>
          <div className="flex items-center gap-2 text-pink-600 font-cute text-xl">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Opening photobooth {targetMode === 'strip' ? 'strip studio' : 'camera'}...</span>
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="mt-4 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
