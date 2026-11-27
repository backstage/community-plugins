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

import { RiArrowRightSLine } from '@remixicon/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Collection,
  Tree,
  TreeItem,
  TreeItemContent,
} from 'react-aria-components';
import { UrlTree } from '../../../types';
import { PATH_SEPARATOR } from '../../../consts/consts';
import { FlattenedNode } from '../../../hooks/useFlattenTree';
import { TEST_IDS } from '../../../consts/testids';
import { useTranslation } from '../../../hooks/useTranslation';

import styles from './TableOfContents.module.css';

/** A row in the table of contents, derived from a UrlTree */
interface TocItem {
  /** stable id: the keys leading to this item, joined by PATH_SEPARATOR */
  id: string;
  /** label shown to the user */
  title: string;
  /** link target of leaves, absent on folders */
  url?: string;
  /** child rows, absent on leaves */
  children?: TocItem[];
}

/** Convert a UrlTree into the item shape used by the Tree dynamic collection API */
const toTocItems = (subTree: UrlTree, path: string[] = []): TocItem[] =>
  Object.entries(subTree).map(([treeKey, value]) => {
    const id = [...path, treeKey].join(PATH_SEPARATOR);
    return typeof value === 'string'
      ? { id, title: treeKey, url: value }
      : { id, title: treeKey, children: toTocItems(value, [...path, treeKey]) };
  });

/** Recursively render a TocItem as a TreeItem */
const renderItem = (
  item: TocItem,
  currentKey: string,
  onNavigate: (itemId: string, value: string) => void,
  onToggle: (itemId: string) => void,
) => {
  const { id, title, url } = item;

  if (url !== undefined) {
    return (
      <TreeItem
        textValue={title}
        onAction={() => onNavigate(id, url)}
        data-testid={TEST_IDS.TableOfContents.leaf}
        data-current={id === currentKey || undefined}
        className={`${styles.item} ${styles.leaf} ${id === currentKey ? styles.selected : ''}`}
        style={({ level }) => ({
          marginInlineStart: `calc((${level} - 1) * var(--bui-space-4))`,
        })}
      >
        <TreeItemContent>
          <span
            className={styles.treeLabel}
            aria-current={id === currentKey ? 'true' : undefined}
          >
            {title}
          </span>
        </TreeItemContent>
      </TreeItem>
    );
  }

  // items without a url are folders
  return (
    <TreeItem
      textValue={title}
      onAction={() => onToggle(id)}
      data-current={id === currentKey || undefined}
      className={styles.item}
      style={({ level }) => ({
        marginInlineStart: `calc((${level} - 1) * var(--bui-space-4))`,
      })}
    >
      <TreeItemContent>
        <Button slot="chevron" className={styles.chevron}>
          <RiArrowRightSLine
            className={styles.chevronIcon}
            aria-hidden="true"
          />
        </Button>
        <span
          className={styles.treeLabel}
          aria-current={id === currentKey ? 'true' : undefined}
        >
          {title}
        </span>
      </TreeItemContent>
      <Collection items={item.children}>
        {childItem => renderItem(childItem, currentKey, onNavigate, onToggle)}
      </Collection>
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
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const items = useMemo(() => toTocItems(tree), [tree]);

  const toggleItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // auto expand items when the current path changes
  useEffect(() => {
    const parts = pathKey.split(PATH_SEPARATOR);
    const parents = parts.map((_, i) =>
      parts.slice(0, i + 1).join(PATH_SEPARATOR),
    );
    setExpandedItems(prev => new Set([...prev, ...parents]));
  }, [pathKey]);

  return (
    <Tree
      aria-label={t('bookmarkViewer.tableOfContents')}
      className={styles.tree}
      items={items}
      dependencies={[pathKey]}
      selectionMode="none"
      expandedKeys={expandedItems}
      onExpandedChange={keys =>
        setExpandedItems(new Set([...keys].map(String)))
      }
      data-testid={TEST_IDS.TableOfContents.wrapper}
    >
      {item =>
        renderItem(
          item,
          pathKey,
          (itemId, value) => setCurrentNode({ value, key: itemId }),
          toggleItem,
        )
      }
    </Tree>
  );
};
