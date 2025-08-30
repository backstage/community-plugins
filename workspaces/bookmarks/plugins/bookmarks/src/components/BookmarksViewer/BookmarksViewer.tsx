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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import { ReactNode, memo, useMemo, useState } from 'react';
import { UrlTree } from '../../types';
import { TEST_IDS } from '../../consts/testids';
import { FlattenedNode, useFlattenTree } from '../../hooks/useFlattenTree';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useTranslation } from '../../hooks/useTranslation';
import { BookmarkDesktopView } from './helpers/BookmarkDesktopView';
import { BookmarkMobileView } from './helpers/BookmarkMobileView';
import { BookmarkViewerFrame } from './helpers/BookmarkViewerFrame';
import { NavButton } from './helpers/NavButton';
import { TableOfContents } from './helpers/TableOfContents';
import { useCustomProtocol } from '../../hooks/useCustomProtocol';

/** Props for layout components */
export type BookmarkViewerLayoutProps = {
  toc: ReactNode;
  previousButton: ReactNode;
  viewer: ReactNode;
  openInNewTab: ReactNode;
  nextButton: ReactNode;
};

export const BookmarksViewer = memo(({ tree }: { tree: UrlTree }) => {
  const flattenedTree = useFlattenTree(tree);
  const [currentNode, setCurrentNode] = useState<FlattenedNode>(
    flattenedTree[0],
  );
  const { t } = useTranslation();

  const { src, href } = useCustomProtocol(currentNode.value);

  const isDesktop = useIsDesktop();
  const View = isDesktop ? BookmarkDesktopView : BookmarkMobileView;

  const currentFlattenedIndex = useMemo(() => {
    return flattenedTree.findIndex(url => url.key === currentNode.key);
  }, [flattenedTree, currentNode]);

  const previousButton = useMemo(() => {
    const previousUrl = flattenedTree[currentFlattenedIndex - 1];

    return previousUrl ? (
      <NavButton
        direction="previous"
        treeKey={previousUrl.key}
        onClick={() => {
          setCurrentNode(previousUrl);
        }}
      />
    ) : null;
  }, [flattenedTree, setCurrentNode, currentFlattenedIndex]);

  const nextButton = useMemo(() => {
    const nextUrl = flattenedTree[currentFlattenedIndex + 1];

    return nextUrl ? (
      <NavButton
        direction="next"
        treeKey={nextUrl.key}
        onClick={() => {
          setCurrentNode(nextUrl);
        }}
      />
    ) : null;
  }, [flattenedTree, setCurrentNode, currentFlattenedIndex]);

  const viewer = <BookmarkViewerFrame src={src} />;

  const toc = (
    <TableOfContents
      tree={tree}
      currentNode={currentNode}
      setCurrentNode={setCurrentNode}
    />
  );

  const openInNewTab = (
    <Button
      href={href}
      target="_blank"
      rel="noopener"
      sx={{ mb: 2 }}
      endIcon={<ArrowForwardIcon />}
      data-testid={TEST_IDS.BookmarksViewer.newTab}
    >
      {t('bookmarkViewer.newTab')}
    </Button>
  );

  return (
    <View
      toc={toc}
      previousButton={previousButton}
      viewer={viewer}
      openInNewTab={openInNewTab}
      nextButton={nextButton}
    />
  );
});
