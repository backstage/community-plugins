/*
 * Copyright 2026 The Backstage Authors
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
import { Container, Header, Text } from '@backstage/ui';

import { TechRadarComponent } from './TechRadarComponent';

/** @public */
export type TechRadarPageProps = {
  title?: string;
  subtitle?: string;
  pageTitle?: string;
  id?: string;
};

const DEFAULT_SUBTITLE = 'Pick the recommended technologies for your projects';
const DEFAULT_PAGE_TITLE = 'Company Radar';

/**
 * The page content without a page header. Used directly by the new frontend
 * system, where the page header is rendered by the app.
 *
 * @internal
 */
export const TechRadarPageContent = (props: {
  pageTitle?: string;
  id?: string;
}) => {
  const { pageTitle = DEFAULT_PAGE_TITLE, id } = props;

  return (
    <Container>
      <Text as="h2" variant="title-medium">
        {pageTitle}
      </Text>
      <TechRadarComponent id={id} />
    </Container>
  );
};

export const TechRadarPage = (props: TechRadarPageProps) => {
  const {
    title = 'Tech Radar',
    pageTitle = DEFAULT_PAGE_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    id,
  } = props;

  return (
    <>
      <Header title={title} description={subtitle} />
      <TechRadarPageContent pageTitle={pageTitle} id={id} />
    </>
  );
};
