import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToGenerativePart } from '../utils/audioUtils';
import { UploadIcon } from './icons/UploadIcon';
import { FileAudioIcon } from './icons/FileAudioIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import type { HistoryItem } from '../types';

interface TranscriberViewProps {
  onTranscriptionComplete: (item: HistoryItem) => void;
  systemInstruction: string;
}

export const TranscriberView: React.FC<TranscriberViewProps> = ({ onTranscriptionComplete, systemInstruction }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | undefined) => {
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) { // 20 MB limit
        setError('File is too large. Please upload an audio file under 20MB.');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
        setTranscription('');
      }
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setTranscription('');
    setCopySuccess(false);

    try {
      const audioPart = await fileToGenerativePart(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart] },
        config: {
          systemInstruction: systemInstruction
        }
      });

      const text = response.text;
      setTranscription(text);

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        fileName: file.name,
        transcription: text,
        date: new Date().toLocaleString()
      };
      onTranscriptionComplete(newHistoryItem);

    } catch (e) {
      console.error(e);
      setError('An error occurred during transcription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(transcription).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
        handleFileChange(droppedFile);
    } else {
        setError('Invalid file type. Please drop an audio file.');
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Hello there! 👋</h2>
        <p className="text-slate-500 mt-1">Ready to transcribe? Upload your audio file to get started.</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div 
          className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            accept="audio/*"
            className="hidden"
          />
          <div className="flex flex-col items-center text-slate-500">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <UploadIcon className="w-8 h-8 text-slate-500" />
              </div>
              <p className="font-semibold">Drag & drop your file here</p>
              <p className="text-sm">or <span className="text-emerald-600 font-medium">click to browse</span></p>
              <p className="text-xs mt-2 text-slate-400">Maximum file size: 20MB</p>
          </div>
        </div>
        
        {file && (
          <div className="mt-6 p-4 bg-slate-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileAudioIcon className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-slate-700 text-sm">{file.name}</span>
              <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Remove</button>
          </div>
        )}

        {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
        
        <div className="mt-8 text-center">
          <button
            onClick={handleTranscribe}
            disabled={!file || isProcessing}
            className="w-full sm:w-auto px-12 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
              </div>
            ) : (
              'Transcribe Audio'
            )}
          </button>
        </div>
      </div>

      {transcription && (
        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-700">Transcription Result</h2>
            <button onClick={handleCopy} className="flex items-center px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400">
                <ClipboardIcon className="w-4 h-4 mr-2" />
                {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-slate-800 border border-slate-200" style={{ fontFamily: 'Kalpurush, Arial, sans-serif' }}>
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
};