---
'@backstage-community/plugin-adr': minor
---

Bugfixes:

- Container title was hard-coded to be grey[700]. This does not work in dark mode. Updated to use text secondary color from theme.
- If there's no date on the ADR, the status chip would move all the way to the left. Updated to insert blank div to keep the status from moving.
- In the ADR list container title, text was getting cut off. Changed to ellipsize instead.
- Leading slashes on relative links would break the relative link in content. Trimming leading slashed now.

Feature:

- Adds the ability to provide a custom ADR status component
