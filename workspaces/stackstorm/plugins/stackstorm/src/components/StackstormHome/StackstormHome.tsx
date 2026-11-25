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
import IconButton from '@material-ui/core/IconButton';
import { Container, Header } from '@backstage/ui';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
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

export const StackstormHome = (props: StackstormHomeProps) => {
  const basePath = useResolvedPath('.').pathname.replace(/\/$/, '');

  return (
    <>
      <Header
        title={props.title || 'Welcome to StackStorm!'}
        description={props.subtitle || 'Event-driven automation'}
        metadata={[{ label: 'Lifecycle', value: 'Alpha' }]}
        customActions={
          props.headerButtons ? (
            props.headerButtons.map((headerButton, idx) => (
              <Fragment key={idx}>{headerButton}</Fragment>
            ))
          ) : (
            <IconButton aria-label="Docs" href="https://docs.stackstorm.com/">
              <LibraryBooks />
            </IconButton>
          )
        }
        tabs={[
          { id: 'history', label: 'Executions', href: `${basePath}/history` },
          { id: 'packs', label: 'Packs', href: `${basePath}/packs` },
          { id: 'actions', label: 'Actions', href: `${basePath}/actions` },
        ]}
      />
      <Container>
        <Routes>
          <Route path="/" element={<Navigate to="history" replace />} />
          <Route path="/history" element={<ExecutionsTable />} />
          <Route path="/packs" element={<PacksTable />} />
          <Route path="/actions" element={<ActionsList />} />
        </Routes>
      </Container>
    </>
  );
};
