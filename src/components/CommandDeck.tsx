import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { ReactorCore } from './ReactorCore.tsx';
import { CognitiveCycleResponse } from '../types.ts';

interface CommandDeckProps {
  isProcessing: boolean;
  activeStage?: string;
  onExecuteGoal: (goal: string, source?: 'USER_INPUT' | 'VOICE') => Promise<void>;
  latestResponse: CognitiveCycleResponse | null;
}

export const CommandDeck: React.FC<CommandDeckProps> = ({
  isProcessing,
  activeStage,
  onExecuteGoal,
  latestResponse,
}) => {
  const [inputGoal, setInputGoal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as unknown as { webkitSpeechRecognition?: any; SpeechRecognition?: any }).webkitSpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition;

    if (!SpeechRec) {
      alert('Reconhecimento de voz não suportado neste navegador. Utilize a entrada de texto.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputGoal(transcript);
        setIsListening(false);
        onExecuteGoal(transcript, 'VOICE');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!speechSynthesisEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio speech synthesis not supported or blocked
    }
  };

  useEffect(() => {
    if (latestResponse?.finalAnswer && speechSynthesisEnabled) {
      speakResponse(latestResponse.finalAnswer);
    }
  }, [latestResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoal.trim() || isProcessing) return;
    onExecuteGoal(inputGoal.trim(), 'USER_INPUT');
  };

  const sampleDirectives = [
    'Organizar minha semana: cruzar calendário, tarefas e priorizar blocos de estudo',
    'Consultar datas e prazos das provas de Sistemas Distribuídos',
    'Verificar telemetria do sistema e integridade do registro de auditoria',
    'Calcular janelas de tempo livre e alocar bloco de foco profundo',
  ];

  return (
    <div className="space-y-6">
      {/* Reactor Core + Autonomous Command Center */}
      <div className="relative rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 md:p-8 overflow-hidden shadow-2xl">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Central Pulsating Reactor Core */}
          <div className="flex-shrink-0">
            <ReactorCore isProcessing={isProcessing} activeStage={activeStage} />
          </div>

          {/* Interactive Input HUD */}
          <div className="flex-grow w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Terminal de Diretivas Autônomas
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono animate-pulse">
                    EXECUTANDO: {activeStage}
                  </span>
                )}
              </div>

              {/* Voice output toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-toggle-tts"
                  onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                    speechSynthesisEnabled
                      ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                  title="Feedback sonoro por voz"
                >
                  {speechSynthesisEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Voz: {speechSynthesisEnabled ? 'Ligada' : 'Muda'}</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                id="input-jarvis-directive"
                type="text"
                value={inputGoal}
                onChange={(e) => setInputGoal(e.target.value)}
                placeholder={isListening ? 'Ouvindo... Fale sua diretiva agora' : 'Digite uma ordem para JARVIS (ex: Organizar minha semana)'}
                disabled={isProcessing}
                className="w-full pl-4 pr-24 py-3.5 rounded-xl bg-slate-900/90 border border-cyan-800/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-500 font-sans text-sm outline-none transition-all"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {/* Microphone / STT button */}
                <button
                  type="button"
                  id="btn-voice-input"
                  onClick={handleVoiceToggle}
                  disabled={isProcessing}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                      : 'bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700'
                  }`}
                  title={isListening ? 'Parar gravação' : 'Falar comando de voz'}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  id="btn-submit-directive"
                  disabled={isProcessing || !inputGoal.trim()}
                  className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:hover:bg-cyan-600 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  title="Executar diretiva"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-500">Exemplos:</span>
              {sampleDirectives.map((cmd, i) => (
                <button
                  key={i}
                  id={`btn-chip-${i}`}
                  type="button"
                  onClick={() => {
                    setInputGoal(cmd);
                    onExecuteGoal(cmd, 'USER_INPUT');
                  }}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-700/60 text-[11px] text-slate-300 hover:text-cyan-200 font-sans transition-all text-left"
                >
                  {cmd.length > 40 ? `${cmd.substring(0, 38)}...` : cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Execution Output Card */}
      {latestResponse && (
        <div className="rounded-xl border border-cyan-900/50 bg-slate-900/70 p-5 space-y-4 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {latestResponse.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              <span className="font-mono text-xs font-bold text-slate-200">
                Resultado do Ciclo Cognitivo
              </span>
              <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {latestResponse.traceId}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                9 Estágios Executados
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Verificação: {latestResponse.verifications[0]?.status || 'SUCCESS'}
              </span>
            </div>
          </div>

          {/* Goal & Executive Synthesis */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400">
              Diretiva: <span className="text-slate-200 font-sans">"{latestResponse.inputGoal}"</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800 font-sans">
              {latestResponse.finalAnswer}
            </p>
          </div>

          {/* Diff Summary if plan produced modifications */}
          {latestResponse.plan?.diffSummary && (
            <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 space-y-2 text-xs">
              <div className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Diff das Mutações no Calendário / Estado Digital
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-emerald-400 font-semibold">+ Adicionados:</span>
                  <ul className="list-disc list-inside text-slate-300 pl-1">
                    {latestResponse.plan.diffSummary.added.map((add, idx) => (
                      <li key={idx}>{add}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-amber-400 font-semibold">~ Modificados:</span>
                  <ul className="list-disc list-inside text-slate-300 pl-1">
                    {latestResponse.plan.diffSummary.modified.map((mod, idx) => (
                      <li key={idx}>{mod}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
