---
'@backstage-community/plugin-tech-radar': major
---

Adds a config based option for specifying entity data for tech radar to render in the graph. Refactors
and renames the exported 'SampleTechRadarApi' class into 'DefaultTechRadarApi' since it now implements
the ability to load entries by proxying to an api specified in that config in addition to supplying
mock data.
