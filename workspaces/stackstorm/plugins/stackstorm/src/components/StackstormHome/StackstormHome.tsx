/*
 * Copyright 2023 The Backstage Authors
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
import type { ReactNode } from 'react';

import { Fragment } from 'react';
import {
  Header,
  Page,
  HeaderLabel,
  TabbedLayout,
  Content,
} from '@backstage/core-components';
import { ButtonIcon } from '@backstage/ui';
import { RiBookOpenLine } from '@remixicon/react';
import { ExecutionsTable } from '../ExecutionsTable';
import { PacksTable } from '../PacksTable/PacksTable';
import { ActionsList } from '../ActionsList';

/**
 * @public
 */
export type StackstormHomeProps = {
  title?: string;
  subtitle?: string;
  headerButtons?: ReactNode[];
};

export const StackstormHome = (props: StackstormHomeProps) => (
  <Page themeId="tool">
    <Header
      title={props.title || 'Welcome to StackStorm!'}
      subtitle={props.subtitle || 'Event-driven automation'}
    >
      {props.headerButtons ? (
        props.headerButtons.map((headerButton, idx) => (
          <Fragment key={idx}>{headerButton}</Fragment>
        ))
      ) : (
        <ButtonIcon
          aria-label="Docs"
          icon={<RiBookOpenLine />}
          variant="primary"
          onPress={() =>
            window.open(
              'https://docs.stackstorm.com/',
              '_blank',
              'noopener,noreferrer',
            )
          }
        />
      )}
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <TabbedLayout>
      <TabbedLayout.Route path="/history" title="Executions">
        <Content noPadding>
          <ExecutionsTable />
        </Content>
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/packs" title="Packs">
        <Content noPadding>
          <PacksTable />
        </Content>
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/actions" title="Actions">
        <Content noPadding>
          <ActionsList />
        </Content>
      </TabbedLayout.Route>
    </TabbedLayout>
  </Page>
);
