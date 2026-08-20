/*
 * Copyright 2020 The Backstage Authors
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

import Alert from '@material-ui/lab/Alert';
import { ReactNode, useEffect, useState } from 'react';
import {
  generatePath,
  Link,
  resolvePath,
  useNavigate,
  useParams,
} from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';
import { Audit, Website } from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from '../../api';
import { formatTime } from '../../utils';
import AuditStatusIcon from '../AuditStatusIcon';
import LighthouseSupportButton from '../SupportButton';
import { Button } from '@backstage/ui';
import styles from './AuditView.module.css';

import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  Progress,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { rootRouteRef } from '../../plugin';

// TODO(freben): move all of this out of index

interface AuditLinkListProps {
  audits?: Audit[];
  selectedId: string;
}
const AuditLinkList = ({ audits = [], selectedId }: AuditLinkListProps) => {
  const fromPath = useRouteRef(rootRouteRef)?.() ?? '../';
  return (
    <nav data-testid="audit-sidebar" aria-label="lighthouse audit history">
      <ul className={styles.auditList}>
        {audits.map(audit => (
          <li key={audit.id} className={styles.auditListItem}>
            <Link
              replace
              to={resolvePath(
                generatePath('audit/:id', { id: audit.id }),
                fromPath,
              )}
              className={`${styles.auditListItemLink}${
                audit.id === selectedId ? ` ${styles.selected}` : ''
              }`}
            >
              <span className={styles.auditListItemIcon}>
                <AuditStatusIcon audit={audit} />
              </span>
              <span>{formatTime(audit.timeCreated)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const AuditView = ({ audit }: { audit?: Audit }) => {
  const params = useParams() as { id: string };
  const { url: lighthouseUrl } = useApi(lighthouseApiRef);

  if (audit?.status === 'RUNNING') return <Progress />;
  if (audit?.status === 'FAILED')
    return (
      <Alert severity="error">
        This audit failed when attempting to run after several retries. Check
        that your instance of lighthouse-audit-service can successfully connect
        to your website and try again.
      </Alert>
    );

  return (
    <InfoCard variant="fullHeight">
      <iframe
        className={styles.iframe}
        title={`Lighthouse audit${audit?.url ? ` for ${audit.url}` : ''}`}
        src={`${lighthouseUrl}/v1/audits/${encodeURIComponent(params.id)}`}
      />
    </InfoCard>
  );
};

export const AuditViewContent = () => {
  const lighthouseApi = useApi(lighthouseApiRef);
  const fromPath = useRouteRef(rootRouteRef)?.() ?? '../';
  const params = useParams() as { id: string };
  const navigate = useNavigate();

  const {
    loading,
    error,
    value: nextValue,
  } = useAsync(
    async () => await lighthouseApi.getWebsiteForAuditId(params.id),
    [params.id],
  );
  const [value, setValue] = useState<Website>();
  useEffect(() => {
    if (!!nextValue && nextValue.url !== value?.url) {
      setValue(nextValue);
    }
  }, [value, nextValue, setValue]);

  let content: ReactNode = null;
  if (value) {
    content = (
      <div className={styles.contentGrid}>
        <div className={styles.sidebar}>
          <AuditLinkList audits={value?.audits} selectedId={params.id} />
        </div>
        <div className={styles.main}>
          <AuditView audit={value?.audits.find(a => a.id === params.id)} />
        </div>
      </div>
    );
  } else if (loading) {
    content = <Progress />;
  } else if (error) {
    content = (
      <Alert
        data-testid="error-message"
        severity="error"
        className={styles.errorOutput}
      >
        {error.message}
      </Alert>
    );
  }

  let createAuditButtonUrl = 'create-audit';
  if (value?.url) {
    createAuditButtonUrl += `?url=${encodeURIComponent(value.url)}`;
  }

  return (
    <>
      <ContentHeader
        title={value?.url || 'Audit'}
        description="See a history of all Lighthouse audits for your website run through Backstage."
      >
        <Button
          variant="primary"
          onClick={() => navigate(resolvePath(createAuditButtonUrl, fromPath))}
        >
          Create New Audit
        </Button>
        <LighthouseSupportButton />
      </ContentHeader>
      {content}
    </>
  );
};

const ConnectedAuditView = () => (
  <Page themeId="tool">
    <Header title="Lighthouse" subtitle="Website audits powered by Lighthouse">
      <HeaderLabel label="Owner" value="Spotify" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content stretch>
      <AuditViewContent />
    </Content>
  </Page>
);

export default ConnectedAuditView;
