import type { GetConversationResponseModel } from "@elevenlabs/elevenlabs-js/api";
import { client } from "./11labs";
import { AudioViz } from "./AudioViz";

export async function CallAudio({
  conversation,
  conversationId
}: {
  conversationId: string
  conversation: GetConversationResponseModel
}) {
  try {
    // Fetch the audio from ElevenLabs
    const audioStream = await client.conversationalAi.conversations.audio.get(conversationId);
    console.log(audioStream);

    // Convert the ReadableStream to an ArrayBuffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioData = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioData.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64
    const base64Audio = btoa(
      Array.from(audioData)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-3">
          Call Recording
        </div>

        <AudioViz transcript={conversation.transcript ?? []} src={audioDataUrl} />


        {/* <audio controls className="w-full" preload="metadata">
          <source src={audioDataUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio> */}
      </div>
    );
  } catch (error) {
    console.error('Error fetching audio:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isMissingAudio = errorMessage.includes('missing_conversation_audio') || errorMessage.includes('404');

    if (isMissingAudio) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No audio recording available for this conversation.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-xs text-red-600 uppercase tracking-wide font-medium mb-2">
          Audio Error
        </div>
        <p className="text-sm text-red-700">
          Failed to load audio recording. {errorMessage}
        </p>
      </div>
    );
  }
}
