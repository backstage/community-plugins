# Nexus Repository Manager Annotations

## Annotation Rules to Note

- Any number of annotations can be used because the resulting query merges all the individual annotation queries.

  e.g. This query grabs the `latest` tagged images in your organization

  ```yaml title="catalog-info.yaml"
  metadata:
    annotations:
      nexus-repository-manager/docker.image-name: `<ORGANIZATION>`,
      nexus-repository-manager/docker.image-tag: latest
  ```

- It is recommended to add a title when using multiple annotations

  e.g.

  ```yaml title="catalog-info.yaml"
  metadata:
    annotations:
      nexus-repository-manager/config.title: Latest Images
      nexus-repository-manager/docker.image-name: `<ORGANIZATION>`,
      nexus-repository-manager/docker.image-tag: latest
  ```

## Config Annotations

- `nexus-repository-manager/config.title`

  `<NexusRepositoryManagerPage />` component title

## Query Annotations

- `nexus-repository-manager/docker.image-name`

  Docker image name

- `nexus-repository-manager/docker.image-tag`

  Docker image tag

- `nexus-repository-manager/docker.layer-id`

  Docker layer ID

- `nexus-repository-manager/docker.content-digest`

  Docker content digest

## Experimental Annotations

- `nexus-repository-manager/keyword`

  Query by keyword

- `nexus-repository-manager/repository`

  Repository name

- `nexus-repository-manager/format`

  Query by format

- `nexus-repository-manager/group`

  Component group

- `nexus-repository-manager/name`

  Component name

- `nexus-repository-manager/version`

  Component version

- `nexus-repository-manager/prerelease`

  Prerelease version flag

- `nexus-repository-manager/md5`

  Specific MD5 hash of component's asset

- `nexus-repository-manager/sha1`

  Specific SHA-1 hash of component's asset

- `nexus-repository-manager/sha256`

  Specific SHA-256 hash of component's asset

- `nexus-repository-manager/sha512`

  Specific SHA-512 hash of component's asset

- `nexus-repository-manager/conan.base-version`

  Conan base version

- `nexus-repository-manager/conan.channel`

  Conan channel

- `nexus-repository-manager/conan.revision`

  Conan recipe revision

- `nexus-repository-manager/conan.package-id`

  Conan package id

- `nexus-repository-manager/conan.package-revision`

  Conan package revision

- `nexus-repository-manager/maven.group-id`

  Maven groupId

- `nexus-repository-manager/maven.artifact-id`

  Maven artifactId

- `nexus-repository-manager/maven.base-version`

  Maven base version

- `nexus-repository-manager/maven.extension`

  Maven extension of component's asset

- `nexus-repository-manager/maven.classifier`

  Maven classifier of component's asset

- `nexus-repository-manager/gavec`

  Group asset version extension classifier

- `nexus-repository-manager/npm.scope`

  npm scope

- `nexus-repository-manager/npm.author`

  npm author

- `nexus-repository-manager/npm.description`

  npm description

- `nexus-repository-manager/npm.keywords`

  npm keywords

- `nexus-repository-manager/npm.license`

  npm license

- `nexus-repository-manager/npm.tagged-is`

  npm tagged is

- `nexus-repository-manager/npm.tagged-not`

  npm tagged not

- `nexus-repository-manager/nuget.id`

  NuGet id

- `nexus-repository-manager/nuget.tags`

  NuGet tags

- `nexus-repository-manager/nuget.title`

  NuGet title

- `nexus-repository-manager/nuget.authors`

  NuGet authors

- `nexus-repository-manager/nuget.description`

  NuGet description

- `nexus-repository-manager/nuget.summary`

  NuGet summary

- `nexus-repository-manager/p2.plugin-name`

  p2 plugin name

- `nexus-repository-manager/pypi.classifiers`

  PyPI classifiers

- `nexus-repository-manager/pypi.description`

  PyPI description

- `nexus-repository-manager/pypi.keywords`

  PyPI keywords

- `nexus-repository-manager/pypi.summary`

  PyPI summary

- `nexus-repository-manager/rubygems.description`

  RubyGems description

- `nexus-repository-manager/rubygems.platform`

  RubyGems platform

- `nexus-repository-manager/rubygems.summary`

  RubyGems summary

- `nexus-repository-manager/yum.architecture`

  Yum architecture

- `nexus-repository-manager/yum.name`

  Yum package name
