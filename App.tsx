import React, { useState } from 'react';
import { WajScribeLogo } from './components/icons/WajScribeLogo';
import { SpeechToTextIcon } from './components/icons/SpeechToTextIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { LoginView } from './components/LoginView';
import { HistoryView } from './components/HistoryView';
import { TranscriberView } from './components/TranscriberView';
import { LiveView } from './components/LiveView';
import { LiveIcon } from './components/icons/LiveIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import type { User, HistoryItem } from './types';

// System instruction for file-based transcription
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
- সাইয়্যিদুল আদש শরীফ → সাইয়্যিদুল আ’দাদ শরীফ
- সাইয়্যেদুশ → সাইয়্যিদুש
- শূহূর → শুহূর
- সাইয়্যিদুল আদש → সাইয়্যিদুল আ’দাদ
- নিযবত → নিছবত
- উম্মুল মু'মিনীন আস-সালিহা সিদ্দীক্বাহ → উম্মুল মু’মিনীন আস-ছালিছা ছিদ্দীক্বাহ
- খাতামুল → খ্বতামুল
- আহ্লিয়া → আহলিয়া
- ইছনাইন আযীম → ইছনাইনিল আযীম
- রোগ শোথ → রোখসত
- নূরের তাשরীফ → নূরুত তাשরীফ
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

type View = 'speechToText' | 'live' | 'history';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-emerald-100 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('speechToText');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = () => {
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

  const handleViewChange = (view: View) => {
    setActiveView(view);
    setIsSidebarOpen(false); // Close sidebar on navigation on mobile
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const viewTitles: Record<View, string> = {
    speechToText: 'Transcribe File',
    live: 'Live Transcription',
    history: 'Transcription History'
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-20 border-b border-slate-200">
        <WajScribeLogo className="w-8 h-8 text-emerald-600" />
        <span className="ml-2 text-xl font-bold text-slate-800">Waj Scribe</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem icon={<SpeechToTextIcon />} label="Transcribe File" onClick={() => handleViewChange('speechToText')} active={activeView === 'speechToText'} />
        <NavItem icon={<LiveIcon />} label="Live Transcription" onClick={() => handleViewChange('live')} active={activeView === 'live'} />
        <NavItem icon={<HistoryIcon />} label="History" onClick={() => handleViewChange('history')} active={activeView === 'history'} />
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
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-30 transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'bg-black/30' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-full bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-20 px-4 sm:px-8 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center">
            <button className="lg:hidden mr-4 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
                <MenuIcon />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{viewTitles[activeView]}</h1>
          </div>
          <div>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50">
              Try With API
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeView === 'speechToText' && <TranscriberView onTranscriptionComplete={handleTranscriptionComplete} systemInstruction={systemInstruction} />}
          {activeView === 'live' && <LiveView />}
          {activeView === 'history' && <HistoryView history={history} />}
        </div>
      </main>
    </div>
  );
};

export default App;