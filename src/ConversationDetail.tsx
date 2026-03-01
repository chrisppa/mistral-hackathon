import { client } from "./11labs";
import { Transcript } from "./Transcript";
import { CallAudio } from "./CallAudio";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(unixSecs: number) {
  const date = new Date(unixSecs * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}


export async function ConversationDetail({
  conversationId
}: {
  conversationId: string
}) {
  let conversation;
  try {
    conversation = await client.conversationalAi.conversations.get(
      conversationId
    );
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-lg font-semibold text-red-800 mb-2">Error Loading Conversation</h1>
          <p className="text-sm text-red-700">
            Failed to load the details for this conversation. {error instanceof Error ? error.message : "Unknown network error."}
          </p>
        </div>
      </div>
    );
  }

  const analysis = conversation.analysis;
  console.log('Conversation:', conversation);

  const statusColors: Record<string, { bg: string, text: string, label: string }> = {
    done: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
    in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
  };

  const currentStatus = statusColors[conversation.status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: conversation.status };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Header Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {analysis?.callSummaryTitle || "Untitled Call"}
              </h1>
              <p className="text-sm text-gray-500">
                {formatDate(conversation.metadata.startTimeUnixSecs)}
                {" × "}
                {formatDuration(conversation.metadata.callDurationSecs)}
              </p>
              <p className="text-sm text-gray-500">
                {analysis?.transcriptSummary}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded text-xs font-medium border ${currentStatus.bg} ${currentStatus.text}`}
              >
                {currentStatus.label}
              </span>
              {analysis?.callSuccessful && (
                <span
                  className={`px-3 py-1 rounded text-xs font-medium border ${
                    analysis?.callSuccessful === "success"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {analysis.callSuccessful}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-3">
            Details
          </div>
          <div className="space-y-2">
            {conversation.direction && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Direction:</span>
                <span className="text-xs font-medium text-gray-900 capitalize">
                  {conversation.direction}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Conversation ID:</span>
              <code className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                {conversation.conversationId}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Agent ID:</span>
              <code className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                {conversation.agentId}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Section */}
      <div className="mt-6">
        <CallAudio
          conversation={conversation}
          conversationId={conversationId}
        />
      </div>

      {/* Data Collection Results Section */}
      {analysis?.dataCollectionResults &&
        Object.keys(analysis.dataCollectionResults).length > 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Data Collection Results
            </h2>
            <div className="space-y-4">
              {Object.entries(analysis.dataCollectionResults).map(
                ([key, result]: [string, any]) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {result.dataCollectionId}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono">
                        {result.jsonSchema?.type || "unknown"}
                      </span>
                    </div>

                    {result.jsonSchema?.description && (
                      <p className="text-xs text-gray-600 mb-3 italic">
                        {result.jsonSchema.description}
                      </p>
                    )}

                    {result.value && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Value:
                        </div>
                        <div className="bg-white rounded px-3 py-2 border border-gray-300">
                          <code className="text-sm text-gray-900">
                            {typeof result.value === "object"
                              ? JSON.stringify(result.value, null, 2)
                              : String(result.value)}
                          </code>
                        </div>
                      </div>
                    )}

                    {result.rationale && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Rationale:
                        </div>
                        <p className="text-xs text-gray-700 bg-white rounded px-3 py-2 border border-gray-300">
                          {result.rationale}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* Transcript Section */}
      {conversation.transcript &&
        Array.isArray(conversation.transcript) &&
        conversation.transcript.length > 0 && (
          <div className="mt-6">
            <Transcript
              messages={conversation.transcript.map((msg: any) => ({
                role:
                  msg.role === "agent" || msg.source === "ai"
                    ? "agent"
                    : "user",
                message: msg.message || msg.text || msg.content || "",
                timestamp: msg.timestamp || msg.time,
              }))}
            />
          </div>
        )}
    </div>
  );
}
