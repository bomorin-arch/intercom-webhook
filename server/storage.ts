// Storage interface for Intercom Canvas Kit app
// This app stores submitted messages in memory

export interface IStorage {
  saveMessage(workspaceId: string, message: string): Promise<void>;
  getMessages(workspaceId: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, string[]>;

  constructor() {
    this.messages = new Map();
  }

  async saveMessage(workspaceId: string, message: string): Promise<void> {
    const existing = this.messages.get(workspaceId) || [];
    existing.push(message);
    this.messages.set(workspaceId, existing);
  }

  async getMessages(workspaceId: string): Promise<string[]> {
    return this.messages.get(workspaceId) || [];
  }
}

export const storage = new MemStorage();
