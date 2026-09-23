---
'@backstage-community/plugin-adr-common': minor
---

Replaced the unmaintained `front-matter` dependency with a direct, actively-maintained `js-yaml` parser. Front matter is now parsed with the YAML 1.2 Core schema plus timestamps; dates still resolve to `Date` values, while YAML 1.1-only literals such as octal `0755` now parse per YAML 1.2.

Front matter is now only recognised in the MADR 3.x form: a `---` line at the very start of the file and a closing line containing only `---`. The `= yaml =` opener, the `...` closer and files starting with a byte-order mark are no longer treated as front matter, so such files are parsed without their metadata. If your ADRs rely on these, provide a custom parser.
