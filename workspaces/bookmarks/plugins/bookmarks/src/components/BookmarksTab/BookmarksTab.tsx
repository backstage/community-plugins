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

import { useEntity } from '@backstage/plugin-catalog-react';
import { BookmarksViewer } from '../BookmarksViewer/BookmarksViewer';
import { EmptyState } from '@backstage/core-components';
import { UrlTree } from '../../api/types';
import { useTranslation } from '../../hooks/useTranslation';

/** Recursively check if a given object conforms to the UrlTree type */
const validateUrlTree = (tree: unknown): tree is UrlTree => {
  return (
    typeof tree === 'object' &&
    tree !== null &&
    !Array.isArray(tree) &&
    Object.values(tree).every(
      value => typeof value === 'string' || validateUrlTree(value),
    )
  );
};

export const BookmarksTab = () => {
  const {
    entity: { spec: { bookmarks = {} } = {} },
  } = useEntity();

  const { t } = useTranslation();

  if (!bookmarks || Object.keys(bookmarks).length === 0) {
    return (
      <EmptyState
        title={t('bookmarksTab.notFound.title')}
        description={t('bookmarksTab.notFound.description')}
        missing="data"
      />
    );
  }

  if (!validateUrlTree(bookmarks)) {
    return (
      <EmptyState
        title={t('bookmarksTab.invalid.title')}
        description={t('bookmarksTab.invalid.description')}
        missing="data"
      />
    );
  }

  return <BookmarksViewer tree={bookmarks} />;
};
