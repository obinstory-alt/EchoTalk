
import React from 'react';
import { Dialogue } from '../types';
import { CheckCircle2, Home, ArrowRight, Quote } from 'lucide-react';

interface CompletionProps {
  dialogue: Dialogue;
  onGoHome: () => void;
}

export const Completion: React.FC<CompletionProps> = ({ dialogue, onGoHome }) => {
  return (
    <div className="p-6 min-h-full flex flex-col justify-center animate-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">학습 완료!</h1>
        <p className="text-slate-500 mt-2">오늘도 정말 수고하셨습니다.</p>
      </div>

      <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200 relative overflow-hidden mb-8">
        <Quote className="absolute top-4 left-4 w-12 h-12 text-blue-500 opacity-30" />
        <div className="relative z-10 space-y-6">
          <p className="text-lg font-medium leading-relaxed italic">
            "{dialogue.bibleVerse.en}"
          </p>
          <div className="space-y-1">
            <p className="text-blue-100 text-sm">
              {dialogue.bibleVerse.kr}
            </p>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">
              — {dialogue.bibleVerse.ref}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onGoHome}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-colors"
        >
          <Home className="w-5 h-5" />
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};
