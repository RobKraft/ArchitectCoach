# Working with an AI coding assistant on Static website

- Point your assistant at this `docs/` folder at the start of a session — it has the actual
  decisions and standards for this project, not generic defaults.
- Before asking it to implement something that touches a documented decision (build approach,
  hosting, analytics), have it read the relevant ADR in `decisions/` first.
- Ask it to update the relevant doc in the same change when it makes a new non-trivial
  decision, rather than leaving that decision undocumented.
- Treat its output the way you'd treat a junior contributor's PR: read the diff, don't just
  trust the summary of what it says it did.
