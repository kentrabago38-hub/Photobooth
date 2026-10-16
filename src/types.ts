export type FilterId =
  | 'original'
  | 'softie'
  | 'rosy-cheeks'
  | 'strawberry-milk'
  | 'vintage-film'
  | 'retro-90s'
  | 'dreamy-glow'
  | 'lavender-haze'
  | 'honey'
  | 'black-white'
  | 'polaroid'
  | 'kawaii'
  | 'midnight'
  | 'peachy'
  | 'cinnamon'
  | 'cool-girl';

export interface FilterDefinition {
  id: FilterId;
  name: string;
  description: string;
  cssFilter: string;
  previewColor: string;
  tintOverlay?: string; // hex or rgba overlay
  hasGrain?: boolean;
  hasGlow?: boolean;
}

export type FrameId =
  | 'none'
  | 'polaroid-classic'
  | 'pink-ribbon'
  | 'heart-corners'
  | 'cute-flowers'
  | 'sparkle-stars'
  | 'korean-studio'
  | 'pastel-scrapbook'
  | 'strawberry-sweet'
  | 'minimal-clean';

export interface FrameDefinition {
  id: FrameId;
  name: string;
  description: string;
  category: 'cute' | 'classic' | 'aesthetic';
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0.5 to 2.5
  rotation: number; // -180 to 180 degrees
}

export interface StickerDefinition {
  id: string;
  name: string;
  category: 'bows' | 'hearts' | 'sweets' | 'sparkles' | 'cute';
  svgContent: string;
}

export type StripLayout = 'vertical-2' | 'vertical-3' | 'vertical-4' | 'grid-2x2';

export interface StripConfig {
  layout: StripLayout;
  backgroundColor: string;
  caption: string;
  showDate: boolean;
  dateText: string;
  filterId: FilterId;
  frameId: FrameId;
}

export interface CapturedPhoto {
  id: string;
  timestamp: number;
  dataUrl: string; // Base64 image
  thumbnailUrl?: string;
  type: 'single' | 'strip';
  filterId: FilterId;
  frameId: FrameId;
  stickers: PlacedSticker[];
  caption?: string;
  isFavorite: boolean;
}
