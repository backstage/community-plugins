---
'@backstage-community/plugin-code-coverage-backend': minor
---

The LCOV converter now reads function records (`FN`/`FNDA`, and `FNL`/`FNA` from lcov 2.2), and the report aggregate and history include function coverage next to line and branch coverage. Functions that share a name in one file are counted separately. Reports in other formats are unaffected.
