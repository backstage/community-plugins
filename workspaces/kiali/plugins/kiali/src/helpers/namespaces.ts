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
import { KIALI_NAMESPACE } from '@backstage-community/plugin-kiali-common';
import { Entity } from '@backstage/catalog-model';

export const nsEqual = (ns: string[], ns2: string[]): boolean => {
  return (
    ns.length === ns2.length &&
    ns.every((value: any, index: number) => value === ns2[index])
  );
};

export const getEntityNs = (entity: Entity): string[] => {
  const annotations = entity?.metadata?.annotations || undefined;
  if (!annotations) {
    return [];
  }
  const ant = decodeURIComponent(annotations[KIALI_NAMESPACE]);
  if (ant) {
    return ant.split(',');
  }
  return [];
};
