---
'@backstage-community/plugin-tech-radar': major
---

**BREAKING** Redesigned the Tech Radar. It now uses Backstage UI (BUI) instead of Material UI, and adds filtering by quadrant and ring. The same radar data can be used without changes.

To migrate:

- The `Router` and `RadarPage` exports have been removed. Use `TechRadarPage` instead.
- The `width`, `height`, `svgProps` and `searchText` props have been removed from `TechRadarPage` and `TechRadarComponent`. The radar now sizes itself and has built-in search. The `width` and `height` config options on the new frontend system page extension have also been removed, so remove them from your `app-config.yaml`.
- Apps using the legacy frontend system must import the Backstage UI styles, or the radar won't be styled. For example, in `packages/app/src/index.tsx`:

  ```ts
  import '@backstage/ui/css/styles.css';
  ```
