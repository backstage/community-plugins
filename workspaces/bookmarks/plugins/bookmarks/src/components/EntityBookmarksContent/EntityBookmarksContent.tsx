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

import { BookmarksViewer } from '../BookmarksViewer/BookmarksViewer';
import { EmptyState } from '@backstage/core-components';
import { useTranslation } from '../../hooks/useTranslation';
import { USE_TREE_ERROR, useTree } from '../../hooks/useTree';

export const EntityBookmarksContent = () => {
  const { tree, error } = useTree();
  const { t } = useTranslation();

  switch (error) {
    case USE_TREE_ERROR.INVALID:
      return (
        <EmptyState
          title={t('entityBookmarksContent.invalid.title')}
          description={t('entityBookmarksContent.invalid.description')}
          missing="data"
        />
      );

    case USE_TREE_ERROR.NOT_FOUND:
      return (
        <EmptyState
          title={t('entityBookmarksContent.notFound.title')}
          description={t('entityBookmarksContent.notFound.description')}
          missing="data"
        />
      );

    default:
      return <BookmarksViewer tree={tree} />;
  }
};
