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

import { useParams, useSearchParams } from 'react-router-dom';
import { parseEntityRef } from '@backstage/catalog-model';
import { TechDocsEditorPage } from '@backstage-community/plugin-techdocs-editor-react';

/**
 * Standalone editor page content. Resolves the target entity from the route
 * params (`/:namespace/:kind/:name`) and the optional initial file from the
 * `?file` search param, then renders the shared `TechDocsEditorPage`.
 *
 * Shared between the classic routable extension and the new frontend system
 * page extension.
 *
 * @public
 */
export function EditorPageContent() {
  const [searchParams] = useSearchParams();
  const initialPath = searchParams.get('file') ?? undefined;

  const { namespace, kind, name } = useParams<{
    namespace: string;
    kind: string;
    name: string;
  }>();

  if (!namespace || !kind || !name) {
    return null;
  }

  const entityRef = parseEntityRef(`${kind}:${namespace}/${name}`);
  return <TechDocsEditorPage entityRef={entityRef} initialPath={initialPath} />;
}
