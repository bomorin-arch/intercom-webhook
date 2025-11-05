# Intercom Canvas Kit Application

A simple Intercom Canvas Kit integration that provides a text input box and send button interface within Intercom's Inbox or Messenger.

## What is This?

This is a webhook-based application that integrates with Intercom using their Canvas Kit framework. When users interact with the app in Intercom, requests are sent to this server, which responds with JSON defining the UI components that Intercom should display.

## Features

- **Text Input & Send Button**: Clean, simple interface for collecting user messages
- **Request Verification**: HMAC-SHA256 signature verification for security
- **Message Storage**: In-memory storage of submitted messages
- **Success Feedback**: Confirmation message after submission
- **Error Handling**: Validation and helpful error messages

## Setup Instructions

### 1. Deploy to Replit

This application is ready to run on Replit:

1. Click the "Run" button
2. Your app will be deployed and you'll get a URL like `https://your-repl-name.replit.app`

### 2. Configure in Intercom Developer Hub

1. Go to [Intercom Developer Hub](https://app.intercom.com/a/apps)
2. Create a new app or select an existing one
3. Navigate to **Canvas Kit** in the sidebar
4. Choose your deployment location:
   - **For teammates** (Inbox) - recommended for internal team use
   - **For users, leads and visitors** (Messenger)

5. Add your webhook URLs:
   - **Initialize URL**: `https://your-repl-name.replit.app/initialize`
   - **Submit URL**: `https://your-repl-name.replit.app/submit`

6. Toggle the app **ON**

### 3. Add Client Secret (Optional but Recommended)

For production use, add request signature verification:

1. In Intercom Developer Hub, go to **Basic Info**
2. Copy your **Client Secret**
3. In Replit, go to the Secrets tab (🔒 icon)
4. Add a new secret:
   - Key: `INTERCOM_CLIENT_SECRET`
   - Value: (paste your client secret)

### 4. Install App in Your Workspace

1. In Intercom Developer Hub, install the app to your workspace
2. **For Inbox apps**: Open a conversation → Details panel → Add your app
3. **For Messenger apps**: Go to Messenger Settings → Customize Home → Add your app

## How It Works

### Initialize Flow

When the app is opened in Intercom, Intercom sends a POST request to `/initialize`. The server responds with a Canvas JSON object defining:

- A header text ("Send us a message")
- A text input field with label and placeholder
- A primary "Send" button

### Submit Flow

When the user clicks "Send", Intercom sends a POST request to `/submit` with:

- The component ID that was clicked (`send_button`)
- The input values (the text the user entered)
- Workspace and user information

The server:

1. Validates the input
2. Saves the message to storage
3. Responds with a success canvas showing confirmation

Users can then click "Send Another" to return to the input form.

## API Endpoints

- `POST /initialize` - Returns the initial canvas with input form
- `POST /submit` - Handles user interactions (button clicks)
- `GET /health` - Health check endpoint

## Canvas Components Used

- **text** - Display headers and paragraphs
- **input** - Text input field for user message
- **button** - Action buttons (Send, Send Another)

## Development

The app uses:

- **Express.js** for the server
- **TypeScript** for type safety
- **Zod** for request validation
- **In-memory storage** for message persistence

## Security

- Request signature verification using HMAC-SHA256
- Environment variable for client secret
- Input validation on all requests

## Customization

You can easily customize the canvas components in `server/routes.ts`:

- Modify `getInputCanvas()` to change the input form
- Modify `getSuccessCanvas()` to change the success message
- Add more components like dropdowns, textareas, or checkboxes

See the [Canvas Kit Documentation](https://developers.intercom.com/docs/canvas-kit) for all available components.

## Troubleshooting

**App not appearing in Intercom?**
- Ensure the app is toggled ON in Developer Hub
- Check that webhook URLs are correct
- Verify the app is installed in your workspace

**Getting 401 errors?**
- Check that `INTERCOM_CLIENT_SECRET` is set correctly
- Verify the secret matches your app in Developer Hub

**Messages not saving?**
- Check the server logs for errors
- Verify the input field has `id: "text_input"`

## Next Steps

- Connect to a database for persistent message storage
- Add more input fields for collecting structured data
- Integrate with external APIs or services
- Implement multi-step flows with navigation
- Add file upload capabilities
- Create dropdown menus for selections
