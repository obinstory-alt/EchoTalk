
import React, { useState, useEffect } from 'react';
import { Dialogue, PracticeStep, UserSettings, EvaluationResult } from '../types';
import { ChevronLeft, Volume2, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { AudioRecorder } from '../components/AudioRecorder';
import { evaluatePronunciation } from '../services/geminiService';

interface PracticeSessionProps {
  dialogue: Dialogue;
  settings: UserSettings;
  onFinish: (id: string, count: number) => void;
  onExit: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({ dialogue, settings, onFinish, onExit }) => {
  const [currentStep, setCurrentStep] = useState<PracticeStep>(PracticeStep.SENTENCE_MASTERY);
  const [lineIndex, setLineIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showBibleVerse, setShowBibleVerse] = useState(false);
  
  // For Roleplay
  const [userRole, setUserRole] = useState<'A' | 'B'>('A');

  const currentLine = dialogue.lines[lineIndex];

  const handleSpeechInput = async (base64: string) => {
    setIsEvaluating(true);
    const result = await evaluatePronunciation(base64, currentLine.text, settings.targetAccuracy);
    setEvaluation(result);
    setIsEvaluating(false);
  };

  const handleNextLine = () => {
    setEvaluation(null);
    if (lineIndex < dialogue.lines.length - 1) {
      setLineIndex(lineIndex + 1);
    } else {
      if (currentStep === PracticeStep.SENTENCE_MASTERY) {
        setCurrentStep(PracticeStep.WORD_PRACTICE);
        setLineIndex(0);
      } else if (currentStep === PracticeStep.WORD_PRACTICE) {
        setCurrentStep(PracticeStep.ROLE_PLAY);
        setLineIndex(0);
      } else if (currentStep === PracticeStep.ROLE_PLAY) {
        if (userRole === 'A') {
          setUserRole('B');
          setLineIndex(0);
        } else {
          onFinish(dialogue.id, dialogue.lines.length);
        }
      }
    }
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  const renderMastery = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">STEP 1: SENTENCE MASTERY</span>
        <h2 className="text-xl font-bold text-slate-800">문장을 듣고 따라하세요</h2>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group">
        <button 
          onClick={() => speak(currentLine.text)}
          className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
        >
          <Volume2 className="w-5 h-5" />
        </button>
        <p className="text-2xl font-bold text-center text-slate-900 leading-tight mb-4">
          {currentLine.text}
        </p>
        <p className="text-center text-slate-500 italic">
          {currentLine.translation}
        </p>
      </div>

      <AudioRecorder onRecordingComplete={handleSpeechInput} isLoading={isEvaluating} />

      {evaluation && (
        <div className={`p-6 rounded-2xl border ${evaluation.score >= settings.targetAccuracy ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-800">정확도: {evaluation.score}%</span>
            {evaluation.score >= settings.targetAccuracy ? (
              <CheckCircle className="text-emerald-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
          </div>
          <p className="text-sm text-slate-700 mb-3">{evaluation.feedback}</p>
          
          {evaluation.mispronouncedWords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evaluation.mispronouncedWords.map(word => (
                <span key={word} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-md font-medium">
                  {word}
                </span>
              ))}
            </div>
          )}

          {evaluation.score >= settings.targetAccuracy ? (
            <button 
              onClick={handleNextLine}
              className="mt-4 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              다음 문장 <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="mt-4 text-center text-red-600 text-sm font-medium animate-bounce">
              목표 점수({settings.targetAccuracy}%) 미달입니다. 다시 시도하세요!
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderWordPractice = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">STEP 2: WORD PRACTICE</span>
        <h2 className="text-xl font-bold text-slate-800">주요 단어 집중 연습</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {currentLine.text.split(' ').map((word, idx) => (
          <button 
            key={idx}
            onClick={() => speak(word.replace(/[.,?!]/g, ''))}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="font-semibold text-slate-800">{word}</span>
            <Volume2 className="w-4 h-4 text-slate-400" />
          </button>
        ))}
      </div>

      <button 
        onClick={handleNextLine}
        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg"
      >
        {lineIndex < dialogue.lines.length - 1 ? '다음 문장 단어 보기' : '롤플레잉 시작하기'}
      </button>
    </div>
  );

  const renderRolePlay = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">STEP 3: ROLE PLAY</span>
        <h2 className="text-xl font-bold text-slate-800">당신은 <span className="text-orange-600 font-extrabold">{userRole}</span> 역할입니다</h2>
      </div>

      <div className="space-y-4">
        {dialogue.lines.map((line, idx) => (
          <div 
            key={idx} 
            className={`flex ${line.speaker === userRole ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              line.speaker === userRole 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              <div className="text-[10px] uppercase font-bold mb-1 opacity-70">Speaker {line.speaker}</div>
              <p className="font-medium">{line.text}</p>
              {line.speaker !== userRole && (
                <button onClick={() => speak(line.text)} className="mt-2 text-xs flex items-center gap-1 opacity-80 underline underline-offset-2">
                  <Volume2 className="w-3 h-3" /> 듣기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-center text-sm text-slate-500 mb-4">전체 대화를 한 번 더 연습하며 마무리하세요.</p>
        <button 
          onClick={handleNextLine}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
        >
          {userRole === 'A' ? '역할 바꿔서 진행하기' : '학습 완료'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full flex flex-col">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
        <button onClick={onExit} className="p-1 hover:bg-slate-100 rounded-lg">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800 truncate">{dialogue.context}</h1>
          <div className="h-1 bg-slate-100 rounded-full mt-1">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((lineIndex + 1) / dialogue.lines.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="p-6 flex-grow">
        {currentStep === PracticeStep.SENTENCE_MASTERY && renderMastery()}
        {currentStep === PracticeStep.WORD_PRACTICE && renderWordPractice()}
        {currentStep === PracticeStep.ROLE_PLAY && renderRolePlay()}
      </div>
    </div>
  );
};
