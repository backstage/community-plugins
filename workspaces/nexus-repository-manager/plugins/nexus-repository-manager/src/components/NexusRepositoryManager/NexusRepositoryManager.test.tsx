import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAsync } from 'react-use';

import { render } from '@testing-library/react';

import {
  getAssetVariants,
  NexusRepositoryManager,
} from './NexusRepositoryManager';

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest
    .fn()
    .mockReturnValue({ error: null, loading: false, value: [] }),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getComponents: jest.fn().mockReturnValue({ components: [] }),
    getAnnotations: jest.fn().mockReturnValue({ ANNOTATIONS: [] }),
  }),
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: jest.fn().mockReturnValue({ entity: {} }),
}));

jest.mock('../../hooks/', () => ({
  ...jest.requireActual('../../hooks/'),
  useNexusRepositoryManagerAppData: jest
    .fn()
    .mockReturnValue({ title: '', query: {} }),
}));

describe('NexusRepositoryManager', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should show progress if loading is true', () => {
    (useAsync as jest.Mock).mockReturnValue({ loading: true, value: [] });
    const { getByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(getByTestId('nexus-repository-manager-loading')).not.toBeNull();
  });

  it('should show empty table if loaded and value is not present', () => {
    (useAsync as jest.Mock).mockReturnValue({ loading: false, value: [] });
    const { getByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(getByTestId('nexus-repository-manager-table')).not.toBeNull();
    expect(getByTestId('nexus-repository-manager-empty-table')).not.toBeNull();
  });

  it('should show table if loaded and value is present', () => {
    (useAsync as jest.Mock).mockReturnValue({
      loading: false,
      value: [
        {
          component: {
            id: 'ZG9ja2VyOjdmMDZjOGViMzQ2N2JkOWEyNWY0OTUwOWY4ODYxNWFh',
            repository: 'docker',
            format: 'docker',
            group: null,
            name: 'janus-idp/backstage-showcase',
            version: 'latest',
            assets: [
              {
                downloadUrl:
                  'http://localhost:8081/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest',
                path: 'v2/janus-idp/backstage-showcase/manifests/latest',
                id: 'ZG9ja2VyOmE3NjI4NGQzYzVlYjI1MTg0ODBhNmM1MDllN2UyYzE5',
                repository: 'docker',
                format: 'docker',
                checksum: {
                  sha1: '206f5cfc76a16dbba78e2b9a826cbe7bd5cdd7dd',
                  sha256:
                    '85aa455189b4dba87108d57ec3b223b1766e15c16cb03b046a17bdfcddb37cc3',
                },
                contentType:
                  'application/vnd.docker.distribution.manifest.v2+json',
                lastModified: '2023-07-27T21:34:40.249+00:00',
                lastDownloaded: '2023-08-07T17:47:19.273+00:00',
                uploader: 'admin',
                uploaderIp: '0.0.0.0',
                fileSize: 1586,
              },
            ],
          },
          dockerManifests: [
            {
              schemaVersion: 2,
              mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
              config: {
                mediaType: 'application/vnd.docker.container.image.v1+json',
                size: 17214,
                digest:
                  'sha256:7779fcf4e4a18239961a620c36329b646da17abb70d3e4af2d67a2d3b27695c9',
              },
              layers: [
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 36581161,
                  digest:
                    'sha256:7890eb22610600843a22de84c96fab3f2d428d19e164a529d775ebbb22cc2f3e',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 36267603,
                  digest:
                    'sha256:cfdca8bd8795bb3e2c17030868e88434c52d55b7727a10187c9c0b7d0884daf0',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 34035582,
                  digest:
                    'sha256:8b819f6efa3a8cd38f30259971941291a36fa6472a83ae6bf9bc79119d0e4c87',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 32,
                  digest:
                    'sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 132701544,
                  digest:
                    'sha256:ee443150ae3adcf4f259a86940e6095cd661cad1c31774d198f5d8f85adfd28d',
                },
                {
                  mediaType:
                    'application/vnd.docker.image.rootfs.diff.tar.gzip',
                  size: 132772515,
                  digest:
                    'sha256:0fc00d970ac8cb78ca3040c28de02350f68f2eeb4d30c211d94aa06f1b093460',
                },
              ],
            },
          ],
        },
      ],
    });
    const { queryByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(queryByTestId('nexus-repository-manager-table')).not.toBeNull();
    expect(queryByTestId('nexus-repository-manager-empty-table')).toBeNull();
  });

  it('should display groupID for maven components', () => {
    (useAsync as jest.Mock).mockReturnValue({
      loading: false,
      value: [
        {
          component: {
            assets: [
              {
                checksum: {
                  md5: 'f425b239d1ba676c94e00b5cb6669cf3',
                  sha1: 'a1b535139baaa29dad30c6df6ccfa217c5cf99db',
                },
                contentType: 'application/java-archive',
                downloadUrl:
                  'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
                fileSize: 1000000,
                format: 'maven2',
                id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MzIwOGE2YjgxZjZhNWZhMA',
                lastDownloaded: undefined,
                lastModified: '2019-04-17T03:31:58.000+00:00',
                maven2: {
                  artifactId: 'will-halt',
                  extension: 'jar',
                  groupId: 'com.example',
                  version: '0.7.6',
                },
                path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
                repository: 'proxied-maven-central',
                uploader: 'anonymous',
                uploaderIp: '0.0.0.0',
              },
              {
                checksum: {
                  md5: 'ae074b24058b49b6b668f0639570b609',
                  sha1: 'ca9b66d3cd47be4fbab4624f73f8346b97c210a2',
                },
                contentType: 'text/plain',
                downloadUrl:
                  'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar.sha1',
                fileSize: 0,
                format: 'maven2',
                id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MmI1Zjg1MmRlZDY5ZTRjNQ',
                lastDownloaded: undefined,
                lastModified: '2019-04-17T03:32:02.000+00:00',
                maven2: {
                  artifactId: 'will-halt',
                  extension: 'jar.sha1',
                  groupId: 'com.example',
                  version: '0.7.6',
                },
                path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar.sha1',
                repository: 'proxied-maven-central',
                uploader: 'anonymous',
                uploaderIp: '0.0.0.0',
              },
            ],
            format: 'maven2',
            group: 'com.example',
            id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjo4ZmI0MzBjOWRmMjA3MTBjMTYyOTA3ODhiNjQ1YjMxZg',
            name: 'will-halt',
            repository: 'proxied-maven-central',
            tags: [],
            version: '0.7.6',
          },
          dockerManifests: [],
        },
      ],
    });
    const { queryByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );
    expect(
      queryByTestId('nexus-repository-manager-table')?.querySelectorAll(
        'tbody tr',
      )[0].textContent,
    ).toContain('com.example');
  });

  it('should display the first primary asset, not the first asset by order', () => {
    const component = {
      assets: [
        {
          checksum: {
            md5: 'ae074b24058b49b6b668f0639570b609',
            sha1: 'ca9b66d3cd47be4fbab4624f73f8346b97c210a2',
          },
          contentType: 'text/plain',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar.sha1',
          fileSize: 0,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MmI1Zjg1MmRlZDY5ZTRjNQ',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:32:02.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'jar.sha1',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar.sha1',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
        {
          checksum: {
            md5: 'f425b239d1ba676c94e00b5cb6669cf3',
            sha1: 'a1b535139baaa29dad30c6df6ccfa217c5cf99db',
          },
          contentType: 'application/java-archive',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
          fileSize: 1000000,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MzIwOGE2YjgxZjZhNWZhMA',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:31:58.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'jar',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
      ],
      format: 'maven2',
      group: 'com.example',
      id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjo4ZmI0MzBjOWRmMjA3MTBjMTYyOTA3ODhiNjQ1YjMxZg',
      name: 'will-halt',
      repository: 'proxied-maven-central',
      tags: [],
      version: '0.7.6',
    };

    (useAsync as jest.Mock).mockReturnValue({
      loading: false,
      value: [{ component: component, dockerManifests: [] }],
    });

    const { queryByTestId } = render(
      <BrowserRouter>
        <NexusRepositoryManager />
      </BrowserRouter>,
    );

    // hash of the jar, which is second
    const jarShortHash = 'a1b535139ba';
    // verify it really is the second asset's hash (guard against refactors)
    expect(component.assets[1].checksum.sha1).toContain(jarShortHash);
    expect(
      queryByTestId('nexus-repository-manager-table')?.querySelectorAll(
        'tbody tr',
      )[0].textContent,
    ).toContain(jarShortHash);
  });
});

describe('getAssetVariants', () => {
  it('should include a jar for maven assets', () => {
    const component = {
      assets: [
        {
          checksum: {
            md5: 'f425b239d1ba676c94e00b5cb6669cf3',
            sha1: 'a1b535139baaa29dad30c6df6ccfa217c5cf99db',
          },
          contentType: 'application/java-archive',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
          fileSize: 1000000,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MzIwOGE2YjgxZjZhNWZhMA',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:31:58.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'jar',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
        {
          checksum: {
            md5: 'ae074b24058b49b6b668f0639570b609',
            sha1: 'ca9b66d3cd47be4fbab4624f73f8346b97c210a2',
          },
          contentType: 'text/plain',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar.sha1',
          fileSize: 0,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MmI1Zjg1MmRlZDY5ZTRjNQ',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:32:02.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'jar.sha1',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar.sha1',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
        {
          checksum: {
            md5: 'ab3ca44234f60c360586f6aef87c2f0b',
            sha1: 'caac85acce2f2e4e467ac6395b403761238f8182',
          },
          contentType: 'application/xml',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.pom',
          fileSize: 0,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2YmRmMTcyMWFmYTIzNjI2NA',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:32:04.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'pom',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.pom',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
        {
          checksum: {
            md5: '3d9708e4b7ebe7ce5023cdb7521309a2',
            sha1: '3e0427204b02e393b12c03818a36575c69caa631',
          },
          contentType: 'text/plain',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.pom.sha1',
          fileSize: 0,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2NmZmZjA2M2ExZThkOWE5Mw',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:32:17.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'pom.sha1',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.pom.sha1',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
      ],
      format: 'maven2',
      group: 'com.example',
      id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjo4ZmI0MzBjOWRmMjA3MTBjMTYyOTA3ODhiNjQ1YjMxZg',
      name: 'will-halt',
      repository: 'proxied-maven-central',
      tags: [],
      version: '0.7.6',
    };

    const variants = getAssetVariants(component);
    expect(variants).toEqual(new Set(['jar']));
  });

  it('should include classifiers for maven assets', () => {
    const component = {
      assets: [
        {
          checksum: {
            md5: 'f425b239d1ba676c94e00b5cb6669cf3',
            sha1: 'a1b535139baaa29dad30c6df6ccfa217c5cf99db',
          },
          contentType: 'application/java-archive',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
          fileSize: 1000000,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MzIwOGE2YjgxZjZhNWZhMA',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:31:58.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            extension: 'jar',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6.jar',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
        {
          checksum: {
            md5: 'f425b239d1ba676c94e00b5cb6669cf3',
            sha1: 'a1b535139baaa29dad30c6df6ccfa217c5cf99db',
          },
          contentType: 'application/java-archive',
          downloadUrl:
            'https://localhost:8081/repository/proxied-maven-central/com/example/will-halt/0.7.6/will-halt-0.7.6-sources.jar',
          fileSize: 1000000,
          format: 'maven2',
          id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjplZGJkNTJmMzM2NGU3NDg2MzIwOGE2YjgxZjZhNWZhMA',
          lastDownloaded: undefined,
          lastModified: '2019-04-17T03:31:58.000+00:00',
          maven2: {
            artifactId: 'will-halt',
            classifier: 'sources',
            extension: 'jar',
            groupId: 'com.example',
            version: '0.7.6',
          },
          path: 'com/example/will-halt/0.7.6/will-halt-0.7.6-sources.jar',
          repository: 'proxied-maven-central',
          uploader: 'anonymous',
          uploaderIp: '0.0.0.0',
        },
      ],
      format: 'maven2',
      group: 'com.example',
      id: 'cHJveGllZC1tYXZlbi1jZW50cmFsMjo4ZmI0MzBjOWRmMjA3MTBjMTYyOTA3ODhiNjQ1YjMxZg',
      name: 'will-halt',
      repository: 'proxied-maven-central',
      tags: [],
      version: '0.7.6',
    };

    const variants = getAssetVariants(component);
    expect(variants).toEqual(new Set(['jar', '+sources']));
  });

  it('should include extensions for maven assets', () => {
    const component = {
      id: 'bWF2ZW4tcmVsZWFzZXM6MTlkOGNmYTY2ZDA1YmU3ODY5MjViNjIwNjA2YWEwNDM',
      repository: 'maven-releases',
      format: 'maven2',
      group: 'com.example',
      name: 'solve-world-hunger',
      version: '0.0.0.0',
      assets: [
        {
          downloadUrl:
            'http://localhost:8081/repository/maven-releases/com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.pom',
          path: 'com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.pom',
          id: 'bWF2ZW4tcmVsZWFzZXM6OWE1MzVmODc1ZDY5NWRjZDRkNjI0N2E1MGRkNGZhODg',
          repository: 'maven-releases',
          format: 'maven2',
          checksum: {
            sha1: 'd03067b393cc0439c072961db91102e0f2230d32',
            md5: '27dbf99804566adc134d69ad554bc2c5',
          },
          contentType: 'application/xml',
          lastModified: '2020-03-10T14:33:10.271+00:00',
          lastDownloaded: undefined,
          uploader: 'jenkins_ng',
          uploaderIp: '0.0.0.0',
          fileSize: 0,
          maven2: {
            extension: 'pom',
            groupId: 'com.example',
            artifactId: 'solve-world-hunger',
            version: '0.0.0.0',
          },
        },
        {
          downloadUrl:
            'http://localhost:8081/repository/maven-releases/com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.pom.md5',
          path: 'com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.pom.md5',
          id: 'bWF2ZW4tcmVsZWFzZXM6OWE1MzVmODc1ZDY5NWRjZGMzNzNkZWQzMzgyODhiY2U',
          repository: 'maven-releases',
          format: 'maven2',
          checksum: {
            sha1: '776e04e15cd61f5835944760357715e3ded14854',
            md5: '84fdb3fb8d5889ca81dab7232c0cac82',
          },
          contentType: 'text/plain',
          lastModified: '2020-03-10T14:33:10.296+00:00',
          lastDownloaded: undefined,
          uploader: 'jenkins_ng',
          uploaderIp: '0.0.0.0',
          fileSize: 0,
          maven2: {
            extension: 'pom.md5',
            groupId: 'com.example',
            artifactId: 'solve-world-hunger',
            version: '0.0.0.0',
          },
        },
        {
          downloadUrl:
            'http://localhost:8081/repository/maven-releases/com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.pom.sha1',
          path: 'com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.pom.sha1',
          id: 'bWF2ZW4tcmVsZWFzZXM6OWE1MzVmODc1ZDY5NWRjZGFjNDAwZjViNTQ5YTIyODM',
          repository: 'maven-releases',
          format: 'maven2',
          checksum: {
            sha1: '05ceb4188d56e4673fbc6565ba85f8b99ef12121',
            md5: 'cec7cc1f0d83c8b46e0234443a40763d',
          },
          contentType: 'text/plain',
          lastModified: '2020-03-10T14:33:10.284+00:00',
          lastDownloaded: undefined,
          uploader: 'jenkins_ng',
          uploaderIp: '0.0.0.0',
          fileSize: 0,
          maven2: {
            extension: 'pom.sha1',
            groupId: 'com.example',
            artifactId: 'solve-world-hunger',
            version: '0.0.0.0',
          },
        },
        {
          downloadUrl:
            'http://localhost:8081/repository/maven-releases/com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.tar.gz',
          path: 'com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.tar.gz',
          id: 'bWF2ZW4tcmVsZWFzZXM6OWE1MzVmODc1ZDY5NWRjZGQ3YTU3OGFmOTY4Yjc5NDg',
          repository: 'maven-releases',
          format: 'maven2',
          checksum: {
            sha1: '1252f7a1e6fa6127ed7278430639e4e0463ae47a',
            md5: '49855e3e4020a6e3934e4af97238e721',
          },
          contentType: 'application/x-gzip',
          lastModified: '2020-03-10T14:33:10.357+00:00',
          lastDownloaded: undefined,
          uploader: 'jenkins_ng',
          uploaderIp: '0.0.0.0',
          fileSize: 0,
          maven2: {
            extension: 'tar.gz',
            groupId: 'com.example',
            artifactId: 'solve-world-hunger',
            version: '0.0.0.0',
          },
        },
        {
          downloadUrl:
            'http://localhost:8081/repository/maven-releases/com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.tar.gz.md5',
          path: 'com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.tar.gz.md5',
          id: 'bWF2ZW4tcmVsZWFzZXM6OWE1MzVmODc1ZDY5NWRjZDY1MzhmNjMxNTY1MWI1Yzc',
          repository: 'maven-releases',
          format: 'maven2',
          checksum: {
            sha1: 'df488340cd8b14e49d8181a9b3d91ce05f1a0850',
            md5: '008abe627f21602e4ee01a81cf25444e',
          },
          contentType: 'text/plain',
          lastModified: '2020-03-10T14:33:10.379+00:00',
          lastDownloaded: undefined,
          uploader: 'jenkins_ng',
          uploaderIp: '0.0.0.0',
          fileSize: 0,
          maven2: {
            extension: 'tar.gz.md5',
            groupId: 'com.example',
            artifactId: 'solve-world-hunger',
            version: '0.0.0.0',
          },
        },
        {
          downloadUrl:
            'http://localhost:8081/repository/maven-releases/com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.tar.gz.sha1',
          path: 'com/example/solve-world-hunger/0.0.0.0/solve-world-hunger-0.0.0.0.tar.gz.sha1',
          id: 'bWF2ZW4tcmVsZWFzZXM6OWE1MzVmODc1ZDY5NWRjZDI2MWQ5YTBkOTA0OGIzNzU',
          repository: 'maven-releases',
          format: 'maven2',
          checksum: {
            sha1: 'bb5176a4667ad1022bd172882d9d620365e13f6e',
            md5: '16b12944d920acaee37f85e340a0203e',
          },
          contentType: 'text/plain',
          lastModified: '2020-03-10T14:33:10.368+00:00',
          lastDownloaded: undefined,
          uploader: 'jenkins_ng',
          uploaderIp: '0.0.0.0',
          fileSize: 0,
          maven2: {
            extension: 'tar.gz.sha1',
            groupId: 'com.example',
            artifactId: 'solve-world-hunger',
            version: '0.0.0.0',
          },
        },
      ],
      tags: [],
    };

    const variants = getAssetVariants(component);
    expect(variants).toEqual(new Set(['tar.gz']));
  });

  it('should not show anything for docker (for now)', () => {
    // If we support assetVariants for docker (e.g. manifest lists), we can
    // add explicit tests here. For now we can re-use the fixture.
    const allDocker = require('./../../__fixtures__/components/all.json');
    allDocker.forEach((component: any) => {
      expect(getAssetVariants(component)).toEqual(new Set());
    });
  });
});
