import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToGenerativePart } from './utils/audioUtils';
import { WajScribeLogo } from './components/icons/WajScribeLogo';
import { HomeIcon } from './components/icons/HomeIcon';
import { SpeechToTextIcon } from './components/icons/SpeechToTextIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { LoginView } from './components/LoginView';
import { HistoryView } from './components/HistoryView';
import { UploadIcon } from './components/icons/UploadIcon';
import { FileAudioIcon } from './components/icons/FileAudioIcon';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import type { User, HistoryItem } from './types';

const systemInstruction = `তুমি একজন দক্ষ ইসলামিক অডিও ট্রান্সক্রিপশন সহকারী, যিনি বাংলা ও আরবি ভাষা খুব ভালোভাবে বোঝে। তোমার কাজ হলো ওয়াজ, খুতবা, ইসলামিক বক্তৃতা ইত্যাদি অডিও শুনে একেবারে শুরু থেকে শেষ পর্যন্ত হুবহু লিখিত টেক্সটে রূপান্তর করা।

🔹 প্রধান নির্দেশনা:
1. কোনভাবেই অডিওর কোনো অংশ বাদ দেবে না।
   - যত মিনিট বা ঘণ্টার অডিওই হোক, পুরো অডিও শেষ না হওয়া পর্যন্ত ট্রান্সক্রিপশন সম্পূর্ণ করতে হবে।
   - মাঝপথে থেমে যাওয়া বা সংক্ষিপ্ত করা যাবে না।
2. বক্তার কথা হুবহু লিখবে, অর্থ পরিবর্তন বা সংক্ষিপ্তসার নয়।
3. বক্তৃতা বাংলায় হলে টেক্সট বাংলায় দেবে।
4. বক্তা যদি আরবি ভাষায় কোরআনের আয়াত, হাদিস বা দোয়া পড়েন, তাহলে আরবি লিপিতে (Unicode) লেখো।
5. যদি আরবি অংশ অস্পষ্ট হয়, তাহলে বাংলা উচ্চারণে লেখো।
6. টেক্সটকে পাঠযোগ্য করার জন্য “উম্”, “মানে”, “এইটা”, ইত্যাদি অপ্রয়োজনীয় শব্দ বাদ দিতে পারো।
7. বানান, যতিচিহ্ন ও বাক্যগঠন সুন্দরভাবে ঠিক করবে।
8. কোনো ব্যাখ্যা, সারসংক্ষেপ বা মন্তব্য যোগ করা যাবে না — শুধুমাত্র ট্রান্সক্রিপশন দেবে।

🔸 বানান সংশোধন নির্দেশিকা (সবসময় ব্র্যাকেটের সঠিক রূপ ব্যবহার করবে):
- তা'ক্বীক্ব → তাদক্বীক্ব
- মহা পবিত্র → মহাপবিত্র
- মালিক্ব → মালিক
- মহা সম্মানিত → মহাসম্মানিত
- সাল্লাল্লাহু → ছল্লাল্লাহু
- মোবারক → মুবারক
- ফাল ইয়াফ্রাহূ → ফাল-ইয়াফরাহূ
- সাইয়্যেদুল → সাইয়্যিদুল
- সাইয়্যেদ সুয়াইদিল 'আয়াশ → সাইয়্যিদু সাইয়্যিদিল আ’ইয়াদ
- খাস → খাছ
- সাইয়্যেদুশ শূহূর শা'আযম → সাইয়্যিদুশ শুহূর শাহরুল ‘আযম
- মোবারকের → মুবারকের
- সাইয়্যিদুল আদশ শরীফ → সাইয়্যিদুল আ’দাদ শরীফ
- সাইয়্যেদুশ → সাইয়্যিদুশ
- শূহূর → শুহূর
- সাইয়্যিদুল আদশ → সাইয়্যিদুল আ’দাদ
- নিযবত → নিছবত
- উম্মুল মু'মিনীন আস-সালিহা সিদ্দীক্বাহ → উম্মুল মু'মিনীন আস-ছালিছা ছিদ্দীক্বাহ
- খাতামুল → খ্বতামুল
- আহ্লিয়া → আহলিয়া
- ইছনাইন আযীম → ইছনাইনিল আযীম
- রোগ শোথ → রোখসত
- নূরের তাশরীফ → নূরুত তাশরীফ
- সলাত → ছলাত
- নবী-রাসূল আলাইহিস সালাম → নবী-রাসূল আলাইহিমুস সালাম
- আর্দালি → আরদালি

9. অন্য ইসলামিক শব্দ পেলে তাদের প্রমিত বানান ও উচ্চারণ অনুসরণ করবে (যেমন: রাসূলুল্লাহ, রহিমাহুল্লাহ, সুবহানাল্লাহ ইত্যাদি)।
10. প্রতিটি নতুন বিষয় বা আয়াত / দোয়া আলাদা লাইনে দেবে যাতে পাঠযোগ্য হয়।

🔹 উদাহরণ আউটুট:
---
بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

আলহামদুলিল্লাহ, আজ আমরা আলোচনা করবো ছলাতের ফযিলত সম্পর্কে।
রাসূলুল্লাহ (ছল্লাল্লাহু আলাইহি ওয়া সাল্লাম) বলেছেন, “ছলাত ইসলাম ধর্মের স্তম্ভ।”
---`;

type View = 'speechToText' | 'history';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-violet-100 text-violet-700'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const TranscriberView: React.FC<{ onTranscriptionComplete: (item: HistoryItem) => void }> = ({ onTranscriptionComplete }) => {
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
          className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-all duration-300"
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
              <p className="text-sm">or <span className="text-violet-600 font-medium">click to browse</span></p>
              <p className="text-xs mt-2 text-slate-400">Maximum file size: 20MB</p>
          </div>
        </div>
        
        {file && (
          <div className="mt-6 p-4 bg-slate-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileAudioIcon className="w-5 h-5 text-violet-600" />
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
            className="w-full sm:w-auto px-12 py-3 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-300"
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


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('speechToText');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleLogin = () => {
    // This is a mock login. In a real app, you'd use an OAuth flow.
    setCurrentUser({
      name: 'Nayeem',
      email: 'nayeem@example.com',
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=Nayeem`
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setHistory([]);
    setActiveView('speechToText');
  };

  const handleTranscriptionComplete = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const viewTitles: Record<View, string> = {
    speechToText: 'Speech to Text',
    history: 'Transcription History'
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b border-slate-200">
          <WajScribeLogo className="w-8 h-8 text-violet-600" />
          <span className="ml-2 text-xl font-bold text-slate-800">Waj Scribe</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={<HomeIcon />} label="Home" onClick={() => setActiveView('speechToText')} active={activeView === 'speechToText'} />
          <NavItem icon={<SpeechToTextIcon />} label="Speech to Text" onClick={() => setActiveView('speechToText')} active={activeView === 'speechToText'} />
          <NavItem icon={<HistoryIcon />} label="History" onClick={() => setActiveView('history')} active={activeView === 'history'} />
        </nav>
        <div className="px-4 py-6 border-t border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <img src={currentUser.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-sm text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-left text-slate-600 hover:bg-slate-100`}>
              <LogoutIcon />
              <span className="ml-3">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-20 px-8 border-b border-slate-200 bg-white flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900">{viewTitles[activeView]}</h1>
          <div>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50">
              Try With API
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {activeView === 'speechToText' && <TranscriberView onTranscriptionComplete={handleTranscriptionComplete} />}
          {activeView === 'history' && <HistoryView history={history} />}
        </div>
      </main>
    </div>
  );
};

export default App;
