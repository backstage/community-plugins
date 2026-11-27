/*
 * Copyright 2024 The Backstage Authors
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
import { ErrorPanel } from '@backstage/core-components';
import {
  EntityInfoCard,
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Flex, Grid, Link, Text } from '@backstage/ui';
import { RiExternalLinkLine } from '@remixicon/react';

import { NpmAnnotation } from '@backstage-community/plugin-npm-common';

import { usePackageInfo } from '../hooks/usePackageInfo';
import { useTranslation } from '../hooks/useTranslation';
import { RelativePublishedAt } from './RelativePublishedAt';

function LabeledValueGrid({ children }: { children: React.ReactNode }) {
  return <Grid.Root columns="3">{children}</Grid.Root>;
}

function LabeledValue({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  if (!value) {
    return null;
  }
  return (
    <Grid.Item colSpan={fullWidth ? '3' : '1'}>
      <Text
        as="h2"
        variant="body-x-small"
        weight="bold"
        color="secondary"
        style={{ textTransform: 'uppercase' }}
      >
        {label}
      </Text>
      <Text as="p" variant="body-medium" weight="bold">
        {value}
      </Text>
    </Grid.Item>
  );
}

function LabeledExternalLink({
  label,
  href,
}: {
  label: string;
  href: string | null | undefined;
}) {
  if (!href) {
    return null;
  }
  const value = (
    <Text as="p" variant="body-medium" weight="bold">
      <Link href={href} target="_blank">
        {href}
        <RiExternalLinkLine
          aria-hidden="true"
          style={{ width: '1em', height: '1em', marginInlineStart: '0.25em' }}
        />
      </Link>
    </Text>
  );
  return <LabeledValue label={label} value={value} fullWidth />;
}

/** }
          fullWidth
 * Card for the catalog (entity page) that shows the npm
 * name, description, keywords, license, some links and
 * the latest version if available.
 *
 * @public
 */
export const EntityNpmInfoCard = () => {
  const { entity } = useEntity();
  const { packageInfo, loading, error } = usePackageInfo();
  const { t } = useTranslation();

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];

  if (!packageName) {
    return (
      <MissingAnnotationEmptyState
        annotation={NpmAnnotation.PACKAGE_NAME}
        readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
      />
    );
  }

  const latestTag =
    entity.metadata.annotations?.[NpmAnnotation.STABLE_TAG] ?? 'latest';
  const latestVersion = packageInfo?.['dist-tags']?.[latestTag];
  const latestPublishedAt = latestVersion
    ? packageInfo?.time?.[latestVersion]
    : undefined;

  const registryName =
    entity.metadata.annotations?.[NpmAnnotation.REGISTRY_NAME];

  const npmLink =
    packageInfo && !registryName
      ? `https://www.npmjs.com/package/${packageName}`
      : null;

  let repositoryLink: string | undefined;
  if (packageInfo?.repository?.url) {
    let url = packageInfo.repository.url;
    if (url.startsWith('git+https://')) {
      url = url.slice('git+'.length);
    }
    if (url.endsWith('.git')) {
      url = url.slice(0, -'.git'.length);
    }
    if (url.startsWith('https://')) {
      if (
        url.startsWith('https://github.com/') &&
        packageInfo.repository.directory
      ) {
        repositoryLink = `${url}/tree/main/${packageInfo.repository.directory}`;
      } else {
        repositoryLink = url;
      }
    }
  }

  const bugsLink = packageInfo?.bugs?.url;

  const homepageLink = packageInfo?.homepage;

  return (
    <EntityInfoCard title={t('infoCard.title', { packageName })}>
      {error ? (
        <Flex style={{ width: '100%' }}>
          <ErrorPanel error={error} />
        </Flex>
      ) : null}

      {loading && !packageInfo ? (
        <Flex
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            minHeight: '15rem',
          }}
        >
          {/* <CircularProgress size="5rem" /> */}
          LOADING
        </Flex>
      ) : null}

      <LabeledValueGrid>
        <LabeledValue
          label={t('infoCard.latestVersion')}
          value={latestVersion}
        />

        <LabeledValue
          label={t('infoCard.publishedAt')}
          value={
            latestPublishedAt ? (
              <RelativePublishedAt dateTime={latestPublishedAt} />
            ) : null
          }
        />

        <LabeledValue
          label={t('infoCard.license')}
          value={packageInfo?.license}
        />

        {/* Markdown? */}
        <LabeledValue
          label={t('infoCard.description')}
          value={packageInfo?.description}
          fullWidth
        />

        <LabeledValue
          label={t('infoCard.keywords')}
          value={
            packageInfo?.keywords?.length
              ? packageInfo.keywords.join(', ')
              : null
          }
        />

        <LabeledValue label={t('infoCard.registryName')} value={registryName} />

        <LabeledExternalLink
          label={t('infoCard.npmRepository')}
          href={npmLink}
        />

        <LabeledExternalLink
          label={t('infoCard.codeRepository')}
          href={repositoryLink}
        />

        <LabeledExternalLink
          label={t('infoCard.issueTracker')}
          href={bugsLink}
        />

        <LabeledExternalLink
          label={t('infoCard.homepage')}
          href={homepageLink}
        />
      </LabeledValueGrid>
    </EntityInfoCard>
  );
};
