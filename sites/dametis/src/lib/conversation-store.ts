import type { Message } from "src/types/messageType";

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

export type ConversationStore = {
  list(): Promise<Conversation[]>;
  get(id: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
  delete(id: string): Promise<void>;
};

const DB_NAME = "dametis";
const STORE_NAME = "conversations";

export function createConversationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createConversation(id = createConversationId()): Conversation {
  const now = Date.now();
  return {
    id,
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function titleFromMessages(messages: Message[]): string {
  const first = messages.find((message) => message.role === "user" && message.text.trim());
  if (!first) return "New conversation";
  return first.text.trim().slice(0, 48);
}

export function appendStreamingChunk(
  messages: Message[],
  chunk: string
): Message[] {
  const last = messages[messages.length - 1];
  if (last?.role === "assistant") {
    return [...messages.slice(0, -1), { ...last, text: last.text + chunk }];
  }
  return [...messages, { role: "assistant", text: chunk }];
}

export function toInitialPrompts(messages: Message[]) {
  return messages
    .filter((message) => message.text.trim())
    .map((message) => ({
      role: message.role,
      content: message.text,
    }));
}

export class MemoryConversationStore implements ConversationStore {
  private records = new Map<string, Conversation>();

  async list(): Promise<Conversation[]> {
    return [...this.records.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Conversation | null> {
    return this.records.get(id) ?? null;
  }

  async save(conversation: Conversation): Promise<void> {
    this.records.set(conversation.id, conversation);
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDbConversationStore implements ConversationStore {
  async list(): Promise<Conversation[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .getAll();
      request.onsuccess = () => {
        const rows = (request.result as Conversation[]) || [];
        resolve(rows.sort((a, b) => b.updatedAt - a.updatedAt));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get(id: string): Promise<Conversation | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction(STORE_NAME, "readonly")
        .objectStore(STORE_NAME)
        .get(id);
      request.onsuccess = () => resolve((request.result as Conversation) ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async save(conversation: Conversation): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .put(conversation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export function createConversationStore(): ConversationStore {
  if (typeof indexedDB === "undefined") {
    return new MemoryConversationStore();
  }
  return new IndexedDbConversationStore();
}
