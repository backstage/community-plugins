/*
 * Copyright 2021 The Backstage Authors
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

import { Container, Header } from '@backstage/ui';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { SortView } from '../SortView';
import { About } from '../About';

/** @public */
export type HomePageProps = {
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
};

export const HomePage = (props: HomePageProps) => {
  const { title, subtitle, fullWidth, fullHeight } = props;
  const basePath = useResolvedPath('.').pathname.replace(/\/$/, '');

  return (
    <>
      <Header
        title={title || 'Bazaar'}
        description={subtitle || 'Marketplace for inner source projects'}
        tabs={[
          { id: 'home', label: 'Home', href: basePath || '/' },
          { id: 'about', label: 'About', href: `${basePath}/about` },
        ]}
      />
      <Container>
        <Routes>
          <Route
            path="/"
            element={<SortView fullWidth={fullWidth} fullHeight={fullHeight} />}
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </Container>
    </>
  );
};
