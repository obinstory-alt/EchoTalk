
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (base64: string) => void;
  isLoading: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          onRecordingComplete(base64String);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {isLoading ? (
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      )}
      <p className="text-sm font-medium text-slate-500">
        {isRecording ? '듣고 있습니다... 멈추려면 버튼을 누르세요' : '마이크 버튼을 눌러 발음을 연습하세요'}
      </p>
    </div>
  );
};
