import { z } from "zod";

// Intercom Canvas Kit request body schema
export const intercomRequestSchema = z.object({
  workspace_id: z.string().optional(),
  conversation_id: z.string().optional(),
  conversation: z.object({
    id: z.string(),
  }).optional(),
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
