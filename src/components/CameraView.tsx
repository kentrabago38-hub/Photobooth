import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, Sparkles, Shuffle, Upload, AlertCircle, RefreshCw, Timer } from 'lucide-react';
import { FilterId } from '../types';
import { PHOTO_FILTERS, getFilterById } from '../utils/filters';
import { cutieAudio } from '../utils/audio';

interface CameraViewProps {
  onPhotoCaptured: (dataUrl: string, filterId: FilterId) => void;
  onShutterTriggered?: () => void;
  activeFilter: FilterId;
  onFilterChange: (id: FilterId) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotoCaptured,
  onShutterTriggered,
  activeFilter,
  onFilterChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);

  // Timer: 0, 3, 5, 10 seconds
  const [countdownDuration, setCountdownDuration] = useState<number>(3);
  const [countdownCurrent, setCountdownCurrent] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Check for camera devices
  const checkCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }
    } catch {
      // Ignore if enumeration is restricted
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    setIsLoadingCamera(true);
    setCameraError(null);

    // Stop existing tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support live webcam access. You can upload any photo instead!');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch((e) => console.log('Video play interrupted:', e));
      }

      await checkCameraDevices();
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.warn('Camera access issue:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera access was denied. Please allow camera permissions in your browser bar, or upload a cute photo below!'
        );
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload any photo from your gallery below!');
      } else {
        setCameraError(
          error.message || 'Unable to access the camera right now. You can upload a photo to continue decorating!'
        );
      }
    } finally {
      setIsLoadingCamera(false);
    }
  }, [checkCameraDevices, stream]);

  // Start on mount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Flip camera
  const handleFlipCamera = () => {
    cutieAudio.playPopSound();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Perform actual photo capture from video frame
  const executeCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger flash animation
    setIsFlashing(true);
    cutieAudio.playShutterSound();
    if (onShutterTriggered) onShutterTriggered();

    setTimeout(() => {
      setIsFlashing(false);
    }, 400);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Mirror if front-facing user camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      onPhotoCaptured(dataUrl, activeFilter);
    }
  };

  // Countdown timer trigger
  const handleCaptureClick = () => {
    if (countdownCurrent !== null) return; // already counting down

    if (countdownDuration === 0) {
      executeCapture();
      return;
    }

    let remaining = countdownDuration;
    setCountdownCurrent(remaining);
    cutieAudio.playCountdownBeep(false);

    const interval = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdownCurrent(remaining);
        cutieAudio.playCountdownBeep(false);
      } else {
        clearInterval(interval);
        setCountdownCurrent(null);
        cutieAudio.playCountdownBeep(true);
        executeCapture();
      }
    }, 1000);
  };

  // Upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        cutieAudio.playSparkleSound();
        onPhotoCaptured(result, activeFilter);
      }
    };
    reader.readAsDataURL(file);
  };

  // Random filter selector
  const handleRandomFilter = () => {
    cutieAudio.playPopSound();
    const otherFilters = PHOTO_FILTERS.filter((f) => f.id !== activeFilter);
    const random = otherFilters[Math.floor(Math.random() * otherFilters.length)];
    onFilterChange(random.id);
  };

  const currentFilterDef = getFilterById(activeFilter);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
      {/* Camera Viewfinder Card */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] bg-pink-950/90 rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex items-center justify-center">
        {/* Shutter Flash Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 camera-flash pointer-events-none"></div>
        )}

        {/* Live Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-all duration-300 ${
            facingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
          style={{
            filter: currentFilterDef.cssFilter !== 'none' ? currentFilterDef.cssFilter : undefined,
          }}
        />

        {/* Live Tint Overlay */}
        {currentFilterDef.tintOverlay && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-colors duration-300"
            style={{ backgroundColor: currentFilterDef.tintOverlay }}
          ></div>
        )}

        {/* Live Dreamy Glow Soft Layer */}
        {currentFilterDef.hasGlow && (
          <div className="absolute inset-0 pointer-events-none z-10 bg-pink-100/15 mix-blend-screen backdrop-blur-[0.5px]"></div>
        )}

        {/* Viewfinder Cute Corner Crosshairs */}
        <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-white/70 rounded-tl-lg pointer-events-none z-20"></div>
        <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-white/70 rounded-tr-lg pointer-events-none z-20"></div>
        <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-white/70 rounded-bl-lg pointer-events-none z-20"></div>
        <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-white/70 rounded-br-lg pointer-events-none z-20"></div>

        {/* Current Active Filter Badge */}
        <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-20">
          <div className="px-3.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white font-cute text-xs border border-white/20 shadow flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            <span>Filter: {currentFilterDef.name}</span>
          </div>
        </div>

        {/* Big Countdown Number Overlay */}
        {countdownCurrent !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="w-28 h-28 rounded-full bg-white/90 text-pink-600 font-hand font-bold text-7xl flex items-center justify-center shadow-2xl animate-bounce border-4 border-pink-300">
              {countdownCurrent}
            </div>
          </div>
        )}

        {/* Camera Flip button on top-right of viewfinder */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {hasMultipleCameras && (
            <button
              onClick={handleFlipCamera}
              className="p-2.5 rounded-full bg-white/80 hover:bg-white text-pink-700 shadow-md backdrop-blur-sm transition-transform active:scale-90 cursor-pointer"
              title="Flip camera"
              aria-label="Flip camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Loading / Error states */}
        {isLoadingCamera && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-pink-100/90 text-pink-600">
            <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-cute text-sm">Warming up the cutie camera... ♡</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-pink-50/95 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold font-hand text-xl text-pink-800 mb-1">Camera Permission Needed</h4>
            <p className="text-xs text-pink-700/80 max-w-sm mb-4 leading-relaxed">{cameraError}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-full bg-pink-500 text-white font-cute text-xs shadow hover:bg-pink-600 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-white border border-pink-300 text-pink-700 font-cute text-xs shadow hover:bg-pink-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo Instead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Primary Camera Control Bar */}
      <div className="w-full flex items-center justify-between px-2 sm:px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl border border-pink-200/80 shadow-sm gap-2">
        {/* Countdown Timer Selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-cute text-pink-700 flex items-center gap-1 mr-1">
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timer:</span>
          </span>
          {[0, 3, 5, 10].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                cutieAudio.playPopSound();
                setCountdownDuration(sec);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-cute font-medium transition-all cursor-pointer ${
                countdownDuration === sec
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
              }`}
            >
              {sec === 0 ? 'Off' : `${sec}s`}
            </button>
          ))}
        </div>

        {/* Big Shutter Button */}
        <div className="flex items-center">
          <button
            onClick={handleCaptureClick}
            disabled={countdownCurrent !== null || isLoadingCamera}
            className="group relative p-1.5 rounded-full bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-300 shadow-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
            aria-label="Take picture"
            title="Take picture"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-white flex items-center justify-center bg-white/20 group-hover:bg-white/30 transition-colors">
              <Camera className="w-8 h-8 text-white fill-white/20" />
            </div>
          </button>
        </div>

        {/* Upload & Random filter actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRandomFilter}
            className="p-2.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-cute text-xs transition-colors flex items-center gap-1 cursor-pointer"
            title="Pick a random filter"
          >
            <Shuffle className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Random</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-cute text-xs transition-colors cursor-pointer"
            title="Upload photo from device"
          >
            <Upload className="w-4 h-4 text-pink-500" />
          </button>
        </div>
      </div>

      {/* Filter Selection Panel (16 Live Filters) */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-cute font-bold text-sm text-pink-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            Live Filters ({PHOTO_FILTERS.length})
          </span>
          <span className="text-xs text-pink-600 font-cute">
            {currentFilterDef.name} — {currentFilterDef.description}
          </span>
        </div>

        {/* Horizontal scrollable thumbnails */}
        <div className="w-full flex items-center gap-2.5 overflow-x-auto pb-2 px-1 pt-1 no-scrollbar">
          {PHOTO_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  cutieAudio.playPopSound();
                  onFilterChange(filter.id);
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-pink-200/90 ring-2 ring-pink-500 scale-105 shadow-md'
                    : 'bg-white/60 hover:bg-white/90 hover:scale-102 border border-pink-200'
                }`}
              >
                {/* Cute color preview circle */}
                <div
                  className="w-12 h-12 rounded-xl border-2 border-white shadow-inner flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: filter.previewColor,
                  }}
                >
                  <span className="text-xs font-hand font-bold text-pink-800/80">
                    {filter.name.slice(0, 3)}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-cute px-1 whitespace-nowrap ${
                    isSelected ? 'font-bold text-pink-800' : 'text-stone-600'
                  }`}
                >
                  {filter.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
