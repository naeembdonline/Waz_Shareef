import React from 'react';
import { WajScribeLogo } from './icons/WajScribeLogo';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-md border border-slate-200 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <WajScribeLogo className="w-12 h-12 text-emerald-600" />
          <span className="ml-3 text-3xl font-bold text-slate-800">Waj Scribe</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
        <p className="text-slate-500 mb-8">Sign in to continue to your dashboard.</p>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          <GoogleIcon className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>
        <p className="text-xs text-slate-400 mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};