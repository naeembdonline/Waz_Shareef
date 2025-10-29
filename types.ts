export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  transcription: string;
  date: string;
}

export interface Transcript {
  speaker: 'user' | 'model';
  text: string;
}