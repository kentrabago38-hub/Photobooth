import React from 'react';
import { X, Globe, ExternalLink, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-pink-200 text-stone-800 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-pink-600 mb-2">
          <Globe className="w-5 h-5" />
          <span className="font-cute font-bold text-xs uppercase tracking-wider">
            Share Cutie Booth Online
          </span>
        </div>

        <h3 className="text-2xl font-hand font-bold text-pink-700 mb-2">
          How to Publish & Share With Her 🎀
        </h3>
        <p className="text-xs font-cute text-stone-600 leading-relaxed mb-6">
          To let her open Cutie Booth directly on her iPhone, Android, or laptop, you can deploy it in less than 2 minutes for free on Vercel or Netlify with HTTPS enabled (required for mobile camera access).
        </p>

        {/* Option 1: Vercel */}
        <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cute font-bold text-sm text-pink-900 flex items-center gap-1.5">
              <span>Option A: Deploy to Vercel (Recommended)</span>
            </span>
            <span className="text-[10px] bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full font-cute">
              Free & 1-Click
            </span>
          </div>
          <ol className="text-xs font-cute text-stone-700 space-y-1.5 list-decimal list-inside pl-1">
            <li>Push this repository or upload the project to GitHub.</li>
            <li>Go to <span className="font-semibold text-pink-600">vercel.com</span> and click "Add New Project".</li>
            <li>Import the repo — Vercel detects Vite automatically (Build Command: <code className="bg-pink-100 px-1 rounded">npm run build</code>, Output: <code className="bg-pink-100 px-1 rounded">dist</code>).</li>
            <li>Click <strong>Deploy</strong>. You will get a shareable link like <code className="text-pink-600">cutie-booth.vercel.app</code> to send to her!</li>
          </ol>
        </div>

        {/* Option 2: Netlify */}
        <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cute font-bold text-sm text-pink-900">
              Option B: Deploy to Netlify
            </span>
            <span className="text-[10px] bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full font-cute">
              Drag & Drop
            </span>
          </div>
          <ol className="text-xs font-cute text-stone-700 space-y-1.5 list-decimal list-inside pl-1">
            <li>Run <code className="bg-pink-100 px-1 rounded">npm run build</code> to create the production <code className="bg-pink-100 px-1 rounded">dist</code> directory.</li>
            <li>Go to <span className="font-semibold text-pink-600">app.netlify.com/drop</span> and drag the <code className="bg-pink-100 px-1 rounded">dist</code> folder onto the browser.</li>
            <li>Your site goes live instantly with automatic HTTPS!</li>
          </ol>
        </div>

        {/* Camera HTTPS Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-cute">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Camera Security:</strong> Modern mobile browsers require HTTPS for camera permissions. Both Vercel and Netlify supply free automatic SSL certificates, so her camera will work seamlessly!
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-cute font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Got it, thank you! ♡
          </button>
        </div>
      </div>
    </div>
  );
};
