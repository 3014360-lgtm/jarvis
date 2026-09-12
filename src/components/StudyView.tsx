import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CourseEntity, StudyExercise, StudyTopic } from '../types.ts';

export const StudyView: React.FC = () => {
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [gaps, setGaps] = useState<StudyTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingPortal, setIsSyncingPortal] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Exercise testing state
  const [selectedTopicId, setSelectedTopicId] = useState<string>('top-raft');
  const [activeExercises, setActiveExercises] = useState<StudyExercise[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const fetchStudyData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/study/overview');
      const data = await res.json();
      setCourses(data.courses || []);
      setTopics(data.topics || []);
      setGaps(data.knowledgeGaps || []);
      if (data.topics && data.topics.length > 0 && !selectedTopicId) {
        setSelectedTopicId(data.topics[0].id);
      }
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  const handleSyncPortal = async () => {
    setIsSyncingPortal(true);
    setSyncNotice(null);
    try {
      const res = await fetch('/api/portal/sync', { method: 'POST' });
      const data = await res.json();
      setSyncNotice(
        `Portal SIGA sincronizado! ${data.changesDetected?.deadlinesUpdatedCount || 0} prazo(s) atualizado(s), ${data.changesDetected?.newAnnouncementsCount || 0} aviso(s) novo(s).`
      );
      fetchStudyData();
    } catch {
      setSyncNotice('Falha na comunicação com o portal.');
    } finally {
      setIsSyncingPortal(false);
    }
  };

  const handleReviewRating = async (topicId: string, rating: number) => {
    try {
      const res = await fetch('/api/study/spaced-repetition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, rating }),
      });
      if (res.ok) {
        fetchStudyData();
      }
    } catch {
      // error handled
    }
  };

  const handleGenerateExercises = async (topicId: string) => {
    setIsEvaluating(false);
    setEvalResult(null);
    setUserAnswer('');
    try {
      const res = await fetch('/api/study/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, count: 2 }),
      });
      const data = await res.json();
      setActiveExercises(data || []);
    } catch {
      // handled
    }
  };

  const handleEvaluateAnswer = async (exerciseId: string) => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/study/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, answer: userAnswer }),
      });
      const data = await res.json();
      setEvalResult(data);
    } catch {
      // handled
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Motor de Estudos & Domínio Acadêmico (SM-2 / FSRS)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Repetição Espaçada, Lacunas e Sincronização Escolar
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            O JARVIS monitora disciplinas, avaliações oficiais e intervalos de retenção da memória
            (SM-2), oferecendo exercícios adaptativos sob rigorosa política de integridade acadêmica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-sync-school-portal"
            onClick={handleSyncPortal}
            disabled={isSyncingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPortal ? 'animate-spin' : ''}`} />
            <span>{isSyncingPortal ? 'Sincronizando...' : 'Sincronizar Portal SIGA'}</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Grid: Courses & Spaced Repetition Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Courses */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Disciplinas Ativas (2026/2)</span>
          </h3>

          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{c.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {c.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{c.schedule.join(' • ')}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Sala: {c.classroom}</div>
              </div>
            ))}
          </div>

          {/* Knowledge Gaps Warning */}
          {gaps.length > 0 && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Lacunas de Conhecimento Detectadas</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {gaps.length} tópico(s) estão com domínio abaixo de 70% ou revisão pendente. Priorize
                nas próximas sessões de Deep Work.
              </p>
            </div>
          )}
        </div>

        {/* Topics & Spaced Repetition (SM-2) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Curvas de Retenção & Repetição Espaçada (SM-2)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Próximas revisões programadas
            </span>
          </div>

          <div className="space-y-3">
            {topics.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all ${
                  selectedTopicId === t.id
                    ? 'bg-slate-950 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-100">{t.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                      <span>Intervalo: <b className="text-cyan-300">{t.intervalDays} dias</b></span>
                      <span>Repetições: <b className="text-cyan-300">{t.repetitionNumber}</b></span>
                      <span>Fator EF: <b className="text-sky-300">{t.easeFactor.toFixed(2)}</b></span>
                      <span>Domínio: <b className="text-emerald-400">{t.masteryScore}%</b></span>
                    </div>
                  </div>

                  <button
                    id={`btn-train-${t.id}`}
                    onClick={() => {
                      setSelectedTopicId(t.id);
                      handleGenerateExercises(t.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-slate-200 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Treinar Questões</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SM-2 Feedback Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Autoavaliação de Retenção:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => handleReviewRating(t.id, grade)}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-cyan-300 border border-slate-800 cursor-pointer"
                        title={`Avaliar retenção grau ${grade}/5`}
                      >
                        {grade}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adaptive Exercises & Academic Integrity Sandbox */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-0.5">
              <Award className="w-4 h-4" />
              <span>Simulado Adaptativo & Avaliação Diagnóstica com Rubrica</span>
            </div>
            <p className="text-xs text-slate-400">
              Responda a perguntas técnicas para receber avaliação automatizada com rubricas detalhadas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Fraude Ativo</span>
          </div>
        </div>

        {activeExercises.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            Clique em "Treinar Questões" em qualquer tópico acima para carregar exercícios diagnósticos.
          </div>
        ) : (
          <div className="space-y-4">
            {activeExercises.map((ex) => (
              <div key={ex.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-sm font-semibold text-slate-100">
                  {ex.question}
                </div>

                {ex.options && (
                  <div className="space-y-1.5">
                    {ex.options.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => setUserAnswer(opt)}
                        className={`p-2.5 rounded-lg text-xs font-sans cursor-pointer transition-all border ${
                          userAnswer === opt
                            ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                            : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="input-exercise-answer"
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Digite ou selecione a sua resposta..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <button
                    id="btn-evaluate-answer"
                    onClick={() => handleEvaluateAnswer(ex.id)}
                    disabled={isEvaluating || !userAnswer.trim()}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isEvaluating ? 'Avaliando...' : 'Avaliar Resposta'}
                  </button>
                </div>

                {/* Evaluation Result */}
                {evalResult && (
                  <div
                    className={`mt-4 p-4 rounded-xl border text-xs font-sans space-y-2 ${
                      evalResult.academicIntegrityCheck?.passed === false
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                        : 'bg-slate-900/90 border-cyan-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span>Feedback Diagnóstico JARVIS</span>
                      <span>Nota: {evalResult.scorePercentage}%</span>
                    </div>
                    <p>{evalResult.feedback}</p>
                    <p className="text-[11px] text-slate-400">{evalResult.diagnostic}</p>
                    {evalResult.rubricPointsAwarded && evalResult.rubricPointsAwarded.length > 0 && (
                      <div className="text-[10px] font-mono text-cyan-300">
                        Critérios atendidos: {evalResult.rubricPointsAwarded.join(' • ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
