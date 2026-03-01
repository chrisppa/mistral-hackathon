/**
 * Analyzes an audio file and generates waveform data
 * @param audioUrl - URL of the audio file to analyze
 * @param samples - Number of samples/bars to generate (default: 100)
 * @returns Promise<number[]> - Array of normalized amplitude values (0-1)
 */
export async function generateWaveformData(
  audioUrl: string,
  samples: number = 100
): Promise<number[]> {
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    // Create an audio context
    const audioContext = new AudioContext();

    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get the raw audio data from the first channel
    const rawData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(rawData.length / samples);
    const waveformData: number[] = [];

    // Sample the audio data
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      let sum = 0;

      // Calculate RMS (Root Mean Square) for this block
      for (let j = 0; j < blockSize; j++) {
        const sample = rawData[start + j] || 0;
        sum += sample * sample;
      }

      const rms = Math.sqrt(sum / blockSize);
      waveformData.push(rms);
    }

    // Normalize the data to 0-1 range
    const max = Math.max(...waveformData);
    const normalizedData = waveformData.map((value) => value / max);

    // Close the audio context to free up resources
    audioContext.close();

    return normalizedData;
  } catch (error) {
    console.error('Error generating waveform data:', error);
    throw error;
  }
}

/**
 * Analyzes a live audio stream and generates real-time amplitude data
 * @param mediaStream - MediaStream from an audio element
 * @param onData - Callback that receives amplitude value (0-1) for each frame
 * @returns Cleanup function to stop analysis
 */
export function analyzeLiveAudioStream(
  mediaStream: MediaStream,
  onData: (amplitude: number) => void
): () => void {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(mediaStream);

  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;

  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let animationFrame: number;

  const analyze = () => {
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    onData(rms);
    animationFrame = requestAnimationFrame(analyze);
  };

  analyze();

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationFrame);
    source.disconnect();
    analyser.disconnect();
    audioContext.close();
  };
}

/**
 * Pre-generates waveform data for a list of audio URLs
 * Useful for pre-loading waveforms for multiple tracks
 */
export async function batchGenerateWaveforms(
  audioUrls: string[],
  samples: number = 100
): Promise<Map<string, number[]>> {
  const waveforms = new Map<string, number[]>();

  await Promise.all(
    audioUrls.map(async (url) => {
      try {
        const data = await generateWaveformData(url, samples);
        waveforms.set(url, data);
      } catch (error) {
        console.error(`Failed to generate waveform for ${url}:`, error);
      }
    })
  );

  return waveforms;
}

