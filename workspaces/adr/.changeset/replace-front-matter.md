---
'@backstage-community/plugin-adr-common': minor
---

Replaced the unmaintained `front-matter` dependency with a direct, actively-maintained `js-yaml` parser. Front matter is now parsed with the YAML 1.2 Core schema plus timestamps; dates still resolve to `Date` values, while YAML 1.1-only literals such as octal `0755` now parse per YAML 1.2.
