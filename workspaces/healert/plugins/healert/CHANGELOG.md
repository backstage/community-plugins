# @backstage-community/plugin-healert

## 0.1.0

### Minor Changes

- 10cf821: Add @backstage-community/plugin-healert - Friction Intelligence Platform.
  Surfaces Kubernetes audit log friction events per Backstage catalog entity
  as Friction Scores and Heatmaps. Detects kubectl-exec, pipeline-skip,
  config-drift, port-forward, and emergency-access events. Uses exponential
  time decay scoring so recent events weigh more than old ones.
