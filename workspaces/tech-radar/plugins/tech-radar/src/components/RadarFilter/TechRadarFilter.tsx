/*
 * Copyright 2026 The Backstage Authors
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
import { useContext, useMemo } from 'react';

import { Box, Button, Flex, Text } from '@backstage/ui';
import { useComponents } from './../hooks/useComponents';
import { ChevronDown } from 'lucide-react';
import { RadarFilterContext } from '../RadarFilterContext';
import { Quadrant, Ring } from '../../types';

import styles from './TechRadarFilter.module.css';

type Props = Readonly<{
  className?: string;
  quadrants: Quadrant[];
  rings: Ring[];
}>;

export const TechRadarFilter = ({ className, quadrants, rings }: Props) => {
  const { MenuAutocompleteListbox, MenuListBoxItem, MenuTrigger } =
    useComponents();

  const { handleSelectedBlip, selectedFilters, setSelectedFilters } =
    useContext(RadarFilterContext);

  const options = useMemo(() => {
    const ringOptions = rings.map(item => ({
      category: 'Ring',
      label: item.name,
      value: `ring:${item.id}`,
    }));

    const quadrantsOptions = quadrants.map(item => ({
      category: 'Quadrant',
      label: item.name,
      value: `quadrant:${item.id}`,
    }));

    return [...ringOptions, ...quadrantsOptions];
  }, [rings, quadrants]);

  const triggerLabel = useMemo(() => {
    if (selectedFilters.length === 0) {
      return (
        <Text as="span" className={styles.triggerLabelEmpty}>
          Select filter
        </Text>
      );
    }

    if (selectedFilters.length === 1) {
      return options.find(option => option.value === selectedFilters[0])?.label;
    }

    return `${selectedFilters.length} selected`;
  }, [options, selectedFilters]);

  return (
    <div className={className}>
      <MenuTrigger>
        <Button
          aria-label="Filter"
          variant="tertiary"
          className={styles.filterButton}
        >
          {triggerLabel}
          <ChevronDown size={12} className={styles.triggerLabelEmpty} />
        </Button>
        <MenuAutocompleteListbox
          className="with-custom-css"
          onSelectionChange={keys => {
            handleSelectedBlip(undefined);
            setSelectedFilters(Array.from(keys).map(key => String(key)));
          }}
          selectedKeys={selectedFilters}
          selectionMode="multiple"
        >
          {options.map(option => (
            <MenuListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
              className={styles.menuItem}
            >
              <Box className={styles.optionLabel}>{option.label}</Box>
              <Text as="span" className={styles.optionCategory}>
                {option.category}
              </Text>
            </MenuListBoxItem>
          ))}
        </MenuAutocompleteListbox>
      </MenuTrigger>
    </div>
  );
};
