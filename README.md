<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1qKuOfE1hzkEYX3VaO-QNQxmzuqyPAy9s

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` (see [.env.example](.env.example)) and set `GEMINI_API_KEY`
3. Run the app:
   `npm run dev`

## Deploy (Netlify)

1. In Netlify, set an environment variable: `GEMINI_API_KEY`
2. Build command: `npm run build`
3. Publish directory: `dist`

## Local dev (recommended)

Because Gemini runs through Netlify Functions, the easiest local workflow is:

1. Install Netlify CLI (one-time): `npm i -g netlify-cli`
2. Run: `netlify dev`

### Important security note

Do not ship API keys to the browser. If your Gemini calls happen in client-side code, the key can be exposed.
For production, prefer calling Gemini from a server-side function (e.g., Netlify Functions) and have the frontend call that endpoint instead.
