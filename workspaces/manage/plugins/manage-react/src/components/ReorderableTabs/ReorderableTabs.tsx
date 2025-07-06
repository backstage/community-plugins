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
import { CSSProperties, useCallback, useMemo } from 'react';

import { useTheme } from '@mui/styles';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

/**
 * Props for {@link ReorderableTabs}
 *
 * @public
 */
export interface ReorderableTabsProps {
  tabs: { id: string; title: string }[];
  onChange?: (idOrder: string[]) => void;
}

/**
 * Generic component for reordering tabs (or any other similar set of items)
 * using drag-and-drop.
 *
 * @public
 */
export function ManageReorderableTabs(props: ReorderableTabsProps) {
  const { tabs, onChange } = props;

  const sensors = useSensors(useSensor(PointerSensor));

  const items = useMemo(() => {
    return tabs.map(tab => tab.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.map(tab => tab.id).join(' $ ')]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        const newItems = arrayMove(items, oldIndex, newIndex);

        onChange?.(newItems);
      }
    },
    [onChange, items],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <ButtonGroup variant="outlined">
          {tabs.map(({ id, title }) => (
            <ReorderableTab key={id} id={id} title={title} />
          ))}
        </ButtonGroup>
      </SortableContext>
    </DndContext>
  );
}

function ReorderableTab({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const { typography } = useTheme();

  if (transform) {
    transform.scaleX = 1;
    transform.scaleY = 1;
  }

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    fontWeight: 'bold',
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
  };

  return (
    <Button ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {title}
    </Button>
  );
}
