import React, { useState } from 'react';
import {
  Camera,
  Film,
  Heart,
  Sparkles,
  Image as ImageIcon,
  HelpCircle,
  EyeOff,
  Eye,
  Volume2,
} from 'lucide-react';
import { FilterId, FrameId, StripConfig } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CameraView } from './components/CameraView';
import { PhotoStripMode } from './components/PhotoStripMode';
import { PhotoEditor } from './components/PhotoEditor';
import { GalleryView } from './components/GalleryView';
import { ComplimentModal } from './components/ComplimentModal';
import { AudioPlayerControl } from './components/AudioPlayerControl';
import { DeployGuideModal } from './components/DeployGuideModal';
import { FloatingParticles } from './components/FloatingParticles';
import { cutieAudio } from './utils/audio';

type AppView = 'welcome' | 'camera' | 'strip-studio' | 'editor' | 'gallery';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');

  // Single photo captured state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterId>('rosy-cheeks');

  // Strip captured state
  const [stripImages, setStripImages] = useState<string[]>([]);
  const [stripConfig, setStripConfig] = useState<StripConfig | undefined>(undefined);
  const [isStripEditor, setIsStripEditor] = useState<boolean>(false);

  // Modals & Toasts
  const [isComplimentOpen, setIsComplimentOpen] = useState(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shutterBurstCount, setShutterBurstCount] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Handlers
  const handleStartFromWelcome = (mode: 'single' | 'strip') => {
    if (mode === 'single') {
      setCurrentView('camera');
    } else {
      setCurrentView('strip-studio');
    }
  };

  const handlePhotoCaptured = (dataUrl: string, filterId: FilterId) => {
    setCapturedImage(dataUrl);
    setActiveFilter(filterId);
    setIsStripEditor(false);
    setCurrentView('editor');
  };

  const handleCompleteStrip = (images: string[], config: StripConfig) => {
    setStripImages(images);
    setStripConfig(config);
    setIsStripEditor(true);
    setCurrentView('editor');
  };

  const handleShutterTrigger = () => {
    setShutterBurstCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] bg-polka-pattern text-[#4A3B43] flex flex-col justify-between selection:bg-pink-300 relative overflow-x-hidden">
      {/* Floating Sparkles & Hearts Background */}
      <FloatingParticles
        reducedMotion={reducedMotion}
        burstCount={shutterBurstCount}
      />

      {/* Sweet Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-md border-b border-pink-200/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo / Brand */}
          <button
            onClick={() => {
              cutieAudio.playPopSound();
              setCurrentView('welcome');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">🎀</span>
            <div className="flex flex-col text-left">
              <span className="font-hand font-bold text-2xl text-pink-600 leading-none">
                Cutie Booth
              </span>
              <span className="text-[10px] font-cute text-pink-700/80 tracking-wider">
                FOR MY PRETTIEST GIRL ♡
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                cutieAudio.playPopSound();
                setCurrentView('camera');
              }}
              className={`px-3 py-1.5 rounded-full font-cute text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'camera'
                  ? 'bg-pink-500 text-white font-bold shadow-sm'
                  : 'text-stone-700 hover:bg-pink-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Single Photo</span>
            </button>

            <button
              onClick={() => {
                cutieAudio.playPopSound();
                setCurrentView('strip-studio');
              }}
              className={`px-3 py-1.5 rounded-full font-cute text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'strip-studio'
                  ? 'bg-pink-500 text-white font-bold shadow-sm'
                  : 'text-stone-700 hover:bg-pink-100'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photo Strip</span>
            </button>

            <button
              onClick={() => {
                cutieAudio.playPopSound();
                setCurrentView('gallery');
              }}
              className={`px-3 py-1.5 rounded-full font-cute text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'gallery'
                  ? 'bg-pink-500 text-white font-bold shadow-sm'
                  : 'text-stone-700 hover:bg-pink-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gallery</span>
            </button>

            {/* Compliment Shortcut */}
            <button
              onClick={() => {
                cutieAudio.playSparkleSound();
                setIsComplimentOpen(true);
              }}
              className="p-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-rose-500 transition-colors cursor-pointer"
              title="A sweet love note for you ♡"
            >
              <Heart className="w-4 h-4 fill-pink-400" />
            </button>

            {/* Share App Link Button */}
            <button
              onClick={async () => {
                cutieAudio.playSparkleSound();
                try {
                  const shareUrl = window.location.href;
                  if (navigator.clipboard) {
                    await navigator.clipboard.writeText(shareUrl);
                  }
                  setShowCopyToast(true);
                  setTimeout(() => setShowCopyToast(false), 3500);
                } catch {
                  // Fallback
                }
              }}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-pink-700 font-cute text-xs border border-pink-200 transition-colors cursor-pointer"
              title="Copy shareable link"
            >
              <span>Share Link 🎀</span>
            </button>

            {/* Audio Player Control */}
            <AudioPlayerControl />
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 relative z-10 flex flex-col justify-center">
        {currentView === 'welcome' && (
          <WelcomeScreen
            onStart={handleStartFromWelcome}
            onOpenGallery={() => setCurrentView('gallery')}
            onOpenCompliment={() => setIsComplimentOpen(true)}
          />
        )}

        {currentView === 'camera' && (
          <CameraView
            onPhotoCaptured={handlePhotoCaptured}
            onShutterTriggered={handleShutterTrigger}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}

        {currentView === 'strip-studio' && (
          <PhotoStripMode
            onCompleteStrip={handleCompleteStrip}
            onCancel={() => setCurrentView('welcome')}
          />
        )}

        {currentView === 'editor' && (
          <PhotoEditor
            photoSrc={isStripEditor ? stripImages : capturedImage || ''}
            isStrip={isStripEditor}
            initialFilterId={isStripEditor ? stripConfig?.filterId : activeFilter}
            initialFrameId={isStripEditor ? stripConfig?.frameId : 'polaroid-classic'}
            stripConfig={stripConfig}
            onBack={() => setCurrentView(isStripEditor ? 'strip-studio' : 'camera')}
            onSavedToGallery={() => setCurrentView('gallery')}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryView
            onBackToBooth={() => setCurrentView('camera')}
          />
        )}
      </main>

      {/* Toast Notification for Link Copy */}
      {showCopyToast && (
        <div className="fixed bottom-16 inset-x-0 mx-auto w-fit z-50 px-5 py-2.5 rounded-full bg-pink-600 text-white font-cute text-sm shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-200" />
          <span>Cutie Booth link copied! Send it to her ♡ 🎀</span>
        </div>
      )}

      {/* Modals */}
      <ComplimentModal
        isOpen={isComplimentOpen}
        onClose={() => setIsComplimentOpen(false)}
      />

      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full py-4 px-4 border-t border-pink-200/60 bg-white/50 backdrop-blur-sm relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-cute text-pink-700/80">
          <p className="flex items-center gap-1.5">
            <span>A little corner of happiness, made with love</span>
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-500 inline" />
          </p>

          <div className="flex items-center gap-3">
            {/* Deploy instructions link */}
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="text-pink-600 hover:text-pink-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to Host & Share Link</span>
            </button>

            {/* Reduce motion toggle */}
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className="text-stone-500 hover:text-pink-600 flex items-center gap-1 cursor-pointer"
              title={reducedMotion ? 'Enable floating hearts' : 'Disable floating hearts'}
            >
              {reducedMotion ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{reducedMotion ? 'Motion: Off' : 'Motion: On'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
