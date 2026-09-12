export interface ScoredRecord<T> {
  item: T;
  score: number;
  denseScore: number;
  sparseScore: number;
  provenance: string;
}

/**
 * Hybrid Retriever combining Dense Vector Cosine Similarity and
 * Sparse BM25 / Keyword Frequency matching via Reciprocal Rank Fusion (RRF).
 */
export class HybridRetriever {
  /**
   * Generates a deterministic pseudo-embedding vector for text when offline/local,
   * or accepts true embeddings from Gemini embedding model.
   */
  public static computeVector(text: string, dimensions = 64): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    if (words.length === 0) return vector;

    words.forEach((word) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1;
    });

    // Normalize Euclidean norm
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < dimensions; i++) {
        vector[i] = vector[i] / magnitude;
      }
    }
    return vector;
  }

  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public static bm25Score(queryWords: string[], documentText: string): number {
    const docTokens = documentText.toLowerCase().split(/\s+/);
    if (docTokens.length === 0) return 0;

    let matchCount = 0;
    for (const q of queryWords) {
      if (docTokens.includes(q)) {
        matchCount++;
      }
    }
    return matchCount / Math.max(queryWords.length, 1);
  }

  /**
   * Reciprocal Rank Fusion (RRF)
   * Formula: RRF(d) = sum(1 / (k + rank_m(d))) * time_decay
   */
  public static fuseRRF<T extends { id: string; timestamp?: string }>(
    items: T[],
    getText: (item: T) => string,
    query: string,
    topK = 5,
    kRRF = 60
  ): ScoredRecord<T>[] {
    if (items.length === 0) return [];
    const queryVector = this.computeVector(query);
    const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    // 1. Dense scoring
    const denseRanked = items.map((item) => {
      const text = getText(item);
      const vec = this.computeVector(text);
      const sim = this.cosineSimilarity(queryVector, vec);
      return { item, sim };
    }).sort((a, b) => b.sim - a.sim);

    // 2. Sparse scoring
    const sparseRanked = items.map((item) => {
      const text = getText(item);
      const score = this.bm25Score(queryWords, text);
      return { item, score };
    }).sort((a, b) => b.score - a.score);

    // Build ranks map
    const denseRankMap = new Map<string, number>();
    denseRanked.forEach((entry, idx) => denseRankMap.set(entry.item.id, idx + 1));

    const sparseRankMap = new Map<string, number>();
    sparseRanked.forEach((entry, idx) => sparseRankMap.set(entry.item.id, idx + 1));

    // Combine via RRF with recency decay
    const now = Date.now();
    const scored: ScoredRecord<T>[] = items.map((item) => {
      const dRank = denseRankMap.get(item.id) || items.length;
      const sRank = sparseRankMap.get(item.id) || items.length;

      const denseRRF = 1 / (kRRF + dRank);
      const sparseRRF = 1 / (kRRF + sRank);

      // Recency multiplier (decay factor)
      let recencyMultiplier = 1.0;
      if (item.timestamp) {
        const ageHours = Math.max(0, (now - new Date(item.timestamp).getTime()) / (1000 * 60 * 60));
        recencyMultiplier = Math.exp(-0.001 * ageHours); // Gentle decay
      }

      const totalScore = (denseRRF + sparseRRF) * recencyMultiplier;
      return {
        item,
        score: totalScore,
        denseScore: denseRRF,
        sparseScore: sparseRRF,
        provenance: `RRF(dense_rank=${dRank}, sparse_rank=${sRank}, decay=${recencyMultiplier.toFixed(3)})`,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
