import { Voice } from "./Voice.tsx";
import { Conversations } from "./Conversations.tsx";
import { ConversationDetail } from "./ConversationDetail.tsx";

export function App(props: { url: URL }) {
  const pathname = props.url.pathname;

  // Parse route
  const conversationMatch = pathname.match(/^\/conversations\/(.+)$/);

  return (
    <div 
      className="min-h-screen font-serif text-[#3b2512] flex flex-col items-center py-10"
      style={{
        backgroundColor: "#6e4524",
        backgroundImage: `url("https://www.transparenttextures.com/patterns/stucco.png"), radial-gradient(circle, #8a5732 0%, #4a2d15 100%)`,
        backgroundBlendMode: "multiply",
      }}
    >
      {/* Outer Decorative Frame */}
      <div 
        className="w-full max-w-4xl p-2 md:p-6 rounded-sm shadow-2xl relative"
        style={{
          border: "4px solid #3b2512",
          outline: "1px solid #8a5732",
          outlineOffset: "-6px",
          backgroundColor: "#b48858",
          backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
        }}
      >
        
        {/* Navigation Header */}
        <div className="text-center pb-6 mb-6 border-b-2 border-[#8a5732] shadow-[0_4px_2px_-2px_rgba(0,0,0,0.1)]">
          <a
            href="/"
            className="text-4xl md:text-5xl font-bold tracking-wide uppercase drop-shadow-[1px_1px_0px_#fff]"
            style={{ 
              fontFamily: "'Rye', cursive",
              color: "#3b2512",
              textShadow: "1px 1px 0px rgba(255,255,255,0.3)"
            }}
          >
            Mistral Hackathon Oracle
          </a>
          <p className="text-[#59381b] text-lg mt-3 font-medium italic relative inline-block">
            <span className="opacity-50 absolute -left-8 top-1">~</span>
            Ask about the worldwide hackathon!
            <span className="opacity-50 absolute -right-8 top-1">~</span>
          </p>
        </div>

        {/* Route Content */}
        {conversationMatch ? (
          <div className="p-4">
            <ConversationDetail conversationId={conversationMatch[1]} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full flex flex-col justify-center">
            <div className="space-y-8 w-full">
              <Voice />
              <Conversations />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
