import type { ConversationSummaryResponseModel } from "@elevenlabs/elevenlabs-js/api";
import { AGENT_ID } from "../constants";
import { client } from "./11labs";

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

function Conversation({
  conversation,
}: {
  conversation: ConversationSummaryResponseModel;
}) {
  const statusConfig: Record<string, { bg: string, text: string, label: string }> = {
    done: { bg: 'bg-[#d8ebd8]', text: 'text-[#2a592a]', label: 'Completed' },
    in_progress: { bg: 'bg-[#d8e3eb]', text: 'text-[#2a4359]', label: 'In Progress' },
    failed: { bg: 'bg-[#ebd8d8]', text: 'text-[#592a2a]', label: 'Failed' },
  };

  const currentStatus = statusConfig[conversation.status] || { bg: 'bg-[#e3d8c3]', text: 'text-[#594d38]', label: conversation.status };

  return (
    <a
      href={`/conversations/${conversation.conversationId}`}
      className="block p-6 shadow-md transition-colors relative"
      style={{
        border: "2px solid #59381b",
        backgroundColor: "#e8cfb3",
        backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
      }}
    >
      <div className="absolute inset-1 border border-[#8a5732] opacity-30 pointer-events-none rounded-sm"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#3b2512] mb-1 drop-shadow-[1px_1px_0px_#fff]">
            {conversation.callSummaryTitle || 'Untitled Call'}
          </h3>
          <p className="text-sm text-[#59381b] italic">
            {formatDate(conversation.startTimeUnixSecs)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className={`px-3 py-1 rounded-sm text-xs font-bold border shadow-inner ${currentStatus.bg} ${currentStatus.text}`}
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
          >
            {currentStatus.label}
          </span>
          {conversation.callSuccessful && (
            <span 
              className={`px-3 py-1 rounded-sm text-xs font-bold border shadow-inner uppercase tracking-wider ${
                conversation.callSuccessful === 'success'
                  ? 'bg-[#c3d9b8] text-[#2a4d1a] border-[#8aab7c]'
                  : 'bg-[#d9b8b8] text-[#4d1a1a] border-[#ab7c7c]'
              }`}
            >
              {conversation.callSuccessful}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-sm p-3 shadow-inner" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid #a67c52" }}>
          <div className="text-xs text-[#59381b] font-bold uppercase tracking-wider mb-1">Duration</div>
          <div className="text-xl font-bold text-[#3b2512]">
            {formatDuration(conversation.callDurationSecs)}
          </div>
        </div>
        <div className="rounded-sm p-3 shadow-inner" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid #a67c52" }}>
          <div className="text-xs text-[#59381b] font-bold uppercase tracking-wider mb-1">Messages</div>
          <div className="text-xl font-bold text-[#3b2512]">
            {conversation.messageCount}
          </div>
        </div>
      </div>

      {conversation.transcriptSummary && (
        <div className="p-3 rounded-sm shadow-inner" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid #a67c52" }}>
          <p className="text-sm text-[#3b2512] font-medium leading-relaxed line-clamp-2">{conversation.transcriptSummary}</p>
        </div>
      )}
    </a>
  );
}

export async function Conversations() {
  try {
    const conversations = await client.conversationalAi.conversations.list({
      agentId: AGENT_ID,
    });

    return (
      <div className="w-full mt-10">
        <h2 className="text-3xl text-[#e8cfb3] mb-6 drop-shadow-[2px_2px_0px_#3b2512]" style={{ fontFamily: "'Rye', cursive" }}>
          Recent Conversations
        </h2>
        <div className="space-y-6 text-left">
          {conversations.conversations.map((conversation) => (
            <Conversation key={conversation.conversationId} conversation={conversation} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return (
      <div className="w-full mt-10">
        <h2 className="text-3xl text-[#e8cfb3] mb-6 drop-shadow-[2px_2px_0px_#3b2512]" style={{ fontFamily: "'Rye', cursive" }}>
          Recent Conversations
        </h2>
        <div 
          className="rounded-sm p-6 text-left shadow-md relative"
          style={{
            border: "2px solid #592a2a",
            backgroundColor: "#e8b3b3",
            backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
          }}
        >
          <div className="absolute inset-1 border border-[#a64d4d] opacity-30 pointer-events-none rounded-sm"></div>
          <p className="text-[#591616] font-bold text-lg">Failed to load conversations.</p>
          <p className="text-sm text-[#8c3d3d] mt-2 font-medium">
            {error instanceof Error ? error.message : "An unexpected network error occurred."}
          </p>
        </div>
      </div>
    );
  }
}
