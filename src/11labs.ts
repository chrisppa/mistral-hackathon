import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";


const viteKey = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_API_KEY) : undefined;
const processKey = typeof process !== "undefined" ? (process.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY) : undefined;

const apiKey = processKey || viteKey || "missing_api_key";

export const client = new ElevenLabsClient({
  apiKey: apiKey,
  environment: "https://api.elevenlabs.io",
});
