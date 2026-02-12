
import React, { useState, useRef } from 'react';
import { Dialogue, PracticeStep, UserSettings, EvaluationResult } from '../types.ts';
import { ChevronLeft, Volume2, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { AudioRecorder } from '../components/AudioRecorder.tsx';
import { evaluatePronunciation, getGeminiSpeech, decodeAudioData } from '../services/geminiService.ts';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userRole, setUserRole] = useState<'A' | 'B'>('A');

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentLine = dialogue.lines[lineIndex];

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    // Important: Resume context on user gesture for mobile browsers
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const speak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    // Resume AudioContext as part of user interaction
    const ctx = getAudioContext();

    try {
      const base64Audio = await getGeminiSpeech(text);
      if (base64Audio) {
        const buffer = await decodeAudioData(base64Audio, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        // Fallback to browser TTS if Gemini fails
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.onend = () => setIsSpeaking(false);
        synth.speak(utterance);
      }
    } catch (e) {
      console.error("Playback error", e);
      setIsSpeaking(false);
    }
  };

  const handleSpeechInput = async (base64: string, mimeType: string) => {
    setIsEvaluating(true);
    setEvaluation(null);
    const result = await evaluatePronunciation(base64, currentLine.text, settings.targetAccuracy, mimeType);
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

  const renderMastery = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">STEP 1: SENTENCE MASTERY</span>
        <h2 className="text-xl font-bold text-slate-800">문장을 듣고 따라하세요</h2>
      </div>
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group min-h-[160px] flex flex-col justify-center">
        <button 
          onClick={() => speak(currentLine.text)}
          disabled={isSpeaking}
          className={`absolute top-4 right-4 p-3 rounded-full transition-all ${
            isSpeaking ? 'bg-blue-100 text-blue-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-90 shadow-sm'
          }`}
        >
          {isSpeaking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
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
        <div className={`p-6 rounded-2xl border animate-in slide-in-from-top-4 duration-300 ${evaluation.score >= settings.targetAccuracy ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-red-50 border-red-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold text-lg ${evaluation.score >= settings.targetAccuracy ? 'text-emerald-700' : 'text-red-700'}`}>
              정확도: {evaluation.score}%
            </span>
            {evaluation.score >= settings.targetAccuracy ? (
              <CheckCircle className="text-emerald-500 w-6 h-6" />
            ) : (
              <XCircle className="text-red-500 w-6 h-6" />
            )}
          </div>
          <p className="text-slate-700 mb-3 leading-relaxed">{evaluation.feedback}</p>
          {evaluation.mispronouncedWords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs text-slate-400 w-full mb-1">다시 연습해 보세요:</span>
              {evaluation.mispronouncedWords.map(word => (
                <span key={word} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-md font-bold">
                  {word}
                </span>
              ))}
            </div>
          )}
          {evaluation.score >= settings.targetAccuracy ? (
            <button 
              onClick={handleNextLine}
              className="mt-4 w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
            >
              다음 문장 <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="mt-4 text-center text-red-600 text-sm font-bold animate-pulse">
              목표 점수({settings.targetAccuracy}%) 도달을 위해 한 번 더!
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
            disabled={isSpeaking}
            onClick={() => speak(word.replace(/[.,?!]/g, ''))}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <span className="font-semibold text-slate-800 truncate mr-2">{word}</span>
            {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin text-purple-300" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
          </button>
        ))}
      </div>
      <button 
        onClick={handleNextLine}
        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 active:scale-95 transition-transform"
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
          <div key={idx} className={`flex ${line.speaker === userRole ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              line.speaker === userRole 
                ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-slate-100'
            }`}>
              <div className="text-[10px] uppercase font-bold mb-1 opacity-70">Speaker {line.speaker}</div>
              <p className="font-medium">{line.text}</p>
              {line.speaker !== userRole && (
                <button 
                  onClick={() => speak(line.text)} 
                  disabled={isSpeaking}
                  className="mt-2 text-xs flex items-center gap-1 opacity-80 underline underline-offset-2 hover:opacity-100"
                >
                  {isSpeaking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />} 듣기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-slate-100">
        <button 
          onClick={handleNextLine}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
