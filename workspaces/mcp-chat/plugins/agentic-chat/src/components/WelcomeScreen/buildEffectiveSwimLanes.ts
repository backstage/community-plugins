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
import type {
  SwimLane,
  SwimLaneCard,
  Workflow,
  QuickAction,
} from '../../types';

interface BuildSwimLanesInput {
  readonly configSwimLanes?: readonly SwimLane[];
  readonly workflows: readonly Workflow[];
  readonly quickActions: readonly QuickAction[];
  readonly fallbackColor: string;
}

/**
 * Resolves the effective swim lanes to display on the welcome screen.
 *
 * Priority:
 *  1. Config swim lanes with cards -> use directly (fully admin-driven)
 *  2. Fallback: group workflows/quickActions by category, apply config styling
 */
export function buildEffectiveSwimLanes({
  configSwimLanes,
  workflows,
  quickActions,
  fallbackColor,
}: BuildSwimLanesInput): SwimLane[] {
  const configHasCards = configSwimLanes?.some(
    sl => sl.cards && sl.cards.length > 0,
  );

  if (configHasCards && configSwimLanes) {
    return configSwimLanes
      .filter(sl => sl.cards && sl.cards.length > 0)
      .map((sl, i) => ({
        ...sl,
        color: sl.color || fallbackColor,
        order: sl.order ?? i + 1,
      }))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  const categoryMap = new Map<string, SwimLaneCard[]>();

  for (const w of workflows) {
    const cat = w.category || 'General';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push({
      title: w.name,
      description: w.description,
      prompt: w.steps[0]?.prompt || '',
      icon: w.icon,
      comingSoon: w.comingSoon,
      comingSoonLabel: w.comingSoonLabel,
    });
  }

  for (const a of quickActions) {
    const cat = a.category || 'General';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push({
      title: a.title,
      description: a.description,
      prompt: a.prompt,
      icon: a.icon,
      comingSoon: a.comingSoon,
      comingSoonLabel: a.comingSoonLabel,
    });
  }

  const lanes: SwimLane[] = [];
  let orderIndex = 1;

  categoryMap.forEach((cards, category) => {
    const categoryId = category.toLowerCase().replace(/\s+/g, '-');
    const configLane = configSwimLanes?.find(
      sl =>
        sl.id === categoryId ||
        sl.title.toLowerCase() === category.toLowerCase(),
    );

    lanes.push({
      id: configLane?.id || categoryId,
      title: configLane?.title || category,
      description: configLane?.description || '',
      icon: configLane?.icon || 'build',
      color: configLane?.color || fallbackColor,
      order:
        configLane?.order ?? (configLane ? orderIndex++ : 999 + orderIndex++),
      cards,
    });
  });

  return lanes.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}
