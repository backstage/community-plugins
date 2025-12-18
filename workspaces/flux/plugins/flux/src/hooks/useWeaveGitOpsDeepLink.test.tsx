/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConfigApi, configApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { useWeaveGitOpsDeepLink } from './useWeaveGitOpsDeepLink';
import { GitRepository, HelmRelease, OCIRepository } from '../objects';
import * as unverifiedGitRepositoryV1 from '../__fixtures__/unverified_git_repository_v1.json';
import * as unverifiedOCIRepositoryV1beta2 from '../__fixtures__/unverified_oci_repository_v1beta2.json';
import * as unverifiedOCIRepositoryV1 from '../__fixtures__/unverified_oci_repository_v1.json';

const testHelmReleaseV2beta1 = new HelmRelease({
  clusterName: 'Default',
  payload:
    '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"}}',
});

const testHelmReleaseV2 = new HelmRelease({
  clusterName: 'Default',
  payload:
    '{"apiVersion":"helm.toolkit.fluxcd.io/v2","kind":"HelmRelease","metadata":{"creationTimestamp":"2025-09-18T14:20:30Z","finalizers":["finalizers.fluxcd.io"],"generation":1,"name":"harbor","namespace":"harbor","resourceVersion":"6847291","uid":"e8f9a0b1-2345-6789-0123-456789abcdef"},"spec":{"interval":"5m","chart":{"spec":{"chart":"harbor","version":"1.18.0","sourceRef":{"kind":"HelmRepository","name":"harbor","namespace":"harbor"},"interval":"60m"}}},"status":{"lastAppliedRevision":"1.18.0","conditions":[{"lastTransitionTime":"2025-09-18T14:20:35Z","message":"Release reconciliation succeeded","reason":"ReconciliationSucceeded","status":"True","type":"Ready"}]}}',
});

const testGitRepositoryV1 = new GitRepository({
  clusterName: 'Default',
  payload: JSON.stringify(unverifiedGitRepositoryV1),
});

const testOCIRepositoryV1beta2 = new OCIRepository({
  clusterName: 'demo-cluster',
  payload: JSON.stringify(unverifiedOCIRepositoryV1beta2),
});

const testOCIRepositoryV1 = new OCIRepository({
  clusterName: 'demo-cluster',
  payload: JSON.stringify(unverifiedOCIRepositoryV1),
});

let gitOpsUrl: string | undefined;

const mockConfigApi = {
  getOptionalString: jest.fn(() => gitOpsUrl),
} as Partial<ConfigApi>;

const wrapper = ({ children }: PropsWithChildren<{}>) => {
  return (
    <TestApiProvider apis={[[configApiRef, mockConfigApi]]}>
      {children}
    </TestApiProvider>
  );
};

describe('useWeaveGitOpsDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gitOpsUrl = undefined;
  });

  describe('when configured with a gitops url', () => {
    it('calculates a url for HelmReleases (v2beta1)', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testHelmReleaseV2beta1),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/helm_release/details?clusterName=Default&name=normal&namespace=default',
      );
    });

    it('calculates a url for HelmReleases (v2)', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testHelmReleaseV2),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/helm_release/details?clusterName=Default&name=harbor&namespace=harbor',
      );
    });

    it('calculates a url for GitRepositories (v1)', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testGitRepositoryV1),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/git_repo/details?clusterName=Default&name=podinfo&namespace=backstage',
      );
    });

    it('calculates a url for OCIRepositories (v1beta2)', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testOCIRepositoryV1beta2),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/oci/details?clusterName=demo-cluster&name=testing&namespace=default',
      );
    });

    it('calculates a url for OCIRepositories (v1)', async () => {
      gitOpsUrl = 'https://example.com';

      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testOCIRepositoryV1),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/oci/details?clusterName=demo-cluster&name=backstage&namespace=default',
      );
    });
  });

  describe('when the url ends with a trailing slash', () => {
    it('drops it from the generated URL', async () => {
      gitOpsUrl = 'https://example.com/';

      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testHelmReleaseV2beta1),
        {
          wrapper,
        },
      );
      expect(result.current).toBe(
        'https://example.com/helm_release/details?clusterName=Default&name=normal&namespace=default',
      );
    });
  });

  describe('when configured without a gitops url', () => {
    it('returns undefined', async () => {
      const { result } = renderHook(
        () => useWeaveGitOpsDeepLink(testHelmReleaseV2beta1),
        {
          wrapper,
        },
      );
      expect(result.current).toBeUndefined();
    });
  });

  describe('when the cluster name has a namespace name/test-ns', () => {
    it('is correctly URL encoded into the request URL', async () => {
      gitOpsUrl = 'https://example.com/';

      const helmRelease = new HelmRelease({
        clusterName: 'demo-ns/test-cluster',
        payload:
          '{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"annotations":{"metadata.weave.works/test":"value"},"creationTimestamp":"2023-05-25T14:14:46Z","finalizers":["finalizers.fluxcd.io"],"generation":5,"name":"normal","namespace":"default","resourceVersion":"1","uid":"82231842-2224-4f22-8576-5babf08d746d"}}',
      });

      const { result } = renderHook(() => useWeaveGitOpsDeepLink(helmRelease), {
        wrapper,
      });
      expect(result.current).toBe(
        'https://example.com/helm_release/details?clusterName=demo-ns%2Ftest-cluster&name=normal&namespace=default',
      );
    });
  });
});
