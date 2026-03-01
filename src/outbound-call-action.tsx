'use server'

import { client } from "./11labs";
import { AGENT_ID } from "../constants";

export async function makeOutboundCall(phoneNumber: string) {
  try {
    // You need to set your agent's phone number ID in the environment variables
    const agentPhoneNumberId = import.meta.env.VITE_ELEVENLABS_PHONE_NUMBER_ID || import.meta.env.ELEVENLABS_PHONE_NUMBER_ID;

    if (!agentPhoneNumberId) {
      throw new Error("ELEVENLABS_PHONE_NUMBER_ID is not configured. Please add it to your .env file.");
    }

    const response = await client.conversationalAi.twilio.outboundCall({
      agentId: AGENT_ID,
      agentPhoneNumberId: agentPhoneNumberId,
      toNumber: phoneNumber,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error making outbound call:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to make call",
    };
  }
}
