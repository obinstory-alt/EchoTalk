
export enum AppState {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  SETTINGS = 'SETTINGS',
  COMPLETED = 'COMPLETED'
}

export enum PracticeStep {
  SENTENCE_MASTERY = 'SENTENCE_MASTERY',
  WORD_PRACTICE = 'WORD_PRACTICE',
  ROLE_PLAY = 'ROLE_PLAY'
}

export interface Dialogue {
  id: string;
  context: string;
  lines: DialogueLine[];
  bibleVerse: {
    kr: string;
    en: string;
    ref: string;
  };
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  text: string;
  translation: string;
}

export interface UserSettings {
  dailyGoal: number; // sets per day
  targetAccuracy: number; // percentage
}

export interface UserProgress {
  completedSentences: number;
  dailySetsDone: number;
  lastActiveDate: string;
  currentDialogueId: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  mispronouncedWords: string[];
}
