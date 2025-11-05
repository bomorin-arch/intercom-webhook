import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database schema for storing messages from Intercom Canvas Kit
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  workspaceId: varchar("workspace_id", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Intercom Canvas Kit request body schema
export const intercomRequestSchema = z.object({
  workspace_id: z.string().optional(),
  admin: z.any().optional(),
  user: z.any().optional(),
  component_id: z.string().optional(),
  input_values: z.record(z.any()).optional(),
  current_canvas: z.any().optional(),
});

export type IntercomRequest = z.infer<typeof intercomRequestSchema>;

// Canvas response types
export interface CanvasComponent {
  type: string;
  id?: string;
  text?: string;
  label?: string;
  placeholder?: string;
  style?: string;
  align?: string;
  action?: {
    type: string;
  };
  value?: string;
}

export interface CanvasResponse {
  canvas: {
    content: {
      components: CanvasComponent[];
    };
  };
  event?: {
    type: string;
  };
}
