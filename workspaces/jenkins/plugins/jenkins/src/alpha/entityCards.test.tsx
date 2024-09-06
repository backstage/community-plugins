import { screen, waitFor } from '@testing-library/react';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import * as cards from './entityCards';
import {
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { JenkinsApi, jenkinsApiRef } from '../api';
import { sampleEntity } from '../__fixtures__/entity';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => sampleEntity,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => () => '/jenkins',
}));

describe('Entity content extensions', () => {
  const mockJenkinsApi = createApiExtension({
    factory: createApiFactory({
      api: jenkinsApiRef,
      deps: {},
      factory: () =>
        ({
          getProjects: jest.fn(),
          getBuild: jest.fn(),
          getJobBuilds: jest.fn().mockReturnValue({
            name: 'main',
            displayName: 'main',
            description: 'description',
            fullDisplayName: 'main',
            inQueue: false,
            fullName: 'main',
            url: 'url.com',
            builds: [],
          }),
          retry: () => null,
        } as unknown as JenkinsApi),
    }),
  });

  it('should render Jenkins latest run card', async () => {
    createExtensionTester(cards.entityLatestJenkinsRunCard)
      .add(mockJenkinsApi)
      .render();

    await waitFor(() => {
      expect(screen.getByText('Latest master build')).toBeInTheDocument();
    });
  });

  it('should render Jenkins runs table', async () => {
    createExtensionTester(cards.entityJobRunsTable)
      .add(mockJenkinsApi)
      .render();

    await waitFor(() => {
      expect(screen.getByText('main Runs')).toBeInTheDocument();
    });
  });
});
