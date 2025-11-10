import type { Express } from "express";
import { createServer, type Server } from "http";
import { intercomRequestSchema, type CanvasResponse } from "@shared/schema";
import crypto from "crypto";

// Verify Intercom request signature
function verifyIntercomRequest(
  body: any,
  signature: string | undefined,
  clientSecret: string
): boolean {
  if (!signature || !clientSecret) {
    // In development, allow requests without signature verification
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  }

  const hash = crypto
    .createHmac("sha256", clientSecret)
    .update(JSON.stringify(body))
    .digest("hex");

  return hash === signature;
}

// Initial canvas with text input and send button
function getInputCanvas(): CanvasResponse {
  return {
    canvas: {
      content: {
        components: [
          {
            type: "text",
            text: "Add your feedback",
            style: "header",
            align: "left",
          },
          {
            type: "input",
            id: "text_input",
            label: "Share your feedback in your own words or what you'd like us to focus on",
            placeholder: "Type your feedback here...",
          },
          {
            type: "button",
            label: "Send",
            style: "primary",
            id: "send_button",
            action: {
              type: "submit",
            },
          },
        ],
      },
    },
  };
}

// Success canvas after message is sent
function getSuccessCanvas(message: string): CanvasResponse {
  return {
    canvas: {
      content: {
        components: [
          {
            type: "text",
            text: "Message sent successfully!",
            style: "header",
            align: "left",
          },
          {
            type: "text",
            text: `You sent: "${message}"`,
            style: "paragraph",
          },
          {
            type: "button",
            label: "Send Another",
            style: "secondary",
            id: "reset_button",
            action: {
              type: "submit",
            },
          },
        ],
      },
    },
    event: {
      type: "completed",
    },
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const clientSecret = process.env.INTERCOM_CLIENT_SECRET || "";
  const clayWebhookUrl = process.env.CLAY_WEBHOOK_URL || "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b22d6978-affc-4de2-a1f7-2a8be0555b2b";

  // Middleware to verify Intercom requests
  const verifyRequest = (req: any, res: any, next: any) => {
    const signature = req.headers["x-body-signature"] as string | undefined;
    
    if (!verifyIntercomRequest(req.body, signature, clientSecret)) {
      console.warn("Invalid Intercom signature");
      // In development, continue anyway
      if (process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
    next();
  };

  // Initialize endpoint - returns the initial canvas
  app.post("/initialize", verifyRequest, async (req, res) => {
    try {
      const requestData = intercomRequestSchema.parse(req.body);
      console.log("Initialize request from workspace:", requestData.workspace_id);
      
      res.json(getInputCanvas());
    } catch (error) {
      console.error("Initialize error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Submit endpoint - handles button clicks and form submissions
  app.post("/submit", verifyRequest, async (req, res) => {
    try {
      const requestData = intercomRequestSchema.parse(req.body);
      const { component_id, input_values, workspace_id } = requestData;

      // Log the full request body to see what Intercom sends
      console.log("Full request body:", JSON.stringify(req.body, null, 2));
      console.log("Submit request:", { component_id, workspace_id });

      // Handle send button click
      if (component_id === "send_button") {
        const userMessage = input_values?.text_input as string;

        if (!userMessage || userMessage.trim() === "") {
          // Return canvas with error message
          res.json({
            canvas: {
              content: {
                components: [
                  {
                    type: "text",
                    text: "Add your feedback",
                    style: "header",
                    align: "left",
                  },
                  {
                    type: "text",
                    text: "Please enter your feedback before sending.",
                    style: "muted",
                  },
                  {
                    type: "input",
                    id: "text_input",
                    label: "Share your feedback in your own words or what you'd like us to focus on",
                    placeholder: "Type your feedback here...",
                  },
                  {
                    type: "button",
                    label: "Send",
                    style: "primary",
                    id: "send_button",
                    action: {
                      type: "submit",
                    },
                  },
                ],
              },
            },
          });
          return;
        }

        // Send data to Clay webhook
        try {
          const conversationId = requestData.conversation?.id || requestData.conversation_id || "unknown";
          const webhookPayload = {
            conversation_id: conversationId,
            comment: userMessage,
            workspace_id: workspace_id,
            triggered_by: {
              id: requestData.admin?.id || "unknown",
              name: requestData.admin?.name || "unknown",
              email: requestData.admin?.email || "unknown",
            },
            timestamp: new Date().toISOString(),
          };

          const webhookResponse = await fetch(clayWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(webhookPayload),
          });

          if (!webhookResponse.ok) {
            console.error("Clay webhook failed:", await webhookResponse.text());
          } else {
            console.log("Data sent to Clay:", webhookPayload);
          }
        } catch (error) {
          console.error("Error sending to Clay webhook:", error);
        }

        // Return success canvas
        res.json(getSuccessCanvas(userMessage));
        return;
      }

      // Handle reset button click
      if (component_id === "reset_button") {
        res.json(getInputCanvas());
        return;
      }

      // Unknown component
      res.json(getInputCanvas());
    } catch (error) {
      console.error("Submit error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
