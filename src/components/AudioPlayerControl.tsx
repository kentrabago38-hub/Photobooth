import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { cutieAudio } from '../utils/audio';

export const AudioPlayerControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    setIsPlaying(cutieAudio.getIsPlaying());
    setIsMuted(cutieAudio.getIsMuted());
    setVolume(cutieAudio.getVolume());
  }, []);

  const handleToggleMusic = () => {
    const active = cutieAudio.toggleMusic();
    setIsPlaying(active);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    cutieAudio.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    cutieAudio.setVolume(val);
    if (isMuted && val > 0) {
      cutieAudio.setMuted(false);
      setIsMuted(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-pink-200/80 text-xs">
      {/* Music Play/Pause button */}
      <button
        onClick={handleToggleMusic}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-cute transition-all cursor-pointer ${
          isPlaying
            ? 'bg-pink-100 text-pink-700 shadow-inner'
            : 'text-stone-600 hover:text-pink-600 hover:bg-pink-50'
        }`}
        title={isPlaying ? 'Pause romantic music' : 'Play cute romantic music box melody'}
      >
        <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin text-pink-500' : ''}`} style={{ animationDuration: '4s' }} />
        <span className="hidden sm:inline">{isPlaying ? 'Music: On' : 'Music: Off'}</span>
      </button>

      {/* Mute button */}
      <button
        onClick={handleToggleMute}
        className="p-1.5 text-stone-600 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
        title={isMuted ? 'Unmute sounds' : 'Mute all sounds'}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {/* Volume button to expand slider */}
      <div className="relative">
        <button
          onClick={() => setShowSlider(!showSlider)}
          className="p-1 text-stone-500 hover:text-pink-600 rounded cursor-pointer"
          title="Adjust volume"
        >
          <Music className="w-3 h-3" />
        </button>

        {showSlider && (
          <div className="absolute right-0 bottom-full mb-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-pink-200 w-36 flex flex-col gap-1 z-50 animate-fade-in">
            <div className="flex justify-between items-center text-[11px] font-cute text-pink-700">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-pink-500 h-1.5 bg-pink-100 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
