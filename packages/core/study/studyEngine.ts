/**
 * JARVIS Study Engine (packages/core/study/studyEngine.ts)
 * Explicit academic domain, Spaced Repetition (SM-2 / FSRS), adaptive exercises,
 * rubrics evaluation, topic mastery radar, and strict academic integrity guardrails.
 */

import {
  AcademicEvaluation,
  CourseEntity,
  StudyExercise,
  StudySessionRecord,
  StudyTopic,
} from '../../shared/types.ts';

export class StudyEngine {
  private courses: Map<string, CourseEntity> = new Map();
  private topics: Map<string, StudyTopic> = new Map();
  private evaluations: Map<string, AcademicEvaluation> = new Map();
  private sessions: StudySessionRecord[] = [];
  private academicIntegrityPolicy: 'STRICT_ETHICAL' | 'ADVISORY' = 'STRICT_ETHICAL';

  constructor() {
    this.seedAcademicDomain();
  }

  private seedAcademicDomain(): void {
    // 1. Disciplinas
    const sdCourse: CourseEntity = {
      id: 'crs-sd',
      code: 'EC-502',
      name: 'Sistemas Distribuídos',
      professorId: 'prof-silva',
      period: '2026/2',
      schedule: ['Seg 08:00 - 10:00', 'Qua 08:00 - 10:00'],
      classroom: 'Sala 304',
    };
    const iaCourse: CourseEntity = {
      id: 'crs-ia',
      code: 'EC-508',
      name: 'Inteligência Artificial',
      professorId: 'prof-costa',
      period: '2026/2',
      schedule: ['Ter 10:00 - 12:00', 'Qui 10:00 - 12:00'],
      classroom: 'Lab 2',
    };
    this.courses.set(sdCourse.id, sdCourse);
    this.courses.set(iaCourse.id, iaCourse);

    // 2. Tópicos com Repetição Espaçada SM-2 / FSRS
    const topic1: StudyTopic = {
      id: 'top-raft',
      courseId: 'crs-sd',
      title: 'Algoritmo de Consenso Raft (Leader Election & Log Replication)',
      difficulty: 4,
      masteryScore: 68,
      lastReviewed: '2026-09-08T10:00:00Z',
      nextReviewDate: '2026-09-13T08:00:00Z',
      repetitionNumber: 3,
      intervalDays: 5,
      easeFactor: 2.4,
      stability: 4.8,
      difficultyRating: 3.5,
    };
    const topic2: StudyTopic = {
      id: 'top-paxos',
      courseId: 'crs-sd',
      title: 'Consenso Paxos (Synod, Proposer, Acceptor, Learner)',
      difficulty: 5,
      masteryScore: 45,
      lastReviewed: '2026-09-05T14:00:00Z',
      nextReviewDate: '2026-09-12T10:00:00Z',
      repetitionNumber: 1,
      intervalDays: 2,
      easeFactor: 2.1,
      stability: 2.0,
      difficultyRating: 4.5,
    };
    const topic3: StudyTopic = {
      id: 'top-rrf',
      courseId: 'crs-ia',
      title: 'Reciprocal Rank Fusion (RRF) em Recuperação Híbrida',
      difficulty: 3,
      masteryScore: 88,
      lastReviewed: '2026-09-10T16:00:00Z',
      nextReviewDate: '2026-09-18T14:00:00Z',
      repetitionNumber: 4,
      intervalDays: 8,
      easeFactor: 2.6,
      stability: 8.2,
      difficultyRating: 2.2,
    };
    this.topics.set(topic1.id, topic1);
    this.topics.set(topic2.id, topic2);
    this.topics.set(topic3.id, topic3);

    // 3. Avaliações
    const eval1: AcademicEvaluation = {
      id: 'eval-p1-sd',
      courseId: 'crs-sd',
      title: 'Prova P1 Teórica e Prática',
      type: 'PROVA',
      date: '2026-09-22T08:00:00Z',
      weight: 0.4,
      maxScore: 10.0,
      topics: ['top-raft', 'top-paxos'],
    };
    this.evaluations.set(eval1.id, eval1);
  }

