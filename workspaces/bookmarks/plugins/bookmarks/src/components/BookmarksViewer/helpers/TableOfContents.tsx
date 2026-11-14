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

import { Button } from '@backstage/ui';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { UrlTree } from '../../../types';
import { PATH_SEPARATOR } from '../../../consts/consts';
import {
  FlattenedNode,
  useUnorderedFlattenedTree,
} from '../../../hooks/useFlattenTree';
import { TEST_IDS } from '../../../consts/testids';
import styles from './TableOfContents.module.css';

type TreeItemsProps = {
  /** the tree (or subtree) whose entries are rendered */
  subTree: UrlTree;
  /** keys leading to this subtree */
  path?: string[];
  selectedId: string;
  expandedItems: string[];
  onToggle: (itemId: string) => void;
  onSelect: (itemId: string) => void;
};

/** Recursively render a portion of a UrlTree */
const TreeItems = ({
  subTree,
  path = [],
  selectedId,
  expandedItems,
  onToggle,
  onSelect,
}: TreeItemsProps) => (
  <>
    {Object.keys(subTree).map(treeKey => {
      const value = subTree[treeKey];
      const currentPath = [...path, treeKey];
      const itemId = currentPath.join(PATH_SEPARATOR);

      if (typeof value === 'string') {
        const isSelected = itemId === selectedId;
        return (
          <li key={treeKey} role="treeitem" aria-selected={isSelected}>
            <Button
              variant="tertiary"
              size="small"
              className={`${styles.item} ${styles.leaf} ${
                isSelected ? styles.selected : ''
              }`}
              onPress={() => onSelect(itemId)}
              data-testid={TEST_IDS.TableOfContents.leaf}
            >
              {treeKey}
            </Button>
          </li>
        );
      }

      // if the value is not a string this must be a subtree
      const isExpanded = expandedItems.includes(itemId);
      return (
        <li
          key={treeKey}
          role="treeitem"
          aria-expanded={isExpanded}
          aria-selected={false}
        >
          <Button
            variant="tertiary"
            size="small"
            className={styles.item}
            iconStart={
              isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />
            }
            onPress={() => onToggle(itemId)}
          >
            {treeKey}
          </Button>
          {isExpanded && (
            <ul role="group" className={styles.group}>
              <TreeItems
                subTree={value}
                path={currentPath}
                selectedId={selectedId}
                expandedItems={expandedItems}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            </ul>
          )}
        </li>
      );
    })}
  </>
);

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
    <ul
      role="tree"
      className={styles.tree}
      data-testid={TEST_IDS.TableOfContents.wrapper}
    >
      <TreeItems
        subTree={tree}
        selectedId={pathKey}
        expandedItems={expandedItems}
        onToggle={itemId =>
          setExpandedItems(prev =>
            prev.includes(itemId)
              ? prev.filter(id => id !== itemId)
              : [...prev, itemId],
          )
        }
        onSelect={itemId => {
          if (!urlLookup[itemId]) return;
          setCurrentNode({ value: urlLookup[itemId], key: itemId });
        }}
      />
    </ul>
  );
};
