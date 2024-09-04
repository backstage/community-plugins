import {
  GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR,
  GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD,
  GRAFANA_ANNOTATION_DASHBOARD_SELECTOR,
  GRAFANA_ANNOTATION_TAG_SELECTOR,
} from '../constants';

export const sampleEntity = {
  entity: {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'awesome-service',
      annotations: {
        [GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR]: 'service=awesome-service',
        [GRAFANA_ANNOTATION_TAG_SELECTOR]: 'awesome-tag',
        [GRAFANA_ANNOTATION_DASHBOARD_SELECTOR]:
          "(tags @> 'my-service' || tags @> 'my-service-slo') && tags @> 'generated'",
        [GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD]:
          'https://backstage.io/grafana-dashboard-test',
      },
    },
    spec: {
      lifecycle: 'experimental',
      type: 'service',
      owner: 'cncf',
    },
  },
};
