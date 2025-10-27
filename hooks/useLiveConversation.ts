import { useState, useCallback, useRef } from 'react';
// FIX: Removed non-exported type `LiveSession` from import.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
// FIX: The `Transcript` type was imported from an empty file.
import { encode, decode, decodeAudioData, createBlob } from '../utils/audioUtils';

// FIX: Define Transcript interface locally as types.ts is empty.
interface Transcript {
  speaker: 'user' | 'model';
  text: string;
}

// FIX: Define LiveSession interface locally as it's not exported from @google/genai.
interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: Blob }): void;
}

// Polyfill for webkit browsers
// FIX: Cast window to any to support vendor-prefixed webkitAudioContext for older browsers.
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export const useLiveConversation = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const outputPlaybackSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  const stopSession = useCallback(async () => {
    setIsSessionActive(false);

    if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
        sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    
    outputPlaybackSources.current.forEach(source => source.stop());
    outputPlaybackSources.current.clear();

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';

  }, []);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setTranscripts([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a friendly and helpful assistant. Keep your responses concise and conversational.'
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsSessionActive(true);

            if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
            
            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                if (isMuted) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob: Blob = createBlob(inputData);
                sessionPromiseRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                currentOutputTranscriptionRef.current += text;
            } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                currentInputTranscriptionRef.current += text;
            }

            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscriptionRef.current.trim();
                const fullOutput = currentOutputTranscriptionRef.current.trim();

                setTranscripts(prev => {
                    const newTranscripts = [...prev];
                    if(fullInput) newTranscripts.push({ speaker: 'user', text: fullInput });
                    if(fullOutput) newTranscripts.push({ speaker: 'model', text: fullOutput });
                    return newTranscripts;
                });
                
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                
                source.addEventListener('ended', () => {
                    outputPlaybackSources.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                outputPlaybackSources.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                outputPlaybackSources.current.forEach(source => source.stop());
                outputPlaybackSources.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setIsConnecting(false);
            stopSession();
          },
          onclose: () => {
            console.log('Session closed.');
            stopSession();
          },
        },
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsConnecting(false);
    }
  }, [stopSession, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    transcripts,
    isSessionActive,
    isConnecting,
    isMuted,
    startSession,
    stopSession,
    toggleMute,
  };
};
