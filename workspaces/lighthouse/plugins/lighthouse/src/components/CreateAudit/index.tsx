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

import { Button, Flex, Select, TextField } from '@backstage/ui';
import styles from './CreateAudit.module.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormFactor,
  LighthouseConfigSettings,
} from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from '../../api';
import { useQuery } from '../../utils';
import LighthouseSupportButton from '../SupportButton';

import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
} from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

// TODO(freben): move all of this out of index

const formFactorToScreenEmulationMap: Record<
  FormFactor,
  LighthouseConfigSettings['screenEmulation']
> = {
  // the default is mobile, so no need to override
  mobile: undefined,
  // Values from lighthouse's cli "desktop" preset
  // https://github.com/GoogleChrome/lighthouse/blob/a6738e0033e7e5ca308b97c1c36f298b7d399402/lighthouse-core/config/constants.js#L71-L77
  desktop: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  },
};

export const CreateAuditContent = () => {
  const errorApi = useApi(errorApiRef);
  const lighthouseApi = useApi(lighthouseApiRef);
  const query = useQuery();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState<string>(query.get('url') || '');
  const [formFactor, setFormFactor] = useState<FormFactor>('mobile');

  const triggerAudit = useCallback(async (): Promise<void> => {
    setSubmitting(true);
    try {
      // TODO use the id from the response to redirect to the audit page for that id when
      // FAILED and RUNNING audits are supported
      await lighthouseApi.triggerAudit({
        url: url.replace(/\/$/, ''),
        options: {
          lighthouseConfig: {
            settings: {
              formFactor,
              emulatedFormFactor: formFactor,
              screenEmulation: formFactorToScreenEmulationMap[formFactor],
            },
          },
        },
      });
      navigate('..');
    } catch (err) {
      errorApi.post(err);
    } finally {
      setSubmitting(false);
    }
  }, [url, formFactor, lighthouseApi, setSubmitting, errorApi, navigate]);

  return (
    <>
      <ContentHeader
        title="Trigger a new audit"
        description="Submitting this form will immediately trigger and store a new Lighthouse audit. Trigger audits to track your website's accessibility, performance, SEO, and best practices over time."
      >
        <LighthouseSupportButton />
      </ContentHeader>
      <Flex direction="column">
        <div className={styles.formContainer}>
          <InfoCard>
            <form
              onSubmit={ev => {
                ev.preventDefault();
                triggerAudit();
              }}
            >
              <Flex direction="column" style={{ gap: 'var(--bui-space-4)' }}>
                <div className={styles.input}>
                  <TextField
                    label="URL"
                    placeholder="https://spotify.com"
                    isRequired
                    isDisabled={submitting}
                    onChange={setUrl}
                    value={url}
                  />
                </div>
                <div className={styles.input}>
                  <Select
                    label="Emulated Form Factor"
                    isDisabled={submitting}
                    value={formFactor}
                    onChange={selectValue => {
                      if (selectValue !== null && !Array.isArray(selectValue)) {
                        setFormFactor(String(selectValue) as FormFactor);
                      }
                    }}
                    options={[
                      { value: 'mobile', label: 'Mobile' },
                      { value: 'desktop', label: 'Desktop' },
                    ]}
                  />
                </div>
                <div className={styles.buttonList}>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('..')}
                    isDisabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isDisabled={submitting}
                  >
                    Create Audit
                  </Button>
                </div>
              </Flex>
            </form>
          </InfoCard>
        </div>
      </Flex>
    </>
  );
};

const CreateAudit = () => (
  <Page themeId="tool">
    <Header title="Lighthouse" subtitle="Website audits powered by Lighthouse">
      <HeaderLabel label="Owner" value="Spotify" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <CreateAuditContent />
    </Content>
  </Page>
);

export default CreateAudit;
