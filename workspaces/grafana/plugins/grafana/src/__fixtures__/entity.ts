import {
  GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR,
  GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD,
  GRAFANA_ANNOTATION_TAG_SELECTOR,
} from '../constants';

export const sampleEntity = {
  entity: {
    metadata: {
      annotations: {
        [GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR]: 'service=awesome-service',
        [GRAFANA_ANNOTATION_TAG_SELECTOR]: 'awesome-tag',
        [GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD]:
          'https://backstage.io/grafana-dashboard-test',
      },
    },
  },
};
