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
import { useApi } from '@backstage/frontend-plugin-api';
import { Dialog, DialogBody, Popover, Skeleton } from '@backstage/ui';
import {
  GuidedTour,
  guidedTourApiRef,
  guidedTourTargetSelector,
} from '@internal/backstage-plugin-guided-tour-react';
import { useEffect, useMemo } from 'react';
import { Dialog as AriaDialog } from 'react-aria-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spotlight } from './Spotlight';
import { StepCard } from './StepCard';
import { useElementRect, useTargetElement } from './useTargetElement';

export interface ActiveStepProps {
  tour: GuidedTour;
  stepIndex: number;
}

/**
 * Renders the active step: navigates to its route, waits for its target,
 * draws the spotlight and anchors the card to the element (or centers it).
 */
export function ActiveStep(props: ActiveStepProps) {
  const { tour, stepIndex } = props;
  const step = tour.steps[stepIndex];
  const api = useApi(guidedTourApiRef);
  const navigate = useNavigate();
  const location = useLocation();

  const onRoute = !step.route || location.pathname === step.route;
  useEffect(() => {
    if (!onRoute && step.route) {
      navigate(step.route);
    }
    // only when the step changes, not on every location update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.id, stepIndex]);

  const selector = step.target
    ? guidedTourTargetSelector(step.target)
    : undefined;
  const { element, status } = useTargetElement(selector, {
    enabled: onRoute,
    timeoutMs: step.targetTimeoutMs,
    resetKey: `${tour.id}:${stepIndex}`,
  });
  const rect = useElementRect(element);

  // skip steps whose target never showed up, when configured so
  useEffect(() => {
    if (status === 'missing' && step.onMissingTarget === 'skip') {
      api.next();
    }
  }, [status, step.onMissingTarget, api]);

  // click-to-advance: let the click reach the element, then move on
  useEffect(() => {
    if (!element || step.advanceOn !== 'click') return undefined;
    const onClick = () => api.next();
    element.addEventListener('click', onClick, { capture: true });
    return () =>
      element.removeEventListener('click', onClick, { capture: true });
  }, [element, step.advanceOn, api]);

  // Escape closes the tour. The overlays' own open state is never used for
  // that: react-aria also reports "closed" when focus leaves a popover, which
  // happens for a moment on every step change.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        api.dismiss();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [api]);

  const triggerRef = useMemo(() => ({ current: element }), [element]);

  const card = (
    <StepCard
      tourTitle={tour.title}
      step={step}
      stepIndex={stepIndex}
      stepCount={tour.steps.length}
      onPrevious={() => api.previous()}
      onNext={() => api.next()}
      onDismiss={() => api.dismiss()}
    />
  );

  // The BUI Dialog brings its own backdrop, so the spotlight is only used
  // for anchored steps.
  if (status === 'resolving') {
    return (
      <Dialog key="resolving" isOpen isDismissable={false} width={360}>
        <DialogBody>
          <Skeleton width="100%" height={80} />
        </DialogBody>
      </Dialog>
    );
  }

  if (status === 'found' && element) {
    return (
      <>
        <Spotlight rect={rect} passThrough={step.advanceOn === 'click'} />
        <Popover
          key={`${tour.id}:${stepIndex}`}
          triggerRef={triggerRef}
          isOpen
          isNonModal
          placement={step.placement ?? 'bottom'}
          offset={14}
          shouldFlip
          shouldCloseOnInteractOutside={() => false}
          isKeyboardDismissDisabled
        >
          <AriaDialog
            aria-label={step.title ?? tour.title}
            style={{ outline: 'none', width: 360, maxWidth: '80vw' }}
          >
            {card}
          </AriaDialog>
        </Popover>
      </>
    );
  }

  if (status === 'missing' && step.onMissingTarget === 'skip') {
    return null;
  }

  // no target, or target missing with the default `center` behaviour
  return (
    <Dialog
      key="step"
      isOpen
      isKeyboardDismissDisabled
      onOpenChange={open => !open && api.dismiss()}
      width={420}
    >
      <DialogBody>{card}</DialogBody>
    </Dialog>
  );
}
