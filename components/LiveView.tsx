import React, { useState } from 'react';
import { useLiveConversation } from '../hooks/useLiveConversation';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { WajScribeLogo } from './icons/WajScribeLogo';
import type { Transcript } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';

export const LiveView: React.FC = () => {
    const {
        transcripts,
        isSessionActive,
        isConnecting,
        isMuted,
        startSession,
        stopSession,
        toggleMute,
    } = useLiveConversation();

    const TranscriptItem: React.FC<{ speaker: 'user' | 'model'; text: string }> = ({ speaker, text }) => {
        const isUser = speaker === 'user';
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        };

        return (
            <div className={`flex items-center gap-2 group ${isUser ? 'justify-end flex-row-reverse' : 'justify-start'} mb-4`}>
                 <div className={`max-w-lg p-3 rounded-lg ${isUser ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    <p className="text-sm">{text}</p>
                </div>
                <button 
                    onClick={handleCopy} 
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy text"
                >
                    {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <ClipboardIcon className="w-4 h-4" />
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900">Live Transcription 🎙️</h2>
                <p className="text-slate-500 mt-1">Start a live conversation and get real-time transcription.</p>
            </div>
            <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2">
                    {transcripts.length === 0 && !isSessionActive && !isConnecting && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                            <WajScribeLogo className="w-16 h-16 text-slate-300 mb-4"/>
                            <h3 className="text-lg font-semibold text-slate-600">Ready to talk?</h3>
                            <p>Click "Start Session" below to begin.</p>
                        </div>
                    )}
                    {transcripts.map((t, index) => (
                        <TranscriptItem key={index} speaker={t.speaker} text={t.text} />
                    ))}
                    {isConnecting && (
                        <div className="flex items-center justify-center text-slate-500">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Connecting...</span>
                        </div>
                    )}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-center space-x-4">
                    {!isSessionActive ? (
                        <button
                            onClick={startSession}
                            disabled={isConnecting}
                            className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                        >
                            <MicrophoneIcon className="w-5 h-5 mr-2" />
                            Start Session
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={stopSession}
                                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 flex items-center"
                            >
                                <StopIcon className="w-5 h-5 mr-2" />
                                Stop Session
                            </button>
                            <button
                                onClick={toggleMute}
                                className={`p-3 rounded-full transition-colors duration-200 ${isMuted ? 'bg-yellow-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMuted ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m-4 0l4 4" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    )}
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};