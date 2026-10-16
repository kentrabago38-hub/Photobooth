import { FilterId, FrameId, PlacedSticker, StripConfig } from '../types';
import { getFilterById } from './filters';
import { FRAMES, STICKERS } from './stickersAndFrames';

// Load image helper
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// Convert SVG string to data URL image
const svgImageCache = new Map<string, HTMLImageElement>();
export async function getStickerImage(svgContent: string): Promise<HTMLImageElement> {
  if (svgImageCache.has(svgContent)) {
    return svgImageCache.get(svgContent)!;
  }
  const cleanSvg = svgContent.trim();
  const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = await loadImage(url);
  svgImageCache.set(svgContent, img);
  return img;
}

// Apply procedural grain onto canvas
function applyCanvasGrain(ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.05) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}

// Draw cute frame decorations
async function drawFrameOnCanvas(
  ctx: CanvasRenderingContext2D,
  frameId: FrameId,
  width: number,
  height: number,
  caption?: string
) {
  if (frameId === 'none') return;

  ctx.save();

  if (frameId === 'polaroid-classic') {
    // Polaroid border is already laid out by inner image sizing, but we add paper texture and caption
    if (caption) {
      ctx.fillStyle = '#4A3B43';
      ctx.font = 'bold 36px "Gaegu", "Shantell Sans", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(caption, width / 2, height - 36);
    }
  } else if (frameId === 'pink-ribbon') {
    // Soft pink border with ribbons on top corners
    ctx.lineWidth = 24;
    ctx.strokeStyle = '#FFCCD5';
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Inner dashed dainty line
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF85A2';
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(28, 28, width - 56, height - 56);
    ctx.setLineDash([]);

    // Draw pink bow stickers at top-left and top-right
    const bowSticker = STICKERS.find((s) => s.id === 'bow-pink');
    if (bowSticker) {
      const bowImg = await getStickerImage(bowSticker.svgContent);
      ctx.drawImage(bowImg, 10, 10, 90, 90);
      ctx.drawImage(bowImg, width - 100, 10, 90, 90);
    }
  } else if (frameId === 'heart-corners') {
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#FFE5EC';
    ctx.strokeRect(10, 10, width - 20, height - 20);

    const heartSticker = STICKERS.find((s) => s.id === 'heart-sparkle');
    if (heartSticker) {
      const hImg = await getStickerImage(heartSticker.svgContent);
      const size = 75;
      ctx.drawImage(hImg, 10, 10, size, size);
      ctx.drawImage(hImg, width - 10 - size, 10, size, size);
      ctx.drawImage(hImg, 10, height - 10 - size, size, size);
      ctx.drawImage(hImg, width - 10 - size, height - 10 - size, size, size);
    }
  } else if (frameId === 'korean-studio') {
    // Clean modern Korean photobooth frame
    ctx.lineWidth = 22;
    ctx.strokeStyle = '#FFF8F0';
    ctx.strokeRect(11, 11, width - 22, height - 22);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#E2D9D2';
    ctx.strokeRect(26, 26, width - 52, height - 52);

    // Stamp at bottom right
    ctx.fillStyle = '#FF7096';
    ctx.font = 'bold 22px "Nunito", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('CUTIE BOOTH 🎀 포토부스', width - 36, height - 34);
  } else if (frameId === 'cute-flowers') {
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#D0F4DE';
    ctx.strokeRect(9, 9, width - 18, height - 18);

    const flower = STICKERS.find((s) => s.id === 'daisy-flower');
    if (flower) {
      const fImg = await getStickerImage(flower.svgContent);
      const size = 64;
      ctx.drawImage(fImg, 10, 10, size, size);
      ctx.drawImage(fImg, width - 10 - size, 10, size, size);
      ctx.drawImage(fImg, 10, height - 10 - size, size, size);
      ctx.drawImage(fImg, width - 10 - size, height - 10 - size, size, size);
      ctx.drawImage(fImg, width / 2 - size / 2, 8, size, size);
    }
  } else if (frameId === 'sparkle-stars') {
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#E8DFF5';
    ctx.strokeRect(9, 9, width - 18, height - 18);

    const star = STICKERS.find((s) => s.id === 'sparkle-gold');
    if (star) {
      const sImg = await getStickerImage(star.svgContent);
      const size = 65;
      ctx.drawImage(sImg, 10, 10, size, size);
      ctx.drawImage(sImg, width - 10 - size, 10, size, size);
      ctx.drawImage(sImg, 10, height - 10 - size, size, size);
      ctx.drawImage(sImg, width - 10 - size, height - 10 - size, size, size);
    }
  } else if (frameId === 'pastel-scrapbook') {
    // Washi tape in corners
    ctx.fillStyle = 'rgba(255, 182, 193, 0.75)';
    // Top-left tape rotated
    ctx.save();
    ctx.translate(50, 40);
    ctx.rotate(-Math.PI / 6);
    ctx.fillRect(-50, -14, 100, 28);
    ctx.restore();

    // Top-right tape
    ctx.fillStyle = 'rgba(204, 226, 254, 0.75)';
    ctx.save();
    ctx.translate(width - 50, 40);
    ctx.rotate(Math.PI / 6);
    ctx.fillRect(-50, -14, 100, 28);
    ctx.restore();
  } else if (frameId === 'strawberry-sweet') {
    ctx.lineWidth = 22;
    ctx.strokeStyle = '#FFE3E8';
    ctx.strokeRect(11, 11, width - 22, height - 22);

    const berry = STICKERS.find((s) => s.id === 'strawberry');
    if (berry) {
      const bImg = await getStickerImage(berry.svgContent);
      const size = 64;
      ctx.drawImage(bImg, 14, 14, size, size);
      ctx.drawImage(bImg, width - 14 - size, 14, size, size);
      ctx.drawImage(bImg, 14, height - 14 - size, size, size);
      ctx.drawImage(bImg, width - 14 - size, height - 14 - size, size, size);
    }
  } else if (frameId === 'minimal-clean') {
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#FFF0F5';
    ctx.strokeRect(6, 6, width - 12, height - 12);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FF85A2';
    ctx.strokeRect(18, 18, width - 36, height - 36);
  }

  ctx.restore();
}

