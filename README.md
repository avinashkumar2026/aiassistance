# Project AI — Windows + OpenRouter

This is the Windows-ready version of Project AI. It is an AI-powered application that uses OpenRouter's OpenAI-compatible chat-completions API instead of Google's Gemini SDK. It allows users to interact with an AI model through a simple and user-friendly web interface. The backend manages API requests and processes responses, while the frontend provides an interactive platform for communication with the AI.

## Quick start (Windows 10/11)

1. Install Node.js LTS (Node 20+ recommended): https://nodejs.org/
2. Extract the ZIP into a normal folder.
3. Double-click `RUN_WINDOWS.bat`.
4. On first run, Notepad opens `server/.env`. Paste your key after `OPENROUTER_API_KEY=` and save the file. Create a key at https://openrouter.ai/keys.
5. The launcher automatically installs the required dependencies, starts the backend and frontend servers, and opens http://localhost:5173 in your browser.

The batch file makes the installation process simple and reduces the need for manual configuration. Once the setup is completed, users can directly interact with the AI application through their browser.

## Default model and speed safeguards

- Provider: OpenRouter
- Default model: `meta-llama/llama-3.3-70b-instruct`
- Response output limit: 2048 tokens
- Conversation history sent per request: last 12 messages
- Hard API request timeout: 90 seconds, with a visible error instead of waiting 20–30 minutes
- Backend technology: Node.js
- Frontend and backend communication through API requests

The application uses the Llama 3.3 70B Instruct model to generate responses based on user queries. The conversation history helps the AI understand previous messages and maintain context during a conversation. The response output limit controls the maximum generated response size, while the 90-second timeout prevents requests from remaining stuck for a long time.

The model ID can be changed in `server/.env` using `OPENROUTER_MODEL=`. Model availability, price and speed depend on OpenRouter and the upstream provider; the API key may need account credits depending on the selected model.

## Troubleshooting

- Check backend health at http://localhost:5001/health. It should show `provider: OpenRouter` and the configured model.
- If the app says the API key is missing/invalid, verify `OPENROUTER_API_KEY` in `server/.env` and restart the backend window.
- HTTP 402 can mean insufficient credits; HTTP 429 means rate-limited; HTTP 404 may mean the model ID is unavailable.
- Requests stop after 90 seconds. This prevents a stuck request from appearing to wait forever.
- Make sure Node.js is installed correctly and an active internet connection is available.
- If the frontend does not open automatically, manually visit http://localhost:5173.

## Notes

- Conversations are stored in server memory and reset when the backend restarts.
- Keep `server/.env` private; do not share your API key or upload that file publicly.
- A valid OpenRouter API key is required to communicate with the AI model.
- Internet connectivity is necessary because AI responses are generated through the OpenRouter online service.
- The application separates frontend and backend functionality to make development, maintenance, and troubleshooting easier.

Overall, Project AI provides a convenient way to use artificial intelligence through a Windows-compatible web application with simple installation and configurable AI model settings.
