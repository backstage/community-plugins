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

export const TechRadarPage = (props: TechRadarPageProps) => {
  const {
    title = 'Tech Radar',
    pageTitle = 'Company Radar',
    subtitle = 'Pick the recommended technologies for your projects',
    id,
  } = props;

  return (
    <>
      <Header title={title} description={subtitle} />
      <Container>
        <Text as="h2" variant="title-medium">
          {pageTitle}
        </Text>
        <TechRadarComponent id={id} />
      </Container>
    </>
  );
};
