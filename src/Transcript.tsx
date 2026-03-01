import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";


interface TranscriptProps {
  messages: ElevenLabs.ConversationHistoryTranscriptCommonModelOutput[];
}

function formatTime(timestamp?: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function Transcript({ messages }: TranscriptProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-sm text-gray-500">The transcript will appear here once the conversation starts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Conversation Transcript
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </p>
        </div>

        {/* Messages */}
        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
          {messages.map((msg, index) => {
            const isAgent = msg.role === 'agent';

            return (
              <div key={index} className="flex gap-3">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
                  isAgent
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}>
                  {isAgent ? 'AI' : 'U'}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      isAgent ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {isAgent ? 'Agent' : 'User'}
                    </span>
                    {msg.timestamp && (
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
