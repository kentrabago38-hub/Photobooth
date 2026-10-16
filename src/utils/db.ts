import { CapturedPhoto } from '../types';

const DB_NAME = 'cutie_booth_database';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported on this device/browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('isFavorite', 'isFavorite', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function savePhotoToDB(photo: CapturedPhoto): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save photo to IndexedDB:', err);
    // Fallback to localStorage if indexedDB fails or is in restricted private browsing
    try {
      const existing = JSON.parse(localStorage.getItem('cutie_booth_photos') || '[]');
      existing.unshift(photo);
      localStorage.setItem('cutie_booth_photos', JSON.stringify(existing.slice(0, 15)));
    } catch (e) {
      console.warn('LocalStorage fallback also failed:', e);
    }
  }
}

export async function getAllPhotosFromDB(): Promise<CapturedPhoto[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      // Sort newest first
      const req = index.openCursor(null, 'prev');
      const results: CapturedPhoto[] = [];

      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('IndexedDB load failed, falling back to localStorage:', err);
    try {
      const stored = localStorage.getItem('cutie_booth_photos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export async function deletePhotoFromDB(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete photo from IndexedDB:', err);
    try {
      const existing: CapturedPhoto[] = JSON.parse(localStorage.getItem('cutie_booth_photos') || '[]');
      localStorage.setItem('cutie_booth_photos', JSON.stringify(existing.filter((p) => p.id !== id)));
    } catch {}
  }
}

export async function toggleFavoriteInDB(id: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const photo: CapturedPhoto = getReq.result;
        if (!photo) {
          resolve(false);
          return;
        }
        photo.isFavorite = !photo.isFavorite;
        const putReq = store.put(photo);
        putReq.onsuccess = () => resolve(photo.isFavorite);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error('Failed to toggle favorite in IndexedDB:', err);
    return false;
  }
}

export async function clearAllPhotosFromDB(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear IndexedDB:', err);
    localStorage.removeItem('cutie_booth_photos');
  }
}