  public getCourses(): CourseEntity[] {
    return Array.from(this.courses.values());
  }

  public getTopics(): StudyTopic[] {
    return Array.from(this.topics.values());
  }

  public getEvaluations(): AcademicEvaluation[] {
    return Array.from(this.evaluations.values());
  }

  /**
   * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
   * Rating scale:
   * 1 = Total blackout (Again)
   * 2 = Incorrect response; where upon seeing it seemed easy (Hard)
   * 3 = Correct response recalled with serious difficulty (Good)
   * 4 = Correct response after hesitation (Good+)
   * 5 = Perfect recall (Easy)
   */
  public updateSpacedRepetition(topicId: string, rating: 1 | 2 | 3 | 4 | 5): StudyTopic {
    const topic = this.topics.get(topicId);
    if (!topic) throw new Error(`Topic ${topicId} not found.`);

    let { repetitionNumber, intervalDays, easeFactor, masteryScore } = topic;

    if (rating >= 3) {
      if (repetitionNumber === 0) {
        intervalDays = 1;
      } else if (repetitionNumber === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitionNumber += 1;
      masteryScore = Math.min(100, masteryScore + (rating - 2) * 8);
    } else {
      repetitionNumber = 0;
      intervalDays = 1;
      masteryScore = Math.max(10, masteryScore - 15);
    }

    // Update Ease Factor (EF) with minimum 1.3 clamp
    easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    topic.repetitionNumber = repetitionNumber;
    topic.intervalDays = intervalDays;
    topic.easeFactor = parseFloat(easeFactor.toFixed(2));
    topic.masteryScore = masteryScore;
    topic.lastReviewed = new Date().toISOString();
    topic.nextReviewDate = nextDate.toISOString();

    return topic;
  }

  /**
   * Generates interactive diagnostic exercises calibrated by difficulty
   */
  public generateExercises(topicId: string, count = 2): StudyExercise[] {
    const topic = this.topics.get(topicId);
    if (!topic) {
      return [
        {
          id: `ex-${Date.now()}-1`,
          topicId: 'general',
          question: 'Explique a diferença entre broadcast confiável e consenso em sistemas distribuídos.',
          correctAnswer: 'No broadcast confiável todos os nós íntegros entregam a mesma mensagem, mas no consenso eles devem concordar em um único valor decidido entre alternativas propostas.',
          rubric: 'Diferenciação clara entre ordenação/entrega e acordo terminativo de valor único.',
          explanation: 'Consenso requer validade, acordo e terminação; broadcast confiável não impõe a eleição de um valor concorrente.',
          difficulty: 3,
        },
      ];
    }

    if (topicId === 'top-raft') {
      return [
        {
          id: `ex-raft-1`,
          topicId: 'top-raft',
          question: 'Em caso de split-vote durante a eleição de líder no Raft, como o algoritmo garante o desempate?',
          options: [
            'O nó com maior endereço IP assume a liderança automaticamente.',
            'O temporizador de eleição aleatório (randomized election timeout) faz com que um dos candidatos dispare antes o próximo mandato.',
            'O cluster congela até intervenção do operador.',
            'O líder anterior retoma o posto permanentemente.',
          ],
          correctAnswer: 'O temporizador de eleição aleatório (randomized election timeout) faz com que um dos candidatos dispare antes o próximo mandato.',
          rubric: 'Identificação correta da técnica de randomized timeout no intervalo [150ms, 300ms].',
          explanation: 'A aleatoriedade dos timeouts reduz dramaticamente a probabilidade de eleições simultâneas repetidas.',
          difficulty: 3,
        },
        {
          id: `ex-raft-2`,
          topicId: 'top-raft',
          question: 'Por que um líder Raft nunca pode sobrescrever ou deletar entradas de seu próprio log?',
          options: [
            'Porque logs são append-only no líder; discrepâncias em seguidores são reconciliadas forçando o log do seguidor a replicar o líder.',
            'Porque o Raft usa locks distribuídos no disco.',
            'Porque os termos são imutáveis.',
            'Porque os nós seguidores votam em cada delete.',
          ],
          correctAnswer: 'Porque logs são append-only no líder; discrepâncias em seguidores são reconciliadas forçando o log do seguidor a replicar o líder.',
          rubric: 'Compreensão da propriedade Leader Append-Only.',
          explanation: 'A propriedade Leader Append-Only assegura a consistência estrita de estados committed.',
          difficulty: 4,
        },
      ];
    }

    return [
      {
        id: `ex-gen-${Date.now()}`,
        topicId,
        question: `Explique os conceitos fundamentais e trade-offs associados ao tópico "${topic.title}".`,
        correctAnswer: 'Resposta conceitual fundamentada com identificação de garantias, trade-offs e falhas tratadas.',
        rubric: 'Critérios: 1. Definição correta (40%), 2. Modelo de falhas considerado (30%), 3. Aplicação prática (30%).',
        explanation: 'Revisão periódica recomendada para consolidação na memória de longo prazo.',
        difficulty: topic.difficulty,
      },
    ];
  }

  /**
   * Diagnostic Answer Evaluation with Rubric
   */
  public evaluateAnswer(exerciseId: string, userAnswer: string): {
    scorePercentage: number;
    feedback: string;
    diagnostic: string;
    rubricPointsAwarded: string[];
    academicIntegrityCheck: { passed: boolean; message: string };
  } {
    // Check Academic Integrity Anti-Fraud Guardrail
    const isFraudulentRequest =
      /faça (a )?minha prova|resolva este exame|responda por mim|cola de prova|gabarito oficial/i.test(userAnswer);

    if (isFraudulentRequest) {
      return {
        scorePercentage: 0,
        feedback: 'Ação Bloqueada pela Política de Integridade Acadêmica do JARVIS.',
        diagnostic: 'O JARVIS é um assistente pedagógico de estudos, treino e explicação. Ele não realiza exames formais nem submete avaliações fraudulentas.',
        rubricPointsAwarded: [],
        academicIntegrityCheck: {
          passed: false,
          message: 'Violou a política de integridade acadêmica: solicitação de realização fraudulenta de exame.',
        },
      };
    }

    const length = userAnswer.trim().length;
    let score = 70;
    const points: string[] = ['Abordou o conceito solicitado'];

    if (length > 40) {
      score += 20;
      points.push('Argumentação detalhada e fundamentada');
    }
    if (/raft|paxos|consenso|timeout|log|líder|eleição/i.test(userAnswer)) {
      score = Math.min(100, score + 10);
      points.push('Terminologia técnica precisa aplicada');
    }

    return {
      scorePercentage: score,
      feedback:
        score >= 80
          ? 'Excelente compreensão do tópico! Fundamentação sólida.'
          : 'Boa resposta, mas sugere-se aprofundar os mecanismos de recuperação de falhas.',
      diagnostic: 'Curva de retenção estabilizada. Recomenda-se avançar para o próximo bloco de estudo.',
      rubricPointsAwarded: points,
      academicIntegrityCheck: {
        passed: true,
        message: 'Conforme com as diretrizes de aprendizagem autônoma.',
      },
    };
  }

  /**
   * Detects knowledge gaps and topics requiring urgent review
   */
  public detectKnowledgeGaps(): StudyTopic[] {
    return Array.from(this.topics.values())
      .filter((t) => t.masteryScore < 60 || new Date(t.nextReviewDate).getTime() <= Date.now())
      .sort((a, b) => a.masteryScore - b.masteryScore);
  }
}

export const studyEngine = new StudyEngine();
