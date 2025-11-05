# Intercom Canvas Kit Application

## Project Overview

This is an Intercom Canvas Kit webhook application that provides a simple text input and send button interface. The app integrates directly into Intercom's Inbox or Messenger, allowing users to submit messages through a clean, native-feeling interface.

## Architecture

**Type**: Backend-only webhook service (no traditional frontend)

Canvas Kit apps work differently from traditional web apps:
- Intercom renders the UI based on JSON responses from our server
- Users interact with the UI in Intercom (not in a browser)
- Our server receives webhook requests and responds with Canvas JSON

**Technology Stack**:
- Express.js server with TypeScript
- Zod for request validation
- In-memory storage for messages
- HMAC-SHA256 signature verification

## Current Implementation

### Endpoints

1. **POST /initialize** - Returns initial canvas with text input form
2. **POST /submit** - Handles user interactions and form submissions
3. **GET /health** - Health check endpoint

### Features Implemented

- Text input field with label and placeholder
- Primary-styled send button
- Success confirmation after submission
- Input validation and error messages
- Message storage by workspace ID
- Request signature verification (optional in dev, required in production)
- "Send Another" option after successful submission

### File Structure

- `shared/schema.ts` - TypeScript types for Canvas requests/responses
- `server/storage.ts` - In-memory message storage interface
- `server/routes.ts` - All webhook endpoints and Canvas logic
- `README.md` - Complete setup and deployment instructions

## Deployment Instructions

1. Click "Run" in Replit to start the server
2. Copy your Replit URL (e.g., `https://your-repl.replit.app`)
3. Go to Intercom Developer Hub
4. Add Canvas Kit endpoints:
   - Initialize: `https://your-repl.replit.app/initialize`
   - Submit: `https://your-repl.replit.app/submit`
5. (Optional) Add `INTERCOM_CLIENT_SECRET` in Secrets for signature verification
6. Install the app in your Intercom workspace

## Recent Changes

- November 5, 2025: Initial implementation created
  - Canvas Kit webhook endpoints
  - Text input and send button UI
  - Request validation and error handling
  - Message storage system
  - Security with HMAC signature verification

## User Preferences

- User wants Intercom Canvas Kit integration (not standalone web app)
- Simple, focused interface: text input + send button
- Clean, professional design following Intercom's UI patterns

## Technical Notes

### Canvas Kit Specifics

- All UI components are defined in JSON, not React/HTML
- Available components: text, input, textarea, button, dropdown, checkbox, list
- Buttons with `action: { type: "submit" }` trigger POST to /submit endpoint
- Input values accessed via `request.body.input_values.{input_id}`

### Storage

- Currently uses in-memory Map storage
- Messages keyed by workspace_id
- Can be upgraded to database if needed

### Security

- Signature verification using `X-Body-Signature` header
- HMAC-SHA256 with client secret from Intercom
- Development mode allows requests without signatures
- Production mode requires valid signatures

## Future Enhancement Ideas

- Add database persistence (PostgreSQL)
- Multi-step forms with navigation
- Dropdown menus for categorization
- File upload support
- Integration with external APIs
- Conversation context and user data handling
- Configure endpoint for app settings
