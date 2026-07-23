
const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return [];
  }

  // Preserve paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\t+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ ]{2,}/g, " ")
    .trim();

  const paragraphs = cleanedText
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];

  let currentWords = [];
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/);

    // Large paragraph
    if (words.length > chunkSize) {
      if (currentWords.length > 0) {
        chunks.push({
          content: currentWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        currentWords = [];
      }

      for (let i = 0; i < words.length; i += chunkSize - overlap) {
        chunks.push({
          content: words.slice(i, i + chunkSize).join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= words.length) break;
      }

      continue;
    }

    // Need new chunk
    if (currentWords.length + words.length > chunkSize) {
      chunks.push({
        content: currentWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Overlap
      currentWords = currentWords.slice(
        -Math.min(overlap, currentWords.length)
      );
    }

    currentWords.push(...words);
  }

  // Save last chunk
  if (currentWords.length > 0) {
    chunks.push({
      content: currentWords.join(" "),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  }

  // Fallback
  if (chunks.length === 0) {
    const words = cleanedText.split(/\s+/);

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      chunks.push({
        content: words.slice(i, i + chunkSize).join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= words.length) break;
    }
  }

  return chunks;
};

// Escape regex characters
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ======================================
// Find relevant chunks for a user query
// ======================================

const findRelevantChunks = (
  chunks,
  query,
  maxChunks = 3
) => {
  if (!chunks?.length || !query) {
    return [];
  }

  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "can",
    "could",
    "should",
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\W+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !stopWords.has(word)
    );

  if (!queryWords.length) {
    return chunks
      .slice(0, maxChunks)
      .map((chunk) => ({
        ...chunk,
        score: 0,
      }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = (chunk.content || "").toLowerCase();

    const wordCount = Math.max(
      1,
      content.split(/\s+/).length
    );

    let score = 0;
    let matchedWords = 0;

    for (const word of queryWords) {
      const escaped = escapeRegex(word);

      const exactMatches = (
        content.match(
          new RegExp(`\\b${escaped}\\b`, "g")
        ) || []
      ).length;

      if (exactMatches > 0) matchedWords++;

      score += exactMatches * 3;
    }

    if (matchedWords > 1) {
      score += matchedWords * 2;
    }

    score /= Math.max(1, Math.sqrt(wordCount));

    // Slight bonus for earlier chunks
    score *= 1 - (index / chunks.length) * 0.1;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score,
      matchedWords,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }

      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};
module.exports = { chunkText, findRelevantChunks };
