import React from 'react';
import type { HistoryItem } from '../types';
import { FileAudioIcon } from './icons/FileAudioIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface HistoryViewProps {
  history: HistoryItem[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a temporary "Copied!" state for each item if desired
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-700">No transcriptions yet</h2>
        <p className="max-w-xs mt-1">Your past transcription results will appear here once you transcribe an audio file.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {history.map((item) => (
        <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <FileAudioIcon className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <h3 className="font-semibold text-slate-800">{item.fileName}</h3>
              </div>
              <p className="text-xs text-slate-500 ml-8">{item.date}</p>
            </div>
            <button onClick={() => handleCopy(item.transcription)} className="flex items-center px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 flex-shrink-0">
                <ClipboardIcon className="w-4 h-4 mr-2" />
                Copy
            </button>
          </div>
          <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-slate-800 border border-slate-200 text-sm" style={{ fontFamily: 'Kalpurush, Arial, sans-serif' }}>
            <p className="truncate">{item.transcription}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