// Render a single photo with filter, frame, and stickers
export async function renderSinglePhotoCanvas(params: {
  imageSrc: string;
  filterId: FilterId;
  frameId: FrameId;
  stickers: PlacedSticker[];
  caption?: string;
}): Promise<string> {
  const { imageSrc, filterId, frameId, stickers, caption } = params;
  const baseImg = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  let targetWidth = 1080;
  let targetHeight = 1080;

  // Polaroid framing needs extra bottom margin
  const isPolaroid = frameId === 'polaroid-classic';
  const paddingX = isPolaroid ? 64 : 0;
  const paddingTop = isPolaroid ? 64 : 0;
  const paddingBottom = isPolaroid ? 180 : 0;

  if (isPolaroid) {
    targetWidth = 1080;
    targetHeight = 1280;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Calculate inner photo box
  const photoX = paddingX;
  const photoY = paddingTop;
  const photoW = targetWidth - paddingX * 2;
  const photoH = targetHeight - paddingTop - paddingBottom;

  // Draw filtered camera image
  ctx.save();
  const filterDef = getFilterById(filterId);

  // Apply CSS filter directly to canvas if supported
  if ('filter' in ctx && filterDef.cssFilter !== 'none') {
    ctx.filter = filterDef.cssFilter;
  }

  // Draw image cropped to fill photo box
  const imgAspect = baseImg.width / baseImg.height;
  const boxAspect = photoW / photoH;
  let sx = 0,
    sy = 0,
    sw = baseImg.width,
    sh = baseImg.height;

  if (imgAspect > boxAspect) {
    sw = baseImg.height * boxAspect;
    sx = (baseImg.width - sw) / 2;
  } else {
    sh = baseImg.width / boxAspect;
    sy = (baseImg.height - sh) / 2;
  }

  ctx.drawImage(baseImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
  ctx.restore();

  // Reset filter
  if ('filter' in ctx) {
    ctx.filter = 'none';
  }

  // Apply tint overlay if configured
  if (filterDef.tintOverlay) {
    ctx.save();
    ctx.fillStyle = filterDef.tintOverlay;
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.restore();
  }

  // Apply grain if filter specifies
  if (filterDef.hasGrain) {
    applyCanvasGrain(ctx, targetWidth, targetHeight, 0.04);
  }

  // Draw Frame
  await drawFrameOnCanvas(ctx, frameId, targetWidth, targetHeight, caption);

  // Draw Placed Stickers
  for (const placed of stickers) {
    const stickerDef = STICKERS.find((s) => s.id === placed.stickerId);
    if (!stickerDef) continue;

    try {
      const stickerImg = await getStickerImage(stickerDef.svgContent);
      ctx.save();

      // Convert percentage coordinates (0-100) to actual canvas pixel coords
      const centerX = (placed.x / 100) * targetWidth;
      const centerY = (placed.y / 100) * targetHeight;
      const baseSize = 160;
      const renderSize = baseSize * placed.scale;

      ctx.translate(centerX, centerY);
      ctx.rotate((placed.rotation * Math.PI) / 180);
      ctx.drawImage(
        stickerImg,
        -renderSize / 2,
        -renderSize / 2,
        renderSize,
        renderSize
      );

      ctx.restore();
    } catch (e) {
      console.warn('Failed to render sticker:', placed.stickerId, e);
    }
  }

  return canvas.toDataURL('image/png', 0.95);
}

// Render complete Korean Photostrip Canvas
export async function renderPhotoStripCanvas(params: {
  images: string[];
  config: StripConfig;
  stickers: PlacedSticker[];
}): Promise<string> {
  const { images, config, stickers } = params;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const { layout, backgroundColor, caption, showDate, dateText, filterId, frameId } = config;

  let canvasW = 900;
  let canvasH = 2600;

  if (layout === 'vertical-2') {
    canvasW = 800;
    canvasH = 1500;
  } else if (layout === 'vertical-3') {
    canvasW = 800;
    canvasH = 2100;
  } else if (layout === 'vertical-4') {
    canvasW = 800;
    canvasH = 2700;
  } else if (layout === 'grid-2x2') {
    canvasW = 1600;
    canvasH = 1750;
  }

  canvas.width = canvasW;
  canvas.height = canvasH;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Decorative border on strip
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.strokeRect(10, 10, canvasW - 20, canvasH - 20);

  // Header Title at top
  ctx.fillStyle = '#4A3B43';
  ctx.font = 'bold 38px "Shantell Sans", "Gaegu", cursive';
  ctx.textAlign = 'center';
  ctx.fillText('🎀 CUTIE BOOTH 🎀', canvasW / 2, 70);

  const filterDef = getFilterById(filterId);

  // Compute cell layout
  const marginX = 60;
  const marginTop = 100;
  const marginBottom = 200;

  const photoBoxes: { x: number; y: number; w: number; h: number }[] = [];

  if (layout === 'grid-2x2') {
    const gap = 36;
    const availableW = canvasW - marginX * 2 - gap;
    const cellW = availableW / 2;
    const cellH = cellW * 0.95;

    photoBoxes.push(
      { x: marginX, y: marginTop, w: cellW, h: cellH },
      { x: marginX + cellW + gap, y: marginTop, w: cellW, h: cellH },
      { x: marginX, y: marginTop + cellH + gap, w: cellW, h: cellH },
      { x: marginX + cellW + gap, y: marginTop + cellH + gap, w: cellW, h: cellH }
    );
  } else {
    // Vertical strip
    const count = layout === 'vertical-2' ? 2 : layout === 'vertical-3' ? 3 : 4;
    const availableH = canvasH - marginTop - marginBottom;
    const gap = 30;
    const cellH = (availableH - gap * (count - 1)) / count;
    const cellW = canvasW - marginX * 2;

    for (let i = 0; i < count; i++) {
      photoBoxes.push({
        x: marginX,
        y: marginTop + i * (cellH + gap),
        w: cellW,
        h: cellH,
      });
    }
  }

  // Draw each photo inside its box
  for (let i = 0; i < photoBoxes.length; i++) {
    const box = photoBoxes[i];
    const imgSrc = images[i] || images[0];
    if (!imgSrc) continue;

    const img = await loadImage(imgSrc);

    // Draw white polaroid backing around cell
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(box.x - 10, box.y - 10, box.w + 20, box.h + 20, 16);
    ctx.fill();
    ctx.restore();

    // Clip to rounded photo cell
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 12);
    ctx.clip();

    // Apply Filter
    if ('filter' in ctx && filterDef.cssFilter !== 'none') {
      ctx.filter = filterDef.cssFilter;
    }

    // Cover image into box
    const imgAspect = img.width / img.height;
    const boxAspect = box.w / box.h;
    let sx = 0,
      sy = 0,
      sw = img.width,
      sh = img.height;

    if (imgAspect > boxAspect) {
      sw = img.height * boxAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxAspect;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, box.x, box.y, box.w, box.h);

    if (filterDef.tintOverlay) {
      ctx.fillStyle = filterDef.tintOverlay;
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }

    ctx.restore();
  }

  // Apply grain if filter has grain
  if (filterDef.hasGrain) {
    applyCanvasGrain(ctx, canvasW, canvasH, 0.035);
  }

  // Draw Frame overlay if chosen
  await drawFrameOnCanvas(ctx, frameId, canvasW, canvasH);

  // Footer Caption and Date
  ctx.save();
  ctx.fillStyle = '#4A3B43';
  ctx.textAlign = 'center';

  if (caption) {
    ctx.font = 'bold 36px "Gaegu", "Shantell Sans", cursive';
    ctx.fillText(caption, canvasW / 2, canvasH - 100);
  }

  if (showDate && dateText) {
    ctx.font = '22px "Nunito", sans-serif';
    ctx.fillStyle = '#786872';
    ctx.fillText(dateText, canvasW / 2, canvasH - 55);
  }

  // Bottom sweet heart doodle
  ctx.fillStyle = '#FF7096';
  ctx.font = '26px sans-serif';
  ctx.fillText('♡ cutie booth ♡', canvasW / 2, canvasH - 24);
  ctx.restore();

  // Draw Stickers
  for (const placed of stickers) {
    const stickerDef = STICKERS.find((s) => s.id === placed.stickerId);
    if (!stickerDef) continue;

    try {
      const stickerImg = await getStickerImage(stickerDef.svgContent);
      ctx.save();
      const centerX = (placed.x / 100) * canvasW;
      const centerY = (placed.y / 100) * canvasH;
      const baseSize = 140;
      const renderSize = baseSize * placed.scale;

      ctx.translate(centerX, centerY);
      ctx.rotate((placed.rotation * Math.PI) / 180);
      ctx.drawImage(
        stickerImg,
        -renderSize / 2,
        -renderSize / 2,
        renderSize,
        renderSize
      );
      ctx.restore();
    } catch (e) {
      console.warn('Failed to draw strip sticker:', e);
    }
  }

  return canvas.toDataURL('image/png', 0.95);
}
