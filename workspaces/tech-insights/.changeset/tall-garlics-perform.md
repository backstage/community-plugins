---
'@backstage-community/plugin-tech-insights': patch
---

Added support for links for checks. Static links are defined in the backend for each check. Dynamic links (based on the entity, e.g. to go to github repos, sonarqube projects, etc) are defined with functions in the frontend, when registering the tech-insights API. Two new components are added, TechInsightsCheckIcon and TechInsightsLinksMenu. The former to wrap a result icon with a popup menu with links, the second is the component to show the popup with links (which can be arbitrarily componsed in other UI views).
