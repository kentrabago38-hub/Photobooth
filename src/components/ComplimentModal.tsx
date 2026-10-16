import React, { useState } from 'react';
import { Heart, Sparkles, X, RefreshCw } from 'lucide-react';
import { cutieAudio } from '../utils/audio';

interface ComplimentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMPLIMENTS = [
  'How can someone be this pretty? ♡',
  'The camera is lucky to see you.',
  'Certified cutie of the day 🎀',
  'Your smile deserves its own photostrip.',
  'Someone made this little place just for you. 💗',
  'You shine brighter than all the sparkles in this photobooth! ✨',
  '100% pure sunshine and sweetness ♡',
  'Warning: Extreme cuteness detected on camera! 🧸',
  'Every single angle of you is pure art 🌸',
  'No filter needed, you are naturally the prettiest girl ever ♡',
  'My favorite picture in the world is any picture of you. 🍓',
  'You make ordinary days feel like fairy tales ✧',
];

export const ComplimentModal: React.FC<ComplimentModalProps> = ({ isOpen, onClose }) => {
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    cutieAudio.playSparkleSound();
    setIndex((prev) => (prev + 1) % COMPLIMENTS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FFF9FB] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-pink-200 text-center overflow-hidden">
        {/* Background decorative doodles */}
        <div className="absolute top-2 left-3 text-pink-200 text-2xl select-none">🎀</div>
        <div className="absolute bottom-3 right-4 text-pink-200 text-2xl select-none">✨</div>
        <div className="absolute top-3 right-12 text-pink-200 text-xl select-none">🌸</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cute Icon header */}
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-pink-100 text-pink-500 shadow-inner">
          <Heart className="w-8 h-8 fill-pink-400 text-pink-500 animate-pulse-gentle" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold font-hand text-pink-600 mb-2">
          A Note For My Favorite Girl 💌
        </h3>

        {/* Compliment Card */}
        <div className="my-6 p-6 bg-white/90 rounded-2xl border-2 border-dashed border-pink-300 shadow-sm relative">
          <Sparkles className="w-4 h-4 text-amber-400 absolute top-2 left-2 animate-spin" style={{ animationDuration: '6s' }} />
          <p className="text-lg sm:text-xl font-cute text-pink-900 leading-relaxed min-h-[70px] flex items-center justify-center">
            "{COMPLIMENTS[index]}"
          </p>
          <Sparkles className="w-4 h-4 text-amber-400 absolute bottom-2 right-2 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-cute font-medium shadow-md hover:from-pink-500 hover:to-rose-500 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Another Sweet Note ♡
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-pink-100 text-pink-700 font-cute font-medium hover:bg-pink-200 active:scale-95 transition-all cursor-pointer"
          >
            You're the sweetest 🎀
          </button>
        </div>
      </div>
    </div>
  );
};
