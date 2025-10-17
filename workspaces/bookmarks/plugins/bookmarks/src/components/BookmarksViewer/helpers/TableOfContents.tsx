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

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useEffect, useState } from 'react';
import { UrlTree } from '../../../types';
import { PATH_SEPARATOR } from '../../../consts/consts';
import {
  FlattenedNode,
  useUnorderedFlattenedTree,
} from '../../../hooks/useFlattenTree';
import { TEST_IDS } from '../../../consts/testids';

/** Recursively render a portion of a UrlTree */
const RecursiveTreeItem = ({
  treeKey,
  subTree,
  path = [],
}: {
  treeKey: string;
  subTree: UrlTree;
  path?: string[];
}) => {
  const value = subTree[treeKey];
  const currentPath = [...path, treeKey];
  const itemId = currentPath.join(PATH_SEPARATOR);

  if (typeof value === 'string') {
    return (
      <TreeItem
        itemId={itemId}
        label={treeKey}
        data-testid={TEST_IDS.TableOfContents.leaf}
      />
    );
  }

  // if the value is not a string this must be a subtree
  return (
    <TreeItem itemId={itemId} label={treeKey}>
      {Object.keys(value).map(subKey => (
        <RecursiveTreeItem
          key={subKey}
          treeKey={subKey}
          subTree={value}
          path={currentPath}
        />
      ))}
    </TreeItem>
  );
};

/** Component to render a table of contents from a UrlTree */
export const TableOfContents = ({
  tree,
  currentNode: { key: pathKey },
  setCurrentNode,
}: {
  tree: UrlTree;
  currentNode: FlattenedNode;
  setCurrentNode: (url: FlattenedNode) => void;
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const urlLookup = useUnorderedFlattenedTree(tree);

  // auto expand items when the current path changes
  useEffect(() => {
    const parts = pathKey.split(PATH_SEPARATOR);
    const parents = parts.map((_, i) =>
      parts.slice(0, i + 1).join(PATH_SEPARATOR),
    );
    setExpandedItems(prev => Array.from(new Set([...prev, ...parents])));
  }, [pathKey]);

  return (
    <SimpleTreeView
      selectedItems={pathKey}
      onSelectedItemsChange={(_, itemId: string | null) => {
        if (!itemId || !urlLookup[itemId]) return;
        setCurrentNode({ value: urlLookup[itemId], key: itemId });
      }}
      expandedItems={expandedItems}
      onItemExpansionToggle={(_, itemId: string) => {
        setExpandedItems(prev =>
          prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId],
        );
      }}
      sx={{
        color: theme => theme.palette.text.primary,
        flexGrow: 1,
      }}
      data-testid={TEST_IDS.TableOfContents.wrapper}
    >
      {Object.keys(tree).map(key => (
        <RecursiveTreeItem key={key} treeKey={key} subTree={tree} />
      ))}
    </SimpleTreeView>
  );
};
