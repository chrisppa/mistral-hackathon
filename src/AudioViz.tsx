'use client';

import { useEffect, useState } from "react";
import { AudioPlayerButton, AudioPlayerDuration, AudioPlayerProgress, AudioPlayerProvider, AudioPlayerTime, useAudioPlayer, useAudioPlayerTime } from "./components/ui/audio-player";
import { BarVisualizer } from "./components/ui/bar-visualizer";
import { AudioScrubber } from "./components/ui/waveform";
import { generateWaveformData } from "./utils/audio-waveform";
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";

// Extend HTMLAudioElement to include captureStream method
interface HTMLAudioElementWithCapture extends HTMLAudioElement {
  captureStream(): MediaStream;
}

export function AudioViz({ src, transcript }: { src: string, transcript: ElevenLabs.ConversationHistoryTranscriptCommonModelOutput[] }) {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  // Generate waveform data when the audio source changes
  useEffect(() => {
    generateWaveformData(src, 550)
      .then(setWaveformData)
      .catch(console.error);
  }, [src]);

  const track = {
    id: "track-1",
    src: src,
    data: { title: "My Song", artist: "Artist Name" },
  };
  return (
    <>
      <AudioPlayerProvider>
        <div className="flex items-center gap-4">
          <AudioPlayerButton color="red" item={track} />
          <AudioPlayerProgress className="flex-1" />
          <AudioPlayerTime />
          <span>/</span>
          <AudioPlayerDuration />
        </div>
        <AudioBars waveformData={waveformData} transcript={transcript} />
        <CurrentTranscript transcript={transcript} />
      </AudioPlayerProvider>
    </>
  );
}

function formatTimestamp(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function Message({
  message,
  isCurrent
}: {
  message: ElevenLabs.ConversationHistoryTranscriptCommonModelOutput,
  isCurrent: boolean
}) {
  const isAgent = message.role === 'agent';
  const roleColor = isAgent ? "bg-black" : "bg-[#ffc600]";

  return (
    <div className={`${isCurrent ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs text-gray-400">
          {formatTimestamp(message.timeInCallSecs)}
        </p>
        <span className={`text-xs font-bold text-white ${roleColor} px-2 py-1 rounded-full`}>
          {isAgent ? 'AGENT' : 'USER'}
        </span>
      </div>
      <p className={`text-lg ${isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
        {message.message}
      </p>
    </div>
  );
}

function CurrentTranscript({ transcript }: { transcript: ElevenLabs.ConversationHistoryTranscriptCommonModelOutput[] }) {
  const time = useAudioPlayerTime();
  // Find the last message where the current time is greater than or equal to the message time
  const transcriptMessageIndex = transcript.findLastIndex(
    (message) => message.message && message.timeInCallSecs <= time
  ) ?? -1;

  const prevMessage = transcriptMessageIndex > 0 ? transcript[transcriptMessageIndex - 1] : null;
  const transcriptMessage = transcript[transcriptMessageIndex];
  const nextMessage = transcriptMessageIndex < transcript.length - 1 ? transcript[transcriptMessageIndex + 1] : null;

  return (
    <div className="mt-4 space-y-3">
      {prevMessage && <Message message={prevMessage} isCurrent={false} />}
      {transcriptMessage && <Message message={transcriptMessage} isCurrent={true} />}
      {nextMessage && <Message message={nextMessage} isCurrent={false} />}
    </div>
  )
}

function AudioBars({ waveformData, transcript }: { waveformData: number[], transcript: ElevenLabs.ConversationHistoryTranscriptCommonModelOutput[] }) {
  const {
    ref,
    activeItem,
    duration,
    seek,
  } = useAudioPlayer();
  const time = useAudioPlayerTime();

  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const audioElement = ref.current as HTMLAudioElementWithCapture | null;
    if (!audioElement) return;

    const handleLoadedMetadata = () => {
      try {
        const mediaStream = audioElement.captureStream();
        console.log('Stream created:', mediaStream);
        setStream(mediaStream);
      } catch (err) {
        console.error('Failed to capture stream:', err);
      }
    };

    // If metadata is already loaded, create stream immediately
    if (audioElement.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      // Otherwise wait for loadedmetadata event
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [ref, activeItem]); // Re-run when audio element or track changes

if (!duration) {
  console.log('No duration');
  return (
    <div>
      <p>No transcript available</p>
    </div>
  );
}
  return (
    <div>

      {/* <BarVisualizer state="listening" barCount={50} mediaStream={stream} /> */}
      <AudioScrubber
        data={waveformData}
        currentTime={time}
        duration={duration}
        transcript={transcript}
        barWidth={1}
        barGap={1}
        onSeek={(seconds) => {
          seek(seconds);
        }}
      />
    </div>
  );
}
