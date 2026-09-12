# JARVIS Memory Subsystem & Hybrid Retrieval

## 1. Memory Store Architecture
JARVIS avoids the naive "infinite prompt window" fallacy by implementing a 7-tier bounded memory system:

```
┌────────────────────────────────────────────────────────┐
│                   WORKING MEMORY                       │
│    Active session turns (sliding window, N <= 10)      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                   EPISODIC MEMORY                      │
│   Hierarchical Event Log: Raw -> Hourly -> Daily       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                  SEMANTIC KNOWLEDGE                    │
│   Entity-Relationship Graph + Vector Concept Index     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 PROCEDURAL & ROUTINES                  │
│   Proven execution recipes + success metrics           │
└────────────────────────────────────────────────────────┘
```

## 2. Hybrid Retrieval: Reciprocal Rank Fusion (RRF)
Search relevance is computed by combining Dense Vector Distance ($S_{dense}$) with Sparse BM25 Text Match ($S_{sparse}$) alongside temporal recency decay:

$$RRF(d) = \sum_{m \in \{dense, sparse\}} \frac{1}{60 + \text{rank}_m(d)} \times \text{decay}(t)$$

Where $\text{decay}(t) = e^{-\lambda \Delta t}$.
