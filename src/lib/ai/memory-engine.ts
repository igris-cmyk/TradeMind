/**
 * TradeMind AI Memory Engine
 * 
 * Persistent behavioral memory system that remembers:
 * - Recurring mistakes and tendencies
 * - Emotional cycles and triggers
 * - Long-term strengths and improvements
 * - Discipline trends over weeks/months
 */

import { prisma } from "@/lib/prisma";
import type { PatternCategory, BehaviorMemoryRecord } from "@/types/behavioral";

/**
 * Retrieve all active behavior memories for a trader.
 */
export async function retrieveTraderMemory(
  userId: string,
  options?: { category?: PatternCategory; limit?: number }
): Promise<BehaviorMemoryRecord[]> {
  const memories = await prisma.behaviorMemory.findMany({
    where: {
      userId,
      isActive: true,
      ...(options?.category ? { category: options.category } : {}),
    },
    orderBy: [
      { confidence: "desc" },
      { occurrences: "desc" },
      { lastSeen: "desc" },
    ],
    take: options?.limit ?? 20,
  });

  return memories.map(m => ({
    id: m.id,
    category: m.category as PatternCategory,
    title: m.title,
    description: m.description,
    confidence: m.confidence,
    occurrences: m.occurrences,
    firstSeen: m.firstSeen,
    lastSeen: m.lastSeen,
    isActive: m.isActive,
  }));
}

/**
 * Get contextually relevant memories for a given trading situation.
 * Matches based on category and recency.
 */
export async function getRelevantMemories(
  userId: string,
  context: {
    emotions?: string[];
    streak?: number;
    recentPatterns?: string[];
  }
): Promise<BehaviorMemoryRecord[]> {
  // Start with all active memories
  const allMemories = await retrieveTraderMemory(userId, { limit: 50 });

  // Score relevance based on context
  const scored = allMemories.map(memory => {
    let relevance = memory.confidence * 0.4; // Base relevance from confidence

    // Boost for recency
    const daysSinceLastSeen = (Date.now() - memory.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSeen < 7) relevance += 0.3;
    else if (daysSinceLastSeen < 30) relevance += 0.15;

    // Boost for high occurrence count
    if (memory.occurrences >= 5) relevance += 0.2;
    else if (memory.occurrences >= 3) relevance += 0.1;

    // Boost for matching context
    if (context.streak && context.streak < -2 && memory.category === "trigger") {
      relevance += 0.3; // During losing streaks, triggers are very relevant
    }
    if (context.streak && context.streak > 3 && memory.title.toLowerCase().includes("overconfidence")) {
      relevance += 0.3;
    }

    return { ...memory, relevance };
  });

  // Sort by relevance and return top results
  return scored
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

/**
 * Update or create a behavior memory observation.
 * If a similar observation exists, reinforce it. Otherwise, create new.
 */
export async function updateMemory(
  userId: string,
  observation: {
    category: PatternCategory;
    title: string;
    description: string;
    tradeId: string;
    confidence?: number;
  }
): Promise<void> {
  // Check for existing similar observation
  const existing = await prisma.behaviorMemory.findFirst({
    where: {
      userId,
      title: observation.title,
      isActive: true,
    },
  });

  if (existing) {
    // Reinforce existing memory
    const currentEvidence = (existing.evidence as Array<{ tradeId: string; date: string }>) || [];
    const newEvidence = [
      ...currentEvidence,
      { tradeId: observation.tradeId, date: new Date().toISOString() },
    ].slice(-20); // Keep last 20 evidence points

    // Increase confidence with diminishing returns
    const newConfidence = Math.min(0.95, existing.confidence + (1 - existing.confidence) * 0.1);

    await prisma.behaviorMemory.update({
      where: { id: existing.id },
      data: {
        description: observation.description,
        evidence: newEvidence,
        confidence: newConfidence,
        lastSeen: new Date(),
        occurrences: { increment: 1 },
      },
    });
  } else {
    // Create new memory
    await prisma.behaviorMemory.create({
      data: {
        userId,
        category: observation.category,
        title: observation.title,
        description: observation.description,
        evidence: [{ tradeId: observation.tradeId, date: new Date().toISOString() }],
        confidence: observation.confidence ?? 0.3,
      },
    });
  }
}

/**
 * Deactivate a memory that is no longer relevant.
 */
export async function deactivateMemory(memoryId: string): Promise<void> {
  await prisma.behaviorMemory.update({
    where: { id: memoryId },
    data: { isActive: false },
  });
}

/**
 * Build a natural language summary of the trader's behavioral memory
 * for use in AI prompts.
 */
export async function buildMemorySummary(userId: string): Promise<string> {
  const memories = await retrieveTraderMemory(userId, { limit: 10 });

  if (memories.length === 0) {
    return "No established behavioral patterns observed yet.";
  }

  const patterns = memories.filter(m => m.category === "pattern");
  const tendencies = memories.filter(m => m.category === "tendency");
  const strengths = memories.filter(m => m.category === "strength");
  const triggers = memories.filter(m => m.category === "trigger");

  const sections: string[] = [];

  if (patterns.length > 0) {
    sections.push(
      "KNOWN PATTERNS:\n" +
      patterns.map(p => `- ${p.title}: ${p.description} (observed ${p.occurrences} times, confidence: ${Math.round(p.confidence * 100)}%)`).join("\n")
    );
  }

  if (tendencies.length > 0) {
    sections.push(
      "BEHAVIORAL TENDENCIES:\n" +
      tendencies.map(t => `- ${t.title}: ${t.description}`).join("\n")
    );
  }

  if (strengths.length > 0) {
    sections.push(
      "STRENGTHS:\n" +
      strengths.map(s => `- ${s.title}: ${s.description}`).join("\n")
    );
  }

  if (triggers.length > 0) {
    sections.push(
      "EMOTIONAL TRIGGERS:\n" +
      triggers.map(t => `- ${t.title}: ${t.description}`).join("\n")
    );
  }

  return sections.join("\n\n");
}
