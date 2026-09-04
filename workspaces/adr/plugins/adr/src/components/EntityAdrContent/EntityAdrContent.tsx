/*
 * Copyright 2022 The Backstage Authors
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

import { ReactNode, useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';

import groupBy from 'lodash/groupBy';

import {
  Content,
  ContentHeader,
  ErrorPanel,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import {
  AdrFilePathFilterFn,
  ANNOTATION_ADR_LOCATION,
  getAdrLocationUrl,
  isAdrAvailable,
  madrFilePathFilter,
} from '@backstage-community/plugin-adr-common';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import {
  Accordion,
  AccordionPanel,
  AccordionTrigger,
  Grid,
  List,
  ListRow,
  Tag,
  TagGroup,
  Text,
} from '@backstage/ui';

import { adrApiRef, AdrFileInfo } from '../../api';
import { rootRouteRef } from '../../routes';
import { AdrContentDecorator, AdrReader } from '../AdrReader';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { adrTranslationRef } from '../../translations';
import { EntityAdrListItemContext } from './EntityAdrListItemContext';
import styles from './EntityAdrContent.module.css';

const AdrListContainer = (props: {
  adrs: AdrFileInfo[];
  selectedAdr: string;
  title: string;
  statusComponent?: ReactNode;
}) => {
  const { adrs, selectedAdr, title, statusComponent } = props;
  const rootLink = useRouteRef(rootRouteRef);
  const navigate = useNavigate();

  // ponytail: text color only, BUI Tag doesn't expose a background/border
  // override prop like the previous MUI Chip did.
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return styles.adrLabelGood;
      case 'deprecated':
        return styles.adrLabelWarning;
      case 'rejected':
        return styles.adrLabelDangerous;
      default:
        return undefined;
    }
  };

  const list = (
    <List
      aria-label={title || 'ADRs'}
      selectionMode="single"
      selectedKeys={selectedAdr ? [selectedAdr] : []}
      onSelectionChange={keys => {
        const [path] = keys;
        if (path) navigate(`${rootLink()}?record=${path}`);
      }}
    >
      {adrs.map(adr => (
        <ListRow
          id={adr.path}
          key={adr.path}
          textValue={adr.title ?? adr.name}
          description={adr.date}
          customActions={
            statusComponent ??
            (adr.status && (
              <TagGroup>
                <Tag size="small" className={getStatusClass(adr.status)}>
                  {adr.status}
                </Tag>
              </TagGroup>
            ))
          }
        >
          <EntityAdrListItemContext.Provider value={{ adr }}>
            {adr.title ?? adr?.name.replace(/\.md$/, '')}
          </EntityAdrListItemContext.Provider>
        </ListRow>
      ))}
    </List>
  );

  if (!title) {
    return list;
  }

  return (
    <Accordion defaultExpanded>
      <AccordionTrigger title={title} />
      <AccordionPanel>{list}</AccordionPanel>
    </Accordion>
  );
};

/**
 * Component for browsing ADRs on an entity page.
 * @public
 */
export const EntityAdrContent = (props: {
  contentDecorators?: AdrContentDecorator[];
  filePathFilterFn?: AdrFilePathFilterFn;
  statusComponent?: ReactNode;
}) => {
  const { contentDecorators, filePathFilterFn, statusComponent } = props;
  const { entity } = useEntity();
  const [adrList, setAdrList] = useState<AdrFileInfo[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const scmIntegrations = useApi(scmIntegrationsApiRef);
  const adrApi = useApi(adrApiRef);
  const entityHasAdrs = isAdrAvailable(entity);
  const { t } = useTranslationRef(adrTranslationRef);

  const config = useApi(configApiRef);
  const appSupportConfigured = config?.getOptionalConfig('app.support');

  const { value, loading, error } = useAsync(async () => {
    const url = getAdrLocationUrl(entity, scmIntegrations);
    return adrApi.listAdrs(url);
  }, [entity, scmIntegrations]);

  const selectedAdr =
    adrList.find(adr => adr.path === searchParams.get('record'))?.path ?? '';

  const adrSubDirectoryFunc = (adr: AdrFileInfo) => {
    return adr.path.split('/').slice(0, -1).join('/');
  };

  useEffect(() => {
    if (adrList.length && !selectedAdr) {
      searchParams.set('record', adrList[0].path);
      setSearchParams(searchParams, { replace: true });
    }
  });

  useEffect(() => {
    if (!value?.data) {
      return;
    }

    const adrs: AdrFileInfo[] = value.data.filter(
      (item: AdrFileInfo) =>
        item.type === 'file' &&
        (filePathFilterFn
          ? filePathFilterFn(item.path)
          : madrFilePathFilter(item.path)),
    );

    setAdrList(adrs);
  }, [filePathFilterFn, value]);

  const adrListGrouped = Object.entries(
    groupBy(adrList, adrSubDirectoryFunc),
  ).sort();

  return (
    <Content>
      <ContentHeader title={t('contentHeaderTitle')}>
        {appSupportConfigured && <SupportButton />}
      </ContentHeader>

      {!entityHasAdrs && (
        <MissingAnnotationEmptyState annotation={ANNOTATION_ADR_LOCATION} />
      )}

      {loading && <Progress />}

      {entityHasAdrs && !loading && error && (
        <ErrorPanel title={t('failedToFetch')} error={error} />
      )}

      {entityHasAdrs &&
        !loading &&
        !error &&
        (adrList.length ? (
          <Grid.Root columns={{ sm: '12' }} gap="4">
            <Grid.Item colSpan={{ sm: '3' }}>
              <InfoCard>
                <div className={styles.adrMenu}>
                  {adrListGrouped.map(([title, adrs], idx) => (
                    <AdrListContainer
                      adrs={adrs}
                      key={idx}
                      selectedAdr={selectedAdr}
                      title={title}
                      statusComponent={statusComponent}
                    />
                  ))}
                </div>
              </InfoCard>
            </Grid.Item>
            <Grid.Item colSpan={{ sm: '9' }}>
              <AdrReader adr={selectedAdr} decorators={contentDecorators} />
            </Grid.Item>
          </Grid.Root>
        ) : (
          <Text>{t('notFound')}</Text>
        ))}
    </Content>
  );
};
