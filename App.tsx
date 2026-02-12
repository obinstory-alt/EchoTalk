
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, UserSettings, UserProgress, Dialogue, PracticeStep, PracticeStep as Step } from './types';
import { DIALOGUE_DB, STORAGE_KEYS } from './constants';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { PracticeSession } from './views/PracticeSession';
import { Settings } from './views/Settings';
import { Completion } from './views/Completion';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>(AppState.HOME);
  const [settings, setSettings] = useState<UserSettings>({
    dailyGoal: 5,
    targetAccuracy: 80
  });
  const [progress, setProgress] = useState<UserProgress>({
    completedSentences: 0,
    dailySetsDone: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    currentDialogueId: DIALOGUE_DB[0].id
  });

  // Load data
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const savedProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      const today = new Date().toISOString().split('T')[0];
      // Reset daily sets if it's a new day
      if (parsed.lastActiveDate !== today) {
        parsed.dailySetsDone = 0;
        parsed.lastActiveDate = today;
      }
      setProgress(parsed);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }, [settings, progress]);

  const handleStartPractice = () => {
    setCurrentPage(AppState.PRACTICE);
  };

  const handleFinishDialogue = (dialogueId: string, sentencesCount: number) => {
    setProgress(prev => {
      const nextId = (parseInt(dialogueId) % DIALOGUE_DB.length) + 1;
      return {
        ...prev,
        completedSentences: prev.completedSentences + sentencesCount,
        dailySetsDone: prev.dailySetsDone + 1,
        currentDialogueId: String(nextId)
      };
    });
    setCurrentPage(AppState.COMPLETED);
  };

  const renderPage = () => {
    switch (currentPage) {
      case AppState.HOME:
        return (
          <Home 
            progress={progress} 
            settings={settings} 
            onStart={handleStartPractice}
            onOpenSettings={() => setCurrentPage(AppState.SETTINGS)}
          />
        );
      case AppState.PRACTICE:
        const currentDialogue = DIALOGUE_DB.find(d => d.id === progress.currentDialogueId) || DIALOGUE_DB[0];
        return (
          <PracticeSession 
            dialogue={currentDialogue} 
            settings={settings}
            onFinish={handleFinishDialogue}
            onExit={() => setCurrentPage(AppState.HOME)}
          />
        );
      case AppState.SETTINGS:
        return (
          <Settings 
            settings={settings} 
            setSettings={setSettings} 
            onClose={() => setCurrentPage(AppState.HOME)} 
          />
        );
      case AppState.COMPLETED:
        const finishedDialogue = DIALOGUE_DB.find(d => d.id === (parseInt(progress.currentDialogueId) - 1 || DIALOGUE_DB.length).toString()) || DIALOGUE_DB[0];
        return (
          <Completion 
            dialogue={finishedDialogue}
            onGoHome={() => setCurrentPage(AppState.HOME)}
          />
        );
      default:
        return <Home progress={progress} settings={settings} onStart={handleStartPractice} onOpenSettings={() => setCurrentPage(AppState.SETTINGS)} />;
    }
  };

  return (
    <Layout activeTab={currentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
