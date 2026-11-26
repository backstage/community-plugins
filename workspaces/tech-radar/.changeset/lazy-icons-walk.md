---
'@backstage-community/plugin-tech-radar': major
---

**BREAKING** Redesigned the Tech Radar. It now uses Backstage UI (BUI) instead of Material UI, and adds filtering by quadrant and ring. The same radar data can be used without changes.

To migrate:

- The `Router` and `RadarPage` exports have been removed. Use `TechRadarPage` instead.
- The `width`, `height`, `svgProps` and `searchText` props have been removed from `TechRadarPage` and `TechRadarComponent`. The radar now sizes itself and has built-in search. The `width`, `height` and `subtitle` config options on the new frontend system page extension have also been removed, so remove them from your `app-config.yaml`. The page header is now provided by the app.
- Your app must import the Backstage UI styles, or the radar won't be styled. Apps created from a recent Backstage template already do this, but older apps on either frontend system may not. If yours doesn't, add it to `packages/app/src/index.tsx`:

  ```ts
  import '@backstage/ui/css/styles.css';
  ```
