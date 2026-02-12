
import React from 'react';
import { UserProgress, UserSettings } from '../types.ts';
import { Play, Settings as SettingsIcon, Trophy, Flame, Target } from 'lucide-react';

interface HomeProps {
  progress: UserProgress;
  settings: UserSettings;
  onStart: () => void;
  onOpenSettings: () => void;
}

export const Home: React.FC<HomeProps> = ({ progress, settings, onStart, onOpenSettings }) => {
  const progressPercent = (progress.completedSentences / 1000) * 100;
  const dailyPercent = (progress.dailySetsDone / settings.dailyGoal) * 100;

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">EchoTalk</h1>
          <p className="text-slate-500">목표까지 한 걸음 더!</p>
        </div>
        <button onClick={onOpenSettings} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <SettingsIcon className="w-6 h-6 text-slate-600" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center">
          <Trophy className="w-8 h-8 text-blue-600 mb-2" />
          <span className="text-2xl font-bold text-blue-900">{progress.completedSentences}</span>
          <span className="text-sm text-blue-600">누적 문장</span>
        </div>
        <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex flex-col items-center">
          <Flame className="w-8 h-8 text-orange-600 mb-2" />
          <span className="text-2xl font-bold text-orange-900">{progress.dailySetsDone}</span>
          <span className="text-sm text-orange-600">오늘의 세트</span>
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4" /> 전체 목표 (1,000 문장)
            </span>
            <span className="text-blue-600 font-bold">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">오늘의 학습 현황</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle 
                  cx="48" cy="48" r="40" fill="none" stroke="#10b981" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(1, dailyPercent / 100))}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-emerald-600">
                {progress.dailySetsDone}/{settings.dailyGoal}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                {dailyPercent >= 100 
                  ? "훌륭해요! 오늘의 목표를 달성했습니다. 🥳" 
                  : `오늘 목표까지 ${settings.dailyGoal - progress.dailySetsDone}세트 남았습니다.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={onStart}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <Play className="fill-current" />
        학습 시작하기
      </button>

      <div className="text-center">
        <p className="text-xs text-slate-400">EchoTalk은 당신의 꾸준한 노력을 응원합니다.</p>
      </div>
    </div>
  );
};
