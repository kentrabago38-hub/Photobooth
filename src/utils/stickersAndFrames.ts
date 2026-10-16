import { FrameDefinition, FrameId, StickerDefinition } from '../types';

export const FRAMES: FrameDefinition[] = [
  {
    id: 'none',
    name: 'No Frame',
    description: 'Clean edge to edge',
    category: 'minimal-clean' as unknown as 'classic',
  },
  {
    id: 'polaroid-classic',
    name: 'Classic Polaroid',
    description: 'Nostalgic white photo card with bottom margin',
    category: 'classic',
  },
  {
    id: 'pink-ribbon',
    name: 'Pink Ribbons & Bows',
    description: 'Cute pastel pink border adorned with dainty ribbons',
    category: 'cute',
  },
  {
    id: 'heart-corners',
    name: 'Heart Corners',
    description: 'Soft pink trim with blushing corner hearts',
    category: 'cute',
  },
  {
    id: 'korean-studio',
    name: 'Korean Studio',
    description: 'Minimalist aesthetic with Korean photo seal',
    category: 'aesthetic',
  },
  {
    id: 'cute-flowers',
    name: 'Flower Border',
    description: 'Daisies, cherry blossoms and gentle leaves',
    category: 'cute',
  },
  {
    id: 'sparkle-stars',
    name: 'Sparkle Stars',
    description: 'Dreamy glitter and magical twinkling stars',
    category: 'aesthetic',
  },
  {
    id: 'pastel-scrapbook',
    name: 'Pastel Scrapbook',
    description: 'Washi tape corners and soft paper texture border',
    category: 'aesthetic',
  },
  {
    id: 'strawberry-sweet',
    name: 'Strawberry Milk',
    description: 'Creamy pink border with sweet strawberries',
    category: 'cute',
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Ultra thin cream & rose border with delicate rounded corners',
    category: 'classic',
  },
];

