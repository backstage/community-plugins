/*
 * Copyright 2024 The Backstage Authors
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

import {
  useState,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { MenuItem, Popover } from '@backstage/ui';
import { Menu } from 'react-aria-components';
import { techInsightsApiRef } from '../../api';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import styles from './ResultLinksMenu.module.css';

/**
 * ResultLinksMenu setMenu receiver.
 *
 * This object contains an {@link ResultLinksMenuInfo.open | open} function,
 * which can be used to open the popup menu. It closes automatically on
 * click-away.
 *
 * @public
 */
export type ResultLinksMenuInfo = {
  /**
   * Call this function to open the popup menu. The element argument should be
   * an element which is used as an anchor for the menu - where to display it.
   */
  open: (element: Element) => void;
};

/**
 * A component that renders a popup menu with links related to a check result.
 *
 * @public
 */
export const ResultLinksMenu = (
  props: PropsWithChildren<{
    result: CheckResult;
    entity?: Entity;
    setMenu(opener: ResultLinksMenuInfo | undefined): void;
  }>,
) => {
  const { result, entity, setMenu } = props;
  const api = useApi(techInsightsApiRef);

  const links = useMemo(
    () =>
      entity
        ? api.getLinksForEntity(result, entity, {
            includeStaticLinks: true,
          })
        : result.check.links ?? [],
    [api, result, entity],
  );

  const menuId = `menu-${result.check.id}-${
    entity ? stringifyEntityRef(entity) : 'unknown'
  }`;

  const anchorRef = useRef<Element | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (links.length === 0) {
      setMenu(undefined);
      return;
    }
    setMenu({
      open: (elem: Element) => {
        anchorRef.current = elem;
        setIsOpen(true);
      },
    });
  }, [setMenu, links]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  if (links.length === 0) {
    return null;
  }

  /*
   * The anchor is only known when `open(element)` is called, so the menu
   * cannot be a child of a BUI `MenuTrigger`. BUI's `Menu` only opens inside
   * one, hence the react-aria `Menu` directly within a controlled `Popover`.
   */
  return (
    <Popover
      triggerRef={anchorRef}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom end"
      hideArrow
    >
      <Menu
        id={menuId}
        aria-label={`Links for ${result.check.name}`}
        className={styles.menu}
        // react-aria focus strategy, not the DOM attribute: menus move focus to the first item on open
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus="first"
        onClose={handleClose}
      >
        {links.map((link, i) => (
          <MenuItem key={`${i}-${link.url}`} href={link.url}>
            {link.title}
          </MenuItem>
        ))}
      </Menu>
    </Popover>
  );
};
