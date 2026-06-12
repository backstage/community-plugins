/*
 * Copyright 2025 The Backstage Authors
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

import EditIcon from '@material-ui/icons/Edit';
import { Button, Tooltip } from '@material-ui/core';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
  useTechDocsReaderPage,
} from '@backstage/plugin-techdocs-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { editorRouteRef } from '../routes';
import { parseEntityRef } from '@backstage/catalog-model';

/**
 * TechDocs Subheader Addon that adds an "Edit this page" button to the
 * documentation reader, linking to the in-app editor.
 *
 * Add this to TechDocs in your `App.tsx`:
 *
 * ```tsx
 * <TechDocsReaderPage>
 *   <TechDocsEditPageAddon />
 *   ...
 * </TechDocsReaderPage>
 * ```
 *
 * @public
 */
export const TechDocsEditPageAddon = createTechDocsAddonExtension({
  name: 'EditPage',
  location: TechDocsAddonLocations.Subheader,
  component: TechDocsEditPageAddonComponent,
});

function TechDocsEditPageAddonComponent() {
  const { entityRef, shadowRoot } = useTechDocsReaderPage();
  const editorRoute = useRouteRef(editorRouteRef);

  if (!entityRef || !editorRoute) return null;

  const ref = parseEntityRef(entityRef);
  const editorPath = editorRoute({
    namespace: ref.namespace ?? 'default',
    kind: ref.kind.toLocaleLowerCase('en-US'),
    name: ref.name,
  });

  // Detect the current doc path from the reader DOM if possible
  const canonicalUrl = shadowRoot
    ?.querySelector('link[rel="canonical"]')
    ?.getAttribute('href');
  const docFile = canonicalUrl
    ? canonicalUrl.split('/').pop()?.replace('.html', '.md') ?? ''
    : '';
  const editorUrl = docFile
    ? `${editorPath}?file=${encodeURIComponent(docFile)}`
    : editorPath;

  return (
    <Tooltip title="Edit this documentation page">
      <Button
        size="small"
        variant="outlined"
        color="primary"
        startIcon={<EditIcon fontSize="small" />}
        href={editorUrl}
      >
        Edit this page
      </Button>
    </Tooltip>
  );
}
