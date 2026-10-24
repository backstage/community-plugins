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
import { Button, ButtonIcon, Flex, Text } from '@backstage/ui';
import {
  GuidedTourStep,
  isGuidedTourElementLoader,
  MarkdownText,
  useGuidedTourText,
} from '@backstage-community/plugin-guided-tours-react';
import { RiCloseLine } from '@remixicon/react';
import { JSX } from 'react';
import { Heading } from 'react-aria-components';
import { guidedTourTranslationRef } from '../../translation';
import { StepContentBoundary, StepContentError } from './StepContentBoundary';

export interface StepCardProps {
  tourTitle: string;
  step: GuidedTourStep;
  /** The resolved element of a step whose content is a loader. */
  element?: JSX.Element;
  /** Why the content could not be loaded; shown instead of the content. */
  error?: Error;
  stepIndex: number;
  stepCount: number;
  onPrevious(): void;
  onNext(): void;
  onDismiss(): void;
}

/** The inside of a step: title, markdown body, counter and buttons. */
export function StepCard(props: StepCardProps) {
  const {
    tourTitle,
    step,
    element,
    error,
    stepIndex,
    stepCount,
    onPrevious,
    onNext,
    onDismiss,
  } = props;
  const { t } = useTranslationRef(guidedTourTranslationRef);
  const isLast = stepIndex >= stepCount - 1;
  const clickToAdvance = step.advanceOn === 'click';
  const title = useGuidedTourText(step.title);
  // narrow with the type guard so the hook only sees text content
  const textContent = isGuidedTourElementLoader(step.content)
    ? undefined
    : step.content;
  const text = useGuidedTourText(textContent);

  return (
    <Flex direction="column" gap="3" style={{ width: '100%' }}>
      <Flex justify="between" align="start" gap="2">
        <Flex direction="column" gap="1">
          <Text variant="body-x-small" color="secondary">
            {tourTitle}
          </Text>
          <Heading slot="title" style={{ margin: 0 }}>
            <Text as="span" variant="title-small">
              {title ?? tourTitle}
            </Text>
          </Heading>
        </Flex>
        <ButtonIcon
          size="small"
          variant="tertiary"
          icon={<RiCloseLine />}
          aria-label={t('overlay.close')}
          onPress={onDismiss}
        />
      </Flex>
      {error ? (
        <StepContentError error={error} />
      ) : (
        <StepContentBoundary key={step.id}>
          {element ?? <MarkdownText content={text ?? ''} />}
        </StepContentBoundary>
      )}
      {clickToAdvance && (
        <Text variant="body-small" color="secondary">
          {t('overlay.clickToContinue')}
        </Text>
      )}
      <Flex justify="between" align="center" gap="2">
        <Text variant="body-x-small" color="secondary">
          {t('overlay.counter', {
            current: String(stepIndex + 1),
            total: String(stepCount),
          })}
        </Text>
        <Flex gap="2">
          <Button
            size="small"
            variant="secondary"
            isDisabled={stepIndex === 0}
            onPress={onPrevious}
          >
            {t('overlay.previous')}
          </Button>
          <Button size="small" variant="primary" onPress={onNext}>
            {isLast ? t('overlay.done') : t('overlay.next')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
