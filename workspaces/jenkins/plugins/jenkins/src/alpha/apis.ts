import {
  createApiExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { jenkinsApiRef, JenkinsClient } from '../api';

/**
 * @alpha
 */
export const jenkinsApi = createApiExtension({
  factory: createApiFactory({
    api: jenkinsApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
    },
    factory: ({ discoveryApi, fetchApi }) =>
      new JenkinsClient({ discoveryApi, fetchApi }),
  }),
});
