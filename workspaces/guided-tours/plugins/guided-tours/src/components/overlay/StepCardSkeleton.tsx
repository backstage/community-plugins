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
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { ButtonIcon, Flex, Skeleton } from '@backstage/ui';
import { RiCloseLine } from '@remixicon/react';
import { guidedTourTranslationRef } from '../../translations';
import { CircularProgress } from './CircularProgress';

export interface StepCardSkeletonProps {
  /**
   * How much of the wait for the target has passed, between 0 and 1. Omit
   * while content is loading, which has no deadline.
   */
  progress?: number;
  onDismiss(): void;
}

/**
 * Placeholder with the layout of a step card, shown while the target or the
 * content of a step is still loading: tour and step title, a progress ring
 * in place of the text that fills up until the target times out, and the
 * Previous and Next buttons. The close button works.
 */
export function StepCardSkeleton(props: StepCardSkeletonProps) {
  const { progress, onDismiss } = props;
  const { t } = useTranslationRef(guidedTourTranslationRef);

  return (
    <Flex
      direction="column"
      gap="3"
      style={{ width: '100%' }}
      aria-busy="true"
      aria-label={t('overlay.loading')}
    >
      <Flex justify="between" align="start" gap="2">
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Skeleton width="30%" height={12} />
          <Skeleton width="60%" height={20} />
        </Flex>
        <ButtonIcon
          size="small"
          variant="tertiary"
          icon={<RiCloseLine />}
          aria-label={t('overlay.close')}
          onPress={onDismiss}
        />
      </Flex>
      <Flex justify="center" align="center" style={{ minHeight: 48 }}>
        <CircularProgress value={progress} aria-label={t('overlay.loading')} />
      </Flex>
      <Flex justify="between" align="center" gap="2">
        <Skeleton width={72} height={12} />
        <Flex gap="2">
          <Skeleton width={76} height={28} rounded />
          <Skeleton width={60} height={28} rounded />
        </Flex>
      </Flex>
    </Flex>
  );
}
