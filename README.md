# Intercom Inbox App → Clay Webhook

A simple Intercom Inbox app that captures user comments and sends them to a Clay webhook along with the conversation ID.

## What is This?

This is an Intercom Canvas Kit webhook application built for the Inbox. When a teammate opens a conversation and uses this app, they can:
1. Enter a comment in a text input field
2. Click "Send" to submit
3. The app automatically sends the **conversation ID** and **comment** to your Clay webhook

## Features

- **Text Input & Send Button**: Clean interface for entering comments
- **Automatic Conversation ID**: Pulls the conversation ID from Intercom automatically
- **Clay Webhook Integration**: Sends data directly to Clay
- **Success Feedback**: Confirmation message after submission
- **Request Verification**: HMAC-SHA256 signature verification for security

## Data Sent to Clay

When a teammate submits a comment, the following data is sent to your Clay webhook:

```json
{
  "conversation_id": "123456789",
  "comment": "Teammate's comment text",
  "workspace_id": "abc123",
  "timestamp": "2025-11-05T23:45:00.000Z"
}
```

**Note**: The `conversation_id` is automatically provided by Intercom when the app is used within a conversation.

## Setup Instructions

### 1. Deploy to Replit

1. Import this repository to Replit
2. Run `npm install` in the Shell
3. Click the **Run** button
4. Copy your Replit URL (e.g., `https://your-repl.replit.app`)

### 2. Configure Clay Webhook (Optional)

The app is pre-configured with this Clay webhook URL:
```
https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b22d6978-affc-4de2-a1f7-2a8be0555b2b
```

To use a different webhook:
1. Go to the **Secrets** tab (🔒 icon) in Replit
2. Add a new secret:
   - **Key**: `CLAY_WEBHOOK_URL`
   - **Value**: Your Clay webhook URL

### 3. Configure in Intercom Developer Hub

1. Go to [Intercom Developer Hub](https://app.intercom.com/a/apps)
2. Create a new app or select an existing one
3. Navigate to **Canvas Kit** in the sidebar
4. Click **"For teammates"** (this is an Inbox app)
5. Check "Add to conversation details"
6. Add your webhook URLs:
   - **Initialize URL**: `https://your-repl.replit.app/initialize`
   - **Submit URL**: `https://your-repl.replit.app/submit`
7. Click **Save**
8. Toggle the app **ON**

### 4. Add Client Secret (Recommended for Production)

For production use, add request signature verification:

1. In Intercom Developer Hub, go to **Basic Info**
2. Copy your **Client Secret**
3. In Replit, go to the **Secrets** tab (🔒 icon)
4. Add a new secret:
   - **Key**: `INTERCOM_CLIENT_SECRET`
   - **Value**: `fe12d0b7-aa3d-4d87-b38d-27b2d8c11060` (your client secret)

### 5. Install App in Your Inbox

1. In Intercom Developer Hub, install the app to your workspace
2. Open any conversation in your Inbox
3. Click **Edit Apps** in the conversation details panel (bottom right)
4. Pin your app
5. The app will now appear in the sidebar for all conversations

## How It Works

### Initialize Flow

When you open a conversation with the app pinned, Intercom sends a POST request to `/initialize`. The server responds with a Canvas showing:

- A header text ("Send us a message")
- A text input field for the comment
- A "Send" button

### Submit Flow

When you click "Send", Intercom sends a POST request to `/submit` with:

- **conversation_id**: Automatically included by Intercom
- **component_id**: The button that was clicked (`send_button`)
- **input_values**: The comment from the text input
- **workspace_id**: Your Intercom workspace ID

The server then:

1. Validates the input
2. Sends the data to the Clay webhook
3. Shows a success message
4. Provides a "Send Another" button to repeat the process

## API Endpoints

- `POST /initialize` - Returns the initial canvas with input form
- `POST /submit` - Handles submissions and sends to Clay webhook
- `GET /health` - Health check endpoint

## Canvas Components Used

- **text** - Display headers and paragraphs
- **input** - Text input field for user comment
- **button** - Action buttons (Send, Send Another)

## Development

The app uses:

- **Express.js** for the server
- **TypeScript** for type safety
- **Zod** for request validation
- **Fetch API** for sending data to Clay webhook

## Security

- Request signature verification using HMAC-SHA256
- Environment variable for client secret
- Input validation on all requests

## Customization

You can easily customize the canvas components in [server/routes.ts](server/routes.ts):

- Modify `getInputCanvas()` to change the input form
- Modify `getSuccessCanvas()` to change the success message
- Change the webhook payload structure
- Add more input fields or components

See the [Canvas Kit Documentation](https://developers.intercom.com/docs/canvas-kit) for all available components.

## Troubleshooting

**App not appearing in Inbox?**
- Ensure the app is toggled **ON** in Developer Hub
- Check that you selected "For teammates" (not "For users, leads and visitors")
- Verify webhook URLs are correct
- Make sure you clicked "Edit Apps" and pinned the app to the conversation

**Getting 401 errors?**
- Check that `INTERCOM_CLIENT_SECRET` is set correctly in Secrets
- Verify the secret matches your app in Developer Hub

**Data not being sent to Clay?**
- Check the server logs in Replit console for webhook errors
- Verify the Clay webhook URL is correct
- Test the Clay webhook URL independently (using Postman or curl)
- Check network connectivity from Replit to Clay

**Conversation ID showing as "unknown"?**
- Verify you're using the app from within an active conversation
- Check that Intercom is sending the `conversation_id` in the request body
- Look at the server logs to see what data Intercom is sending

## Next Steps

- Customize the input form with additional fields
- Add more data to send to Clay (user info, admin info, etc.)
- Implement multi-step flows
- Add dropdowns or checkboxes for categorization
- Integrate with other webhooks or APIs
