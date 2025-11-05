// Storage interface for Intercom Canvas Kit app
// Using PostgreSQL database for persistent message storage
// Reference: blueprint:javascript_database

import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  saveMessage(workspaceId: string, message: string): Promise<Message>;
  getMessages(workspaceId: string): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async saveMessage(workspaceId: string, message: string): Promise<Message> {
    const insertData: InsertMessage = {
      workspaceId,
      message,
    };

    const [savedMessage] = await db
      .insert(messages)
      .values(insertData)
      .returning();

    return savedMessage;
  }

  async getMessages(workspaceId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.workspaceId, workspaceId))
      .orderBy(desc(messages.createdAt));
  }
}

export const storage = new DatabaseStorage();
