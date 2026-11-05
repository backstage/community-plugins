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

import { Button, Flex, Tabs, TabList, Tab, TabPanel } from '@backstage/ui';
import { RiCloseLine } from '@remixicon/react';
import useLocalStorage from 'react-use/esm/useLocalStorage';
import LighthouseSupportButton from '../SupportButton';
import {
  ContentHeader,
  InfoCard,
  Link,
  MarkdownContent,
} from '@backstage/core-components';
import styles from './Intro.module.css';

// TODO(freben): move all of this out of index

export const LIGHTHOUSE_INTRO_LOCAL_STORAGE =
  '@backstage/lighthouse-plugin/intro-dismissed';

const USE_CASES = `
Google's [Lighthouse](https://developers.google.com/web/tools/lighthouse) auditing tool for websites
is a great open-source resource for benchmarking and improving the accessibility, performance, SEO, and best practices of your site.
At Spotify, we keep track of Lighthouse audit scores over time to look at trends and overall areas for investment.

This plugin allows you to generate on-demand Lighthouse audits for websites, and to track the trends for the
top-level categories of Lighthouse at a glance.

In the future, we hope to add support for scheduling audits (which we do internally), as well as allowing
custom runs of Lighthouse to be ingested (for auditing sites that require authentication or some session state).
`;

const SETUP = `
To get started, you will need a running instance of [lighthouse-audit-service](https://github.com/spotify/lighthouse-audit-service).
_It's likely you will need to enable CORS when running lighthouse-audit-service. Initialize the app
with the environment variable \`LAS_CORS\` set to \`true\`._

When you have an instance running that Backstage can hook into, first install the plugin into your app:

\`\`\`sh
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-lighthouse
\`\`\`

Modify your app routes in \`App.tsx\` to include the \`LighthousePage\` component exported from the plugin, for example:

\`\`\`tsx
// At the top imports
import { LighthousePage } from '@backstage-community/plugin-lighthouse';

<FlatRoutes>
  // ...
  <Route path="/lighthouse" element={<LighthousePage />} />
  // ...
</FlatRoutes>;
\`\`\`

Then configure the \`lighthouse-audit-service\` URL in your [\`app-config.yaml\`](https://github.com/backstage/backstage/blob/master/app-config.yaml).

\`\`\`yaml
lighthouse:
  baseUrl: http://your-service-url
\`\`\`
`;

function GettingStartedCard() {
  return (
    <InfoCard
      title="Get started"
      divider
      actions={
        <Flex justify="end">
          <Link to="https://github.com/spotify/lighthouse-audit-service">
            Check out the README
          </Link>
        </Flex>
      }
    >
      <Tabs defaultSelectedKey="use-cases">
        <TabList>
          <Tab id="use-cases">Use cases</Tab>
          <Tab id="setup">Setup</Tab>
        </TabList>
        <TabPanel id="use-cases">
          <MarkdownContent content={USE_CASES} />
        </TabPanel>
        <TabPanel id="setup">
          <MarkdownContent content={SETUP} />
        </TabPanel>
      </Tabs>
    </InfoCard>
  );
}

export interface Props {
  onDismiss?: () => void;
}

export default function LighthouseIntro({ onDismiss = () => {} }: Props) {
  const [dismissed, setDismissed] = useLocalStorage(
    LIGHTHOUSE_INTRO_LOCAL_STORAGE,
    false,
  );

  if (dismissed) return null;

  return (
    <>
      <ContentHeader title="Welcome to Lighthouse in Backstage!">
        <LighthouseSupportButton />
      </ContentHeader>
      <div className={styles.introGrid}>
        <div className={styles.introCardItem}>
          <GettingStartedCard />
        </div>
        {/* TODO add link and image for blog post here */}
        {/* <div>
          <InfoCard>Blog</InfoCard>
        </div> */}
        <div className={styles.introCloseItem}>
          <Flex justify="end" align="end" style={{ height: '100%' }}>
            <Button
              variant="secondary"
              onClick={() => {
                onDismiss();
                setDismissed(true);
              }}
            >
              <RiCloseLine size={16} /> Hide intro
            </Button>
          </Flex>
        </div>
      </div>
    </>
  );
}
