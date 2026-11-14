/** Finds the checked fact that best answers a question (word overlap, rarer words count more). */
import type { Fact } from '../engine/types';

const STOP = new Set('a an the is are was were do did does you your yours i me my of in on at to for and or what when where why how who which it its with from by about that this'.split(' '));

const words = (text: string): string[] =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => w.replace(/(ing|ed|es|s)$/, ''));

/** The fact that shares the most (rare) words with the question; null when nothing matches. */
export function bestFact(question: string, facts: Fact[]): Fact | null {
  const docs = facts.map((f) => new Set(words(f.text)));
  const df = new Map<string, number>();
  for (const d of docs) for (const w of d) df.set(w, (df.get(w) ?? 0) + 1);
  let best: Fact | null = null;
  let bestScore = 0;
  const q = new Set(words(question));
  facts.forEach((f, i) => {
    let score = 0;
    for (const w of q) if (docs[i].has(w)) score += Math.log(1 + facts.length / (df.get(w) ?? 1));
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  });
  return best;
}
