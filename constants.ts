const viteAgentId = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_ELEVENLABS_AGENT_ID : undefined;
const processAgentId = typeof process !== 'undefined' && process.env ? process.env.VITE_ELEVENLABS_AGENT_ID : undefined;

export const AGENT_ID = processAgentId || viteAgentId || "agent_7601k6x6vbr7f4qbk713evw4qjbs";
