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
import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const nexusRepositoryManagerMessages = {
  table: {
    title: 'Nexus Repository Manager: {{title}}',
    searchPlaceholder: 'Filter',
    labelRowsSelect: 'Rows',
    columns: {
      version: 'Version',
      artifact: 'Artifact',
      repositoryType: 'Repository Type',
      checksum: 'Checksum',
      modified: 'Modified',
      size: 'Size',
    },
    emptyValue: 'N/A',
    emptyContent: {
      message: 'No data was added yet,',
      linkText: 'learn how to add data',
    },
  },
  entityContent: {
    title: 'Build Artifacts',
  },
};

/**
 * Translation reference for Nexus Repository Manager plugin
 * @public
 */
export const nexusRepositoryManagerTranslationRef = createTranslationRef({
  id: 'plugin.nexus-repository-manager',
  messages: nexusRepositoryManagerMessages,
});
