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
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import type { Entity } from '@backstage/catalog-model';
import { MdxContent } from '../MdxContent';
import { useMdxCardData } from '../../hooks/useMdxCardData';
import type { MdxCardProps } from '../../types';

/**
 * Props for {@link MdxCardContent}.
 *
 * @public
 */
export type MdxCardContentProps = MdxCardProps & {
  /** Entity exposed to the template and to data fetcher URLs. */
  entity?: Entity;
};

/**
 * Loads data fetcher responses and renders the MDX template without a card
 * wrapper.
 *
 * @public
 */
export const MdxCardContent = ({
  template,
  dataFetchers,
  components,
  entity,
}: MdxCardContentProps) => {
  const { value, loading, error } = useMdxCardData({ dataFetchers, entity });

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }
  return (
    <MdxContent
      template={template}
      data={value ?? {}}
      components={components}
    />
  );
};
