# Mistral Hackathon Oracle 🤠

The **Mistral Hackathon Oracle** is an interactive, browser-based voice agent designed specifically for the **Mistral AI Worldwide Hackathon 2026**. 

Built with a stylized, vintage "Wild West" aesthetic, this oracle acts as a chill, knowledgeable "cowboy buddy." It allows users to have real-time, low-latency voice conversations directly in their browser to learn everything they need to know about the hackathon—from schedules and prizes to global locations and rules.

## Features

- **Real-Time Voice AI:** Utilizes WebRTC for instant, low-latency, conversational voice interactions in the browser.
- **Custom Persona:** Powered by a deeply customized system prompt that gives the agent a warm, easy-going cowboy persona with comprehensive knowledge of the Mistral Hackathon.
- **Thematic UI/UX:** A highly customized frontend built with Tailwind CSS, featuring aged parchment textures, deep sepia tones, and western typography (`Rye` font).
- **Conversation History:** Automatically fetches and displays past conversation summaries, durations, and success states.
- **Data Collection:** The agent actively listens and extracts structured data from conversations, such as the user's topics of interest and project ideas.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Voice AI / WebRTC:** [ElevenLabs Conversational AI SDK](https://elevenlabs.io/) (`@elevenlabs/react`, `@elevenlabs/elevenlabs-js`)
- **Language Model:** Powered by Mistral AI (configured via ElevenLabs platform overrides)
- **Deployment & Tooling:** Node.js, TypeScript

## Setup & Local Development

### Prerequisites
- Node.js (v20+ recommended)
- An [ElevenLabs](https://elevenlabs.io/) account with an active API Key and a Conversational Agent created.

### 1. Clone the repository
\`\`\`bash
git clone git@github.com:chrisppa/mistral-hackathon.git
cd mistral-hackathon
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

### 3. Environment Configuration
Create a `.env` file in the root directory based on the provided example:
\`\`\`bash
cp .env.example .env
\`\`\`
Add your credentials to the `.env` file:
\`\`\`env
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
\`\`\`

### 4. Update the Agent Prompt
Before running the frontend, you must push the custom cowboy persona and data collection schema to your ElevenLabs agent:
\`\`\`bash
npx tsx src/update-agent.ts
\`\`\`
*Note: This script requires your ElevenLabs API key to be set in the `.env` file.*

### 5. Start the Development Server
\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`
Navigate to `http://localhost:5173` to start chatting with the Oracle.

## Usage

1. Open the application in your browser.
2. Select your preferred **Microphone** from the dropdown menu.
3. Click the **"Saddle Up (Start Call)"** button.
4. Wait for the status to change to "Connected", and start talking! 

*Tip: Try asking, "What are the prizes for the global winner?" or "When do presentations start?"*

## License

MIT
