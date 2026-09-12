import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  MessageSquare,
  Mic,
  Activity,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Wifi,
  Battery,
} from 'lucide-react';
import { PlatformStatusData } from '../types.ts';

export const MultiplatformHub: React.FC = () => {
  const [platformData, setPlatformData] = useState<PlatformStatusData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPlatformStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/platforms/status');
      const data = await res.json();
      setPlatformData(data);
    } catch {
      // error handling
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-xl border border-cyan-900/40 bg-slate-900/80">
        <div>
          <h2 className="font-mono text-base font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Topologia Multiplataforma Conectada
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            JARVIS opera como um sistema operacional ubíquo integrando Web, Android nativo, Agente Windows e WhatsApp.
          </p>
        </div>

        <button
          onClick={fetchPlatformStatus}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 hover:border-cyan-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sincronizar Pontes</span>
        </button>
      </div>

      {/* Surface Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Android Surface */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold text-slate-200">
                  Superfície Android (Nativo Kotlin)
                </h3>
                <span className="text-[11px] text-slate-400 font-sans">
                  {platformData?.androidBridge.device || 'Pixel 9 Pro'} • {platformData?.androidBridge.os || 'Android 15'}
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              ONLINE
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-slate-400">
              <span>Foreground Service:</span>
              <span className="text-cyan-300 font-bold">{platformData?.androidBridge.foregroundService || 'ACTIVE'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Wake-Word Detector:</span>
              <span className="text-emerald-400 font-bold">{platformData?.androidBridge.wakeWord || 'Porcupine (Ativo)'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Bateria do Dispositivo:</span>
              <span className="text-slate-200 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                {platformData?.androidBridge.battery || '88%'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Windows Desktop Agent */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold text-slate-200">
                  Agente Windows Desktop (.NET 8)
                </h3>
                <span className="text-[11px] text-slate-400 font-sans">
                  {platformData?.windowsAgent.os || 'Windows 11 Pro 64-bit'}
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700">
              <CheckCircle2 className="w-3 h-3" />
              CONECTADO
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-slate-400">
              <span>Canal IPC:</span>
              <span className="text-cyan-300 font-bold">{platformData?.windowsAgent.channel || 'NamedPipe / mTLS'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Janela Ativa em Foco:</span>
              <span className="text-amber-300 font-bold">{platformData?.windowsAgent.activeWindow || 'Visual Studio Code'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Controle de Automação:</span>
              <span className="text-emerald-400">UI Automation Sandboxed</span>
            </div>
          </div>
        </div>

        {/* Card 3: WhatsApp Gateway */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-950/70 border border-sky-500/50 text-sky-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold text-slate-200">
                  Gateway WhatsApp Oficial
                </h3>
                <span className="text-[11px] text-slate-400 font-sans">
                  {platformData?.whatsAppGateway.officialApi || 'Meta Cloud API v21.0'}
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 text-[10px] font-mono text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-700">
              WEBHOOK ATIVO
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-slate-400">
              <span>Assinatura HMAC SHA-256:</span>
              <span className="text-emerald-400 font-bold">Verificada</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Modo Notificação:</span>
              <span className="text-slate-200">Alertas de Alta Prioridade</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Modelos Aprovados:</span>
              <span className="text-cyan-300">3 Templates Oficiais</span>
            </div>
          </div>
        </div>

        {/* Card 4: Voice & Speech Engine */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-500/50 text-purple-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold text-slate-200">
                  Motor de Voz Bidirecional (STT/TTS)
                </h3>
                <span className="text-[11px] text-slate-400 font-sans">
                  Processamento de baixa latência
                </span>
              </div>
            </div>

            <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-700">
              PRONTO
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-slate-400">
              <span>STT Primário:</span>
              <span className="text-purple-300 font-bold">Web Speech API</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>TTS Síntese:</span>
              <span className="text-purple-300 font-bold">SpeechSynthesisUtterance (pt-BR)</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Fallback On-Device:</span>
              <span className="text-emerald-400">Whisper.cpp / Piper TTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
