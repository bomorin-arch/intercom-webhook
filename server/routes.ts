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

// Send feedback to Clay webhook
async function sendToClayWebhook(
  requestData: any,
  feedback: string,
  additionalData: any,
  workspaceId: string | undefined,
  webhookUrl: string
): Promise<void> {
  try {
    const conversationId = requestData.conversation?.id || requestData.conversation_id || "unknown";
    const webhookPayload: any = {
      conversation_id: conversationId,
      feedback: feedback,
      workspace_id: workspaceId,
      triggered_by: {
        id: requestData.admin?.id || "unknown",
        name: requestData.admin?.name || "unknown",
        email: requestData.admin?.email || "unknown",
      },
      timestamp: new Date().toISOString(),
    };

    // Add all additional fields if provided
    if (additionalData.link && additionalData.link.trim() !== "") {
      webhookPayload.link = additionalData.link;
    }
    if (additionalData.impacted_customers && additionalData.impacted_customers.trim() !== "") {
      webhookPayload.impacted_customers = additionalData.impacted_customers;
    }
    if (additionalData.ticket_reference && additionalData.ticket_reference.trim() !== "") {
      webhookPayload.ticket_reference = additionalData.ticket_reference;
    }
    if (additionalData.ready_to_send && additionalData.ready_to_send.trim() !== "") {
      webhookPayload.ready_to_send = additionalData.ready_to_send;
    }
    if (additionalData.feedback_report && additionalData.feedback_report.trim() !== "") {
      webhookPayload.feedback_report = additionalData.feedback_report;
    }

    const webhookResponse = await fetch(webhookUrl, {
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
}

// Lite canvas with large text area
function getLiteCanvas(): CanvasResponse {
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
            type: "textarea",
            id: "feedback_text",
            label: "Share your feedback in your own words or what you'd like us to focus on",
            placeholder: "Type your feedback here...",
          },
          {
            type: "button",
            label: "Send",
            style: "primary",
            id: "send_lite_button",
            action: {
              type: "submit",
            },
          },
          {
            type: "button",
            label: "Switch to Complete Form",
            style: "secondary",
            id: "switch_to_complete",
            action: {
              type: "submit",
            },
          },
        ],
      },
    },
  };
}

// Complete canvas with all fields
function getCompleteCanvas(): CanvasResponse {
  return {
    canvas: {
      content: {
        components: [
          {
            type: "text",
            text: "Feedback Form",
            style: "header",
            align: "left",
          },
          {
            type: "textarea",
            id: "feedback_text",
            label: "⭐ What's your feedback?",
            placeholder: "Type your feedback here...",
          },
          {
            type: "input",
            id: "impacted_customers",
            label: "👥 Which customers are the most impacted?",
            placeholder: "Everyone, Enterprise, Pro, Other...",
          },
          {
            type: "input",
            id: "link_input",
            label: "🔗 Wanna include a link?",
            placeholder: "Clay table, Loom recording, or Gong link...",
          },
          {
            type: "input",
            id: "ticket_reference",
            label: "✉️ Want to reference a ticket?",
            placeholder: "Paste ticket ID or URL...",
          },
          {
            type: "input",
            id: "ready_to_send",
            label: "📤 Ready to send?",
            placeholder: "Clarify first / Send as-is / Don't send...",
          },
          {
            type: "input",
            id: "feedback_report",
            label: "📊 Ready for a Product Feedback Report?",
            placeholder: "Link to existing / Create new...",
          },
          {
            type: "button",
            label: "Send Feedback",
            style: "primary",
            id: "send_complete_button",
            action: {
              type: "submit",
            },
          },
          {
            type: "button",
            label: "← Back to Lite",
            style: "secondary",
            id: "switch_to_lite",
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

  // Initialize endpoint - returns the initial canvas (lite by default)
  app.post("/initialize", verifyRequest, async (req, res) => {
    try {
      const requestData = intercomRequestSchema.parse(req.body);
      console.log("Initialize request from workspace:", requestData.workspace_id);

      res.json(getLiteCanvas());
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

      console.log("Submit request:", { component_id, workspace_id });

      // Handle switch to complete form
      if (component_id === "switch_to_complete") {
        res.json(getCompleteCanvas());
        return;
      }

      // Handle switch to lite form
      if (component_id === "switch_to_lite") {
        res.json(getLiteCanvas());
        return;
      }

      // Handle lite form submission
      if (component_id === "send_lite_button") {
        const feedback = input_values?.feedback_text as string;

        if (!feedback || feedback.trim() === "") {
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
                    style: "error",
                  },
                  {
                    type: "textarea",
                    id: "feedback_text",
                    label: "Share your feedback in your own words or what you'd like us to focus on",
                    placeholder: "Type your feedback here...",
                  },
                  {
                    type: "button",
                    label: "Send",
                    style: "primary",
                    id: "send_lite_button",
                    action: {
                      type: "submit",
                    },
                  },
                  {
                    type: "button",
                    label: "Switch to Complete Form",
                    style: "secondary",
                    id: "switch_to_complete",
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
        await sendToClayWebhook(requestData, feedback, {}, workspace_id, clayWebhookUrl);

        // Return success canvas
        res.json(getSuccessCanvas(feedback));
        return;
      }

      // Handle complete form submission
      if (component_id === "send_complete_button") {
        const feedback = input_values?.feedback_text as string;

        if (!feedback || feedback.trim() === "") {
          res.json(getCompleteCanvas());
          return;
        }

        // Extract all form fields
        const additionalData = {
          link: input_values?.link_input as string,
          impacted_customers: input_values?.impacted_customers as string,
          ticket_reference: input_values?.ticket_reference as string,
          ready_to_send: input_values?.ready_to_send as string,
          feedback_report: input_values?.feedback_report as string,
        };

        // Send data to Clay webhook
        await sendToClayWebhook(requestData, feedback, additionalData, workspace_id, clayWebhookUrl);

        // Return success canvas
        res.json(getSuccessCanvas(feedback));
        return;
      }

      // Handle reset button click
      if (component_id === "reset_button") {
        res.json(getLiteCanvas());
        return;
      }

      // Unknown component - return lite canvas
      res.json(getLiteCanvas());
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
