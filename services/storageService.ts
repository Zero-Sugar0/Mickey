
import { Message, ChatSession, ChatMode } from '../types';

const DB_NAME = 'GeminiAppDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_MESSAGES = 'messages';

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        db.createObjectStore(STORE_MESSAGES, { keyPath: 'sessionId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- API ---

export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SESSIONS, 'readonly');
      const store = transaction.objectStore(STORE_SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const sessions = (request.result as ChatSession[]).sort((a, b) => b.timestamp - a.timestamp);
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to get sessions", e);
    return [];
  }
};

export const loadChatMessages = async (sessionId: string): Promise<Message[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_MESSAGES, 'readonly');
      const store = transaction.objectStore(STORE_MESSAGES);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.messages : []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to load messages", e);
    return [];
  }
};

export const deleteChat = async (sessionId: string) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_SESSIONS, STORE_MESSAGES], 'readwrite');
    
    transaction.objectStore(STORE_SESSIONS).delete(sessionId);
    transaction.objectStore(STORE_MESSAGES).delete(sessionId);
    
    return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.error("Failed to delete chat", e);
  }
};

export const clearAllData = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_SESSIONS, STORE_MESSAGES], 'readwrite');
    
    transaction.objectStore(STORE_SESSIONS).clear();
    transaction.objectStore(STORE_MESSAGES).clear();
    
    return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.error("Failed to clear data", e);
  }
};

// --- Save Logic (Debounced) ---

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

const performSave = async (sessionId: string, messages: Message[], mode: ChatMode) => {
  if (!sessionId) return;

  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_SESSIONS, STORE_MESSAGES], 'readwrite');

    // 1. Calculate Title
    let title = "New Chat";
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
        let text = firstUserMsg.text.trim().replace(/[#*`_~]/g, '');
        if (text.length > 0) {
            title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        } else if (firstUserMsg.attachment) {
            title = firstUserMsg.attachment.type === 'image' ? "Image Analysis" : "Video Analysis";
        }
    } else if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.image) title = "Generated Image";
        else if (lastMsg.video) title = "Generated Video";
    }

    // 2. Save Session Metadata
    const sessionData: ChatSession = {
        id: sessionId,
        title,
        timestamp: Date.now(),
        mode
    };
    transaction.objectStore(STORE_SESSIONS).put(sessionData);

    // 3. Save Messages (Blob/Container)
    // We store all messages for a session in one record for simplicity in this demo,
    // keyed by sessionId.
    transaction.objectStore(STORE_MESSAGES).put({ sessionId, messages });

  } catch (e) {
    console.error("Failed to save chat", e);
  }
};

export const saveChat = (sessionId: string, messages: Message[], mode: ChatMode) => {
  if (messages.length === 0) return;

  if (saveTimers[sessionId]) {
    clearTimeout(saveTimers[sessionId]);
  }

  saveTimers[sessionId] = setTimeout(() => {
    performSave(sessionId, messages, mode);
    delete saveTimers[sessionId];
  }, 1000);
};

export const saveChatImmediately = async (sessionId: string, messages: Message[], mode: ChatMode) => {
  if (messages.length === 0) return;
  if (saveTimers[sessionId]) {
    clearTimeout(saveTimers[sessionId]);
    delete saveTimers[sessionId];
  }
  await performSave(sessionId, messages, mode);
};

// --- Storage Stats ---

export const getStorageUsage = async (): Promise<{ usageBytes: number, itemCount: number }> => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            let size = 0;
            let count = 0;
            // This is an estimation. Accurate IDB size is hard to get cross-browser without iterating.
            const transaction = db.transaction([STORE_MESSAGES], 'readonly');
            const store = transaction.objectStore(STORE_MESSAGES);
            const request = store.openCursor();
            
            request.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest).result;
                if (cursor) {
                    const value = cursor.value;
                    // Rough estimation of string size
                    const json = JSON.stringify(value);
                    size += new Blob([json]).size;
                    count++;
                    cursor.continue();
                } else {
                    resolve({ usageBytes: size, itemCount: count });
                }
            };
        });
    } catch (e) {
        return { usageBytes: 0, itemCount: 0 };
    }
};
