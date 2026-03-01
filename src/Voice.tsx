"use client";

import { useConversation, type Role } from "@elevenlabs/react";
import { AGENT_ID } from "../constants";
import { useState, useEffect } from "react";

function usePizzaConvo() {
  const [transcription, setTranscription] = useState<{ message: string, source: Role }[]>([]);
  const conversation = useConversation({
    onMessage: (message) => {
      console.log(message);
      setTranscription((prev) => [...prev, message]);
    }
  });
  return { ...conversation, transcription };
}




export function Voice() {
  const { status, isSpeaking, startSession, endSession, transcription, changeInputDevice } = usePizzaConvo();
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Enumerate audio input devices on mount
  useEffect(() => {
    async function getDevices() {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs);

        // Set default device if available
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    }

    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  // Handle device selection
  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);

    if (isConnected && changeInputDevice) {
      try {
        await changeInputDevice({
          sampleRate: 16000,
          format: 'pcm',
          preferHeadphonesForIosDevices: true,
          inputDeviceId: deviceId,
        });
        console.log('Changed to device:', deviceId);
      } catch (error) {
        console.error('Error changing input device:', error);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Main Chat Box */}
      <div 
        className="rounded-sm p-8 shadow-md relative"
        style={{
          border: "2px solid #59381b",
          backgroundColor: "#e8cfb3",
          backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
        }}
      >
        <div className="absolute inset-1 border border-[#8a5732] opacity-30 pointer-events-none rounded-sm"></div>

        <h2 className="text-3xl text-[#3b2512] mb-6 drop-shadow-[1px_1px_0px_#fff]" style={{ fontFamily: "'Rye', cursive" }}>
          Chat with Agent
        </h2>

        {/* Status Bar */}
        <div 
          className="flex flex-col items-center justify-center mb-6 p-4 rounded-md shadow-inner"
          style={{
            border: "1px solid #a67c52",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#59381b] font-bold uppercase tracking-wider">Status:</span>
            <span className="px-3 py-1 rounded text-sm font-bold shadow-sm bg-[#d4b38c] text-[#3b2512] border border-[#a67c52]">
              {status || 'disconnected'}
            </span>
          </div>
          {isConnected && (
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-[#59381b] font-bold uppercase tracking-wider">Speaking:</span>
              <span className={`px-3 py-1 rounded text-sm font-bold shadow-sm border ${
                isSpeaking
                  ? 'bg-[#c25e22] text-white border-[#8c3d10]'
                  : 'bg-[#d4b38c] text-[#3b2512] border-[#a67c52]'
              }`}>
                {isSpeaking ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>

        {/* Microphone Selector */}
        {audioDevices.length > 0 && (
          <div className="mb-8 text-left">
            <label htmlFor="microphone-select" className="block text-sm font-bold text-[#59381b] mb-2">
              Microphone
            </label>
            <select
              id="microphone-select"
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full px-3 py-2 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-[#8a5732] font-medium"
              style={{
                backgroundColor: "#e3c49e",
                border: "1px solid #a67c52",
                color: "#3b2512"
              }}
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Default`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          {!isConnected && (
            <button
              onClick={async () => {
                await startSession({
                  agentId: AGENT_ID,
                  apiKey: import.meta.env?.VITE_ELEVENLABS_API_KEY,
                  connectionType: "webrtc",
                  inputDeviceId: selectedDeviceId,
                }).catch((error) => {
                  console.error('Error starting session:', error);
                });
              }}
              disabled={isConnecting}
              className={`w-full max-w-sm px-6 py-4 rounded-md font-bold text-xl transition-all shadow-[0_4px_0_#8c3d10] active:translate-y-1 active:shadow-none ${
                isConnecting
                  ? 'bg-[#a67c52] text-[#e8cfb3] border-2 border-[#8c3d10] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#d96626] to-[#b34b17] text-white border-2 border-[#592209] hover:brightness-110'
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Start Call'}
            </button>
          )}
          {isConnected && (
            <button
              onClick={endSession}
              className="w-full max-w-sm px-6 py-4 rounded-md font-bold text-xl transition-all shadow-[0_4px_0_#591616] active:translate-y-1 active:shadow-none bg-gradient-to-b from-[#a32a2a] to-[#731919] text-white border-2 border-[#400d0d] hover:brightness-110"
            >
              End Call
            </button>
          )}
        </div>
      </div>

      {/* Transcript Box */}
      <div 
        className="mt-6 rounded-sm p-6 shadow-md relative text-center min-h-[120px] flex flex-col items-center justify-center"
        style={{
          border: "2px solid #59381b",
          backgroundColor: "#e8cfb3",
          backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png")`,
        }}
      >
         <div className="absolute inset-1 border border-[#8a5732] opacity-30 pointer-events-none rounded-sm"></div>
         
        {transcription.length === 0 ? (
          <>
            <h3 className="text-xl font-bold text-[#3b2512] mb-2" style={{ fontFamily: "'Rye', cursive" }}>No messages yet</h3>
            <p className="text-sm text-[#59381b] italic">The transcript will appear here once the conversation starts.</p>
          </>
        ) : (
          <div className="w-full space-y-4 text-left overflow-y-auto max-h-[300px] pr-2">
            {transcription.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-md border ${msg.role === 'agent' ? 'bg-[#f4e6d4] border-[#d4b38c]' : 'bg-[#d9c4aa] border-[#a67c52] text-right'}`}>
                 <span className="block text-xs font-bold text-[#8a5732] uppercase mb-1">{msg.role}</span>
                 <p className="text-[#3b2512] font-medium leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
