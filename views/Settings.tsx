
import React from 'react';
import { UserSettings } from '../types';
import { ChevronLeft, Save } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings, onClose }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 min-h-full bg-slate-50">
      <header className="bg-white p-4 flex items-center gap-4 border-b border-slate-100">
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">학습 설정</h1>
      </header>

      <div className="p-6 space-y-8">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            📊 일일 학습 목표
          </h3>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-600">
              하루 몇 개의 세트를 완성할까요?
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={settings.dailyGoal} 
                onChange={(e) => setSettings({...settings, dailyGoal: parseInt(e.target.value)})}
                className="flex-1 accent-blue-600"
              />
              <span className="w-12 text-center font-bold text-blue-600 text-lg">{settings.dailyGoal}</span>
            </div>
            <p className="text-xs text-slate-400">일일 목표가 높을수록 실력이 빠르게 향상됩니다.</p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            🎯 발음 목표 정확도
          </h3>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-600">
              어느 정도의 정확도에 도달해야 할까요?
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="50" 
                max="95" 
                step="5"
                value={settings.targetAccuracy} 
                onChange={(e) => setSettings({...settings, targetAccuracy: parseInt(e.target.value)})}
                className="flex-1 accent-emerald-500"
              />
              <span className="w-12 text-center font-bold text-emerald-600 text-lg">{settings.targetAccuracy}%</span>
            </div>
            <p className="text-xs text-slate-400">높은 점수를 설정하면 더 완벽한 발음을 구사할 수 있습니다.</p>
          </div>
        </section>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"
        >
          <Save className="w-5 h-5" />
          설정 저장하기
        </button>
      </div>
    </div>
  );
};
