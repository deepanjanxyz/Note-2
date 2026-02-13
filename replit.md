# NeuronPad - AI-Powered Smart Notepad

## Overview
NeuronPad is an AI-powered smart notepad app built with React Native (Expo) and Express backend. It features a dark glassmorphism UI, biometric authentication, rich text editing, AI summarization/grammar correction via Gemini API, and smart note categorization.

## Recent Changes
- **Feb 2026**: Initial build - full app with biometric lock, rich editor, AI panel, smart folders sidebar

## Architecture
- **Frontend**: Expo Router (file-based routing), React Native
- **Backend**: Express.js on port 5000 (AI proxy routes for Gemini API)
- **Storage**: AsyncStorage for local note persistence
- **AI**: Google Gemini API (requires GEMINI_API_KEY secret)
- **Auth**: expo-local-authentication for biometric lock screen

## Project Structure
```
app/
  _layout.tsx       - Root layout with fonts, providers
  index.tsx         - Home screen (lock + note list + sidebar)
  editor.tsx        - Note editor with rich text + AI panel
components/
  AIPanel.tsx       - AI summarize/grammar UI
  BiometricLock.tsx - Fingerprint/FaceID lock screen
  GlassCard.tsx     - Glassmorphism card component
  Logo.tsx          - SVG logo component
  NoteCard.tsx      - Note list item card
  RichTextToolbar.tsx - Bold/italic/bullets/highlight toolbar
  Sidebar.tsx       - Smart folders sidebar drawer
lib/
  ai-service.ts     - AI API client functions
  storage.ts        - AsyncStorage CRUD for notes
  query-client.ts   - React Query client setup
server/
  routes.ts         - AI proxy endpoints (/api/ai/summarize, /api/ai/grammar)
constants/
  colors.ts         - Dark glassmorphism theme colors
```

## User Preferences
- Dark theme (glassmorphism style)
- Production-ready, modular code
- No web-only code (must work on Android)
- GEMINI_API_KEY provided via Replit Secrets

## Key Dependencies
- @expo-google-fonts/inter (typography)
- expo-local-authentication (biometric)
- expo-crypto (UUID generation)
- react-native-reanimated (animations)
- react-native-svg (custom logo)
- @react-native-async-storage/async-storage
