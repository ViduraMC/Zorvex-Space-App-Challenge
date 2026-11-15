/**
 * Guard against invented numbers: every number in a model answer must appear in the story's facts.
 * (Seen in testing: the model wrote "27.99 km" where the NASA fact says "27.9 km".)
 * An answer that fails is dropped; the app then answers from the facts themselves.
 */
const NUMBER = /\d[\d,.]*\d|\d/g;
const plain = (n) => n.replace(/,/g, '');

/** @param {string} answer @param {string[]} factTexts */
export function numbersOk(answer, factTexts) {
  const known = new Set(factTexts.flatMap((text) => (text.match(NUMBER) ?? []).map(plain)));
  return (answer.match(NUMBER) ?? []).every((n) => known.has(plain(n)));
}
