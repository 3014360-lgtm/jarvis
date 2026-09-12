import { EpisodicEvent, HierarchicalSummary } from '../../shared/types.ts';

/**
 * Hierarchical Summarizer
 * Consolidates raw episodic events into structured hierarchical tiers:
 * Hourly -> Daily -> Weekly -> Monthly.
 */
export class HierarchicalSummarizer {
  public static rollupEvents(
    period: 'hourly' | 'daily' | 'weekly',
    events: EpisodicEvent[]
  ): HierarchicalSummary {
    if (events.length === 0) {
      return {
        period,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        headline: `No recorded activity for this ${period} interval.`,
        keyEvents: [],
        extractedFacts: [],
        sourceEventIds: [],
      };
    }

    const sorted = [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const startDate = sorted[0].timestamp;
    const endDate = sorted[sorted.length - 1].timestamp;

    // Extract key events by importance score
    const keyEvents = sorted
      .filter((e) => e.importance >= 0.5)
      .map((e) => `[${e.timestamp.substring(11, 16)}] ${e.title}: ${e.outcome}`);

    // Extract facts
    const facts: string[] = [];
    sorted.forEach((e) => {
      if (e.tags.includes('calendar')) {
        facts.push(`Calendar modified: ${e.title}`);
      }
      if (e.tags.includes('academic') || e.tags.includes('study')) {
        facts.push(`Academic milestone: ${e.title}`);
      }
      if (e.tags.includes('preference')) {
        facts.push(`User preference recorded: ${e.description}`);
      }
    });

    return {
      period,
      startDate,
      endDate,
      headline: `${events.length} system actions executed. Primary focus: ${sorted[0]?.tags.join(', ') || 'general'}.`,
      keyEvents: keyEvents.length > 0 ? keyEvents : sorted.map((e) => e.title),
      extractedFacts: Array.from(new Set(facts)),
      sourceEventIds: sorted.map((e) => e.id),
    };
  }
}
