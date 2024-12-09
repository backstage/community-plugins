import type { Annotation } from './types';

export const NEXUS_REPOSITORY_MANAGER_CONFIG_ANNOTATIONS = [
  {
    annotation: 'nexus-repository-manager/config.title',
  },
] as const satisfies Readonly<Annotation[]>;

export const NEXUS_REPOSITORY_MANAGER_ANNOTATIONS = [
  {
    annotation: 'nexus-repository-manager/docker.image-name',
    query: str => ({
      dockerImageName: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/docker.image-tag',
    query: str => ({
      dockerImageTag: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/docker.layer-id',
    query: str => ({
      dockerLayerId: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/docker.content-digest',
    query: str => ({
      dockerContentDigest: str,
    }),
  },
] as const satisfies Readonly<Annotation[]>;

export const NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS = [
  {
    annotation: 'nexus-repository-manager/keyword',
    query: str => ({
      q: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/repository',
    query: str => ({
      repository: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/format',
    query: str => ({
      format: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/group',
    query: str => ({
      group: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/name',
    query: str => ({
      name: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/version',
    query: str => ({
      version: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/prerelease',
    query: str => ({
      prerelease: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/md5',
    query: str => ({
      md5: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/sha1',
    query: str => ({
      sha1: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/sha256',
    query: str => ({
      sha256: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/sha512',
    query: str => ({
      sha512: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/conan.base-version',
    query: str => ({
      conanBaseVersion: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/conan.channel',
    query: str => ({
      conanChannel: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/conan.revision',
    query: str => ({
      conanRevision: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/conan.package-id',
    query: str => ({
      conanPackageId: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/conan.package-revision',
    query: str => ({
      conanPackageRevision: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/maven.group-id',
    query: str => ({
      mavenGroupId: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/maven.artifact-id',
    query: str => ({
      mavenArtifactId: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/maven.base-version',
    query: str => ({
      mavenBaseVersion: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/maven.extension',
    query: str => ({
      mavenExtension: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/maven.classifier',
    query: str => ({
      mavenClassifier: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/gavec',
    query: str => ({
      gavec: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.scope',
    query: str => ({
      npmScope: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.author',
    query: str => ({
      npmAuthor: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.description',
    query: str => ({
      npmDescription: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.keywords',
    query: str => ({
      npmKeywords: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.license',
    query: str => ({
      npmLicense: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.tagged-is',
    query: str => ({
      npmTaggedIs: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/npm.tagged-not',
    query: str => ({
      npmTaggedNot: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/nuget.id',
    query: str => ({
      nugetId: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/nuget.tags',
    query: str => ({
      nugetTags: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/nuget.title',
    query: str => ({
      nugetTitle: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/nuget.authors',
    query: str => ({
      nugetAuthors: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/nuget.description',
    query: str => ({
      nugetDescription: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/nuget.summary',
    query: str => ({
      nugetSummary: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/p2.plugin-name',
    query: str => ({
      p2PluginName: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/pypi.classifiers',
    query: str => ({
      pypiClassifiers: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/pypi.description',
    query: str => ({
      pypiDescription: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/pypi.keywords',
    query: str => ({
      pypiKeywords: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/pypi.summary',
    query: str => ({
      pypiSummary: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/rubygems.description',
    query: str => ({
      rubygemsDescription: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/rubygems.platform',
    query: str => ({
      rubygemsPlatform: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/rubygems.summary',
    query: str => ({
      rubygemsSummary: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/yum.architecture',
    query: str => ({
      yumArchitecture: str,
    }),
  },
  {
    annotation: 'nexus-repository-manager/yum.name',
    query: str => ({
      yumName: str,
    }),
  },
] as const satisfies Readonly<Annotation[]>;
