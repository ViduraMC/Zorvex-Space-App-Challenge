# Facts policy

This is a product for children, and the judges score scientific validity. A wrong fact is a bug.

1. **Source order:** NASA pages first (science.nasa.gov, nssdc.gsfc.nasa.gov, jpl.nasa.gov,
   nasa.gov/history), then instrument teams (HiRISE, LROC), then peer-reviewed papers.
   Wikipedia and news sites only help you find the NASA page; they are not sources.
2. **One fact, one record** in the episode's `facts.json`:
   `id`, `text` (plain English, as the source states it), `source` (the URL), `sourceName`.
3. **Every line a machine speaks** points at a fact id (`fact: 'id'` or `winFact: 'id'`).
   `fact: null` is only for pure feeling ("Goodbye, my friend!").
4. **Cannot verify it? Write `TODO-VERIFY`** as the source. It may sit in a branch; it may not ship.
5. **Never invent** quotes, final messages, numbers or route coordinates. Imagined first-person
   speech is fine when every claim inside it is a verified fact.
6. **When sources disagree, say so** in the fact text and choose the NASA figure.
   Example: sources give Sojourner's top speed as 1 cm/s, 0.4 m/min and half an inch per second.
   We use NASA History's "0.39 inch per second" (about 1 cm/s).
7. **Our own calculations are labelled as ours** (for example the Earth to Mars distance on
   landing day, computed with Astronomy Engine).
8. **Known traps:** Opportunity's "My battery is low and it's getting dark" is a reporter's
   paraphrase, not a message from the rover. Do not use it as a quote.
9. `npm run check:facts` runs before every pull request; `-- --strict` before release.