export const STICKERS: StickerDefinition[] = [
  // Bows & Ribbons
  {
    id: 'bow-pink',
    name: 'Pink Satin Bow',
    category: 'bows',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 48C45 35 25 30 15 42C5 54 20 70 45 55L50 52L55 55C80 70 95 54 85 42C75 30 55 35 50 48Z" fill="#FF85A2" stroke="#FF5C8A" stroke-width="3" stroke-linejoin="round"/>
        <path d="M48 55C40 68 28 85 20 90C32 86 42 75 48 62L48 55Z" fill="#FF7096" stroke="#FF5C8A" stroke-width="2"/>
        <path d="M52 55C60 68 72 85 80 90C68 86 58 75 52 62L52 55Z" fill="#FF7096" stroke="#FF5C8A" stroke-width="2"/>
        <ellipse cx="50" cy="50" rx="9" ry="8" fill="#FFB3C6" stroke="#FF5C8A" stroke-width="3"/>
        <circle cx="48" cy="48" r="2.5" fill="#FFFFFF"/>
        <path d="M28 42C23 46 25 55 35 50" stroke="#FFE5EC" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M72 42C77 46 75 55 65 50" stroke="#FFE5EC" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: 'bow-cream',
    name: 'Pastel Lavender Bow',
    category: 'bows',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 48C45 35 25 30 15 42C5 54 20 70 45 55L50 52L55 55C80 70 95 54 85 42C75 30 55 35 50 48Z" fill="#D8B4F8" stroke="#B388EB" stroke-width="3"/>
        <path d="M48 55C42 70 30 86 22 92C32 87 43 74 48 60Z" fill="#C792EA" stroke="#B388EB" stroke-width="2"/>
        <path d="M52 55C58 70 70 86 78 92C68 87 57 74 52 60Z" fill="#C792EA" stroke="#B388EB" stroke-width="2"/>
        <circle cx="50" cy="50" r="8" fill="#F1E3FF" stroke="#B388EB" stroke-width="3"/>
        <circle cx="48" cy="48" r="2" fill="#FFFFFF"/>
      </svg>
    `,
  },

  // Sweets
  {
    id: 'strawberry',
    name: 'Sweet Strawberry',
    category: 'sweets',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 92C50 92 20 72 18 48C16 28 32 24 45 28C48 29 52 29 55 28C68 24 84 28 82 48C80 72 50 92 50 92Z" fill="#FF5D73" stroke="#E63946" stroke-width="3" stroke-linejoin="round"/>
        <!-- Strawberry seeds -->
        <circle cx="36" cy="42" r="2" fill="#FFE5EC"/>
        <circle cx="64" cy="42" r="2" fill="#FFE5EC"/>
        <circle cx="50" cy="52" r="2" fill="#FFE5EC"/>
        <circle cx="34" cy="62" r="2" fill="#FFE5EC"/>
        <circle cx="66" cy="62" r="2" fill="#FFE5EC"/>
        <circle cx="50" cy="74" r="2" fill="#FFE5EC"/>
        <!-- Cute leaves -->
        <path d="M50 28C48 18 42 12 30 16C36 22 42 26 48 28Z" fill="#52B788"/>
        <path d="M50 28C52 18 58 12 70 16C64 22 58 26 52 28Z" fill="#52B788"/>
        <path d="M50 28C50 16 52 10 50 8C48 10 50 16 50 28Z" stroke="#40916C" stroke-width="3"/>
        <!-- Highlight -->
        <ellipse cx="28" cy="38" rx="4" ry="7" transform="rotate(-25 28 38)" fill="#FFA8B6" opacity="0.6"/>
      </svg>
    `,
  },
  {
    id: 'cherries',
    name: 'Twin Cherries',
    category: 'sweets',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Stems -->
        <path d="M35 55C38 35 52 20 62 14" stroke="#40916C" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M68 62C65 42 58 25 62 14" stroke="#40916C" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M62 14C72 10 82 12 85 18C75 18 68 16 62 14Z" fill="#52B788" stroke="#40916C" stroke-width="1.5"/>
        <!-- Cherries -->
        <circle cx="34" cy="65" r="18" fill="#FF3366" stroke="#D90429" stroke-width="3"/>
        <circle cx="70" cy="70" r="18" fill="#FF3366" stroke="#D90429" stroke-width="3"/>
        <!-- Gloss -->
        <circle cx="28" cy="58" r="4" fill="#FFFFFF"/>
        <circle cx="64" cy="63" r="4" fill="#FFFFFF"/>
      </svg>
    `,
  },

  // Hearts
  {
    id: 'heart-sparkle',
    name: 'Glitter Heart',
    category: 'hearts',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 86C50 86 16 62 16 36C16 22 28 14 40 18C45 20 48 24 50 27C52 24 55 20 60 18C72 14 84 22 84 36C84 62 50 86 50 86Z" fill="#FF70A6" stroke="#FF477E" stroke-width="3"/>
        <path d="M30 32C30 26 36 22 42 24" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <!-- Little sparkles inside -->
        <path d="M66 38L68 33L70 38L75 40L70 42L68 47L66 42L61 40L66 38Z" fill="#FFFFFF"/>
        <circle cx="38" cy="50" r="3" fill="#FFFFFF"/>
      </svg>
    `,
  },
  {
    id: 'heart-pastel',
    name: 'Blushing Pink Heart',
    category: 'hearts',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 84C50 84 18 62 18 38C18 24 28 16 40 20C45 22 48 26 50 28C52 26 55 22 60 20C72 16 82 24 82 38C82 62 50 84 50 84Z" fill="#FFB3C6" stroke="#FF85A1" stroke-width="3"/>
        <ellipse cx="32" cy="34" rx="3.5" ry="7" transform="rotate(-25 32 34)" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    `,
  },
  {
    id: 'heart-twin',
    name: 'Twin Hearts',
    category: 'hearts',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M42 68C42 68 18 50 18 32C18 20 26 14 36 17C40 19 42 22 44 24C46 22 48 19 52 17C62 14 70 20 70 32C70 50 42 68 42 68Z" fill="#FF99C8" stroke="#F38BA8" stroke-width="2.5"/>
        <path d="M68 84C68 84 48 70 48 54C48 44 54 39 62 41C65 42 67 45 69 47C71 45 73 42 76 41C84 39 90 44 90 54C90 70 68 84 68 84Z" fill="#FCBACB" stroke="#F38BA8" stroke-width="2.5"/>
      </svg>
    `,
  },

  // Sparkles & Stars
  {
    id: 'sparkle-gold',
    name: 'Magic Sparkle',
    category: 'sparkles',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 8C50 32 68 50 92 50C68 50 50 68 50 92C50 68 32 50 8 50C32 50 50 32 50 8Z" fill="#FFD166" stroke="#FFB703" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="7" fill="#FFFFFF"/>
        <circle cx="80" cy="22" r="4" fill="#FFD166"/>
        <circle cx="20" cy="78" r="3" fill="#FFD166"/>
      </svg>
    `,
  },
  {
    id: 'star-pastel',
    name: 'Chubby Star',
    category: 'sparkles',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 14L60 36L84 38L66 54L72 78L50 65L28 78L34 54L16 38L40 36L50 14Z" fill="#FFE3A8" stroke="#F4A261" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="43" cy="46" r="2.5" fill="#594A42"/>
        <circle cx="57" cy="46" r="2.5" fill="#594A42"/>
        <ellipse cx="37" cy="50" rx="3" ry="1.5" fill="#FF99C8"/>
        <ellipse cx="63" cy="50" rx="3" ry="1.5" fill="#FF99C8"/>
        <path d="M47 52C48 54 52 54 53 52" stroke="#594A42" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },

  // Cute & Doodles
  {
    id: 'bunny-ears',
    name: 'Bunny Ears',
    category: 'cute',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 85C20 60 18 20 32 15C45 10 44 48 38 85" fill="#FFFFFF" stroke="#FFCCD5" stroke-width="3"/>
        <path d="M28 70C24 50 23 25 32 22C38 20 38 45 35 70" fill="#FFCCD5"/>
        <path d="M70 85C80 60 82 20 68 15C55 10 56 48 62 85" fill="#FFFFFF" stroke="#FFCCD5" stroke-width="3"/>
        <path d="M72 70C76 50 77 25 68 22C62 20 62 45 65 70" fill="#FFCCD5"/>
      </svg>
    `,
  },
  {
    id: 'daisy-flower',
    name: 'Daisy Flower',
    category: 'cute',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Petals -->
        <circle cx="50" cy="24" r="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="50" cy="76" r="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="24" cy="50" r="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="76" cy="50" r="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="32" cy="32" r="13" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="68" cy="32" r="13" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="32" cy="68" r="13" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <circle cx="68" cy="68" r="13" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
        <!-- Flower Center -->
        <circle cx="50" cy="50" r="16" fill="#FFD166" stroke="#F4A261" stroke-width="2.5"/>
        <circle cx="46" cy="46" r="3" fill="#FFFFFF" opacity="0.6"/>
      </svg>
    `,
  },
  {
    id: 'angel-wings',
    name: 'Little Wings',
    category: 'cute',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M46 55C36 40 20 30 6 36C4 48 14 62 26 66C16 68 14 74 18 80C28 80 40 70 46 55Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
        <path d="M54 55C64 40 80 30 94 36C96 48 86 62 74 66C84 68 86 74 82 80C72 80 60 70 54 55Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5"/>
      </svg>
    `,
  },
  {
    id: 'cute-blush',
    name: 'Anime Blush',
    category: 'cute',
    svgContent: `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="60" x2="32" y2="40" stroke="#FF7096" stroke-width="5" stroke-linecap="round"/>
        <line x1="32" y1="60" x2="44" y2="40" stroke="#FF7096" stroke-width="5" stroke-linecap="round"/>
        <line x1="44" y1="60" x2="56" y2="40" stroke="#FF7096" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="38" cy="50" rx="25" ry="14" fill="#FFCCD5" opacity="0.45"/>
      </svg>
    `,
  },
];
