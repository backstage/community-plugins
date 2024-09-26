---
'@backstage-community/plugin-tech-radar': major
---

Added two new config based options for specifying entity data for tech radar to render in the graph. Refactors
and renames the exported 'SampleTechRadarApi' class into 'DefaultTechRadarApi' since it now implements
the ability to load entries into the graph via the config based options in addition to supplying
mock data.
