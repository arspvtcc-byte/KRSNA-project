import { getAll } from '../db/database.js';

// Clean text for basic token / term matching
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Intelligent Fact Ranker
 * Priority:
 * 1. Pinned facts always get top priority.
 * 2. Relevance match against user query terms.
 * 3. Recency fallback for tie-breaking.
 */
export async function getRankedModeFacts(userId, modeId, currentQuery, limit = 12) {
  // mode_facts uses (user_id, mode_id, key) as primary key, no 'id' column
  const allFacts = await getAll(
    "SELECT key, value, pinned, updated_at FROM mode_facts WHERE user_id = ? AND mode_id = ?",
    [userId, modeId]
  );

  if (!allFacts || allFacts.length === 0) return [];

  const queryTerms = new Set(tokenize(currentQuery));

  const scoredFacts = allFacts.map(fact => {
    let score = 0;
    
    // Pinned facts get immediate high weight
    if (fact.pinned === 1) score += 1000;

    // Term overlap scoring on key & value
    const keyTerms = tokenize(fact.key);
    const valTerms = tokenize(fact.value);

    for (const t of keyTerms) {
      if (queryTerms.has(t)) score += 15;
    }
    for (const t of valTerms) {
      if (queryTerms.has(t)) score += 5;
    }

    // Recency bonus
    const daysOld = Math.floor((Date.now() - fact.updated_at) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 10 - daysOld);

    return {
      ...fact,
      score,
      pinned: fact.pinned === 1,
      text: `- ${fact.key}: ${fact.value}`
    };
  });

  // Sort descending by score, take top N
  scoredFacts.sort((a, b) => b.score - a.score);
  return scoredFacts.slice(0, limit);
}
