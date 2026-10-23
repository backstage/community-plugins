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
import { identityApiRef, useApi } from '@backstage/frontend-plugin-api';
import { guidedTourApiRef } from '@internal/backstage-plugin-guided-tour-react';
import { useEffect, useRef, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { selectLoginTours } from '../../api/DefaultGuidedTourApi';
import { ActiveStep } from './ActiveStep';
import { isOnRoute } from './isOnRoute';
import { useGuidedTourSnapshot } from './useGuidedTourSnapshot';

/**
 * App root element: decides when tours start on their own and renders the
 * active step. Renders nothing while no tour is running.
 */
export function GuidedTourOverlay() {
  const api = useApi(guidedTourApiRef);
  const identityApi = useApi(identityApiRef);
  const snapshot = useGuidedTourSnapshot();
  const location = useLocation();
  const [signedIn, setSignedIn] = useState(false);
  const loginHandled = useRef(false);

  // Root elements render before the sign-in page completes; wait for identity.
  useEffect(() => {
    let cancelled = false;
    identityApi
      .getBackstageIdentity()
      .then(() => !cancelled && setSignedIn(true))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [identityApi]);

  const canAutoStart = signedIn && snapshot.ready && api.isAutoStartEnabled();

  // Login tours: full sequence on first login, newcomers alone afterwards.
  useEffect(() => {
    if (!canAutoStart || loginHandled.current) return;
    loginHandled.current = true;
    if (snapshot.state.activeTourId) return;
    // A tour left in progress (reload, closed tab) resumes at its saved step,
    // unless that step belongs to another page: a deep link must not be
    // redirected. The tours page offers "Continue" for that case.
    const inProgress = api
      .getTours()
      .map(t => ({ tour: t, id: t.id, progress: api.getProgress(t.id) }))
      .filter(t => t.progress?.status === 'in-progress')
      .filter(t => {
        const route = t.tour.steps[t.progress?.stepIndex ?? 0]?.route;
        return !route || isOnRoute(route, location.pathname);
      })
      .sort((a, b) =>
        (b.progress?.updatedAt ?? '').localeCompare(
          a.progress?.updatedAt ?? '',
        ),
      )[0];
    if (inProgress) {
      api.start(inProgress.id);
      return;
    }
    const ids = selectLoginTours({
      tours: api.getTours(),
      progress: snapshot.progress,
      onboarded: snapshot.onboarded,
    });
    if (ids.length > 0) {
      api.startQueue(ids, { onboarding: !snapshot.onboarded });
    } else if (!snapshot.onboarded) {
      api.markOnboarded();
    }
    // the location is read once, when auto-start first becomes possible
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAutoStart, api, snapshot]);

  // Route tours: first visit of a matching path, never interrupting a run.
  useEffect(() => {
    if (!canAutoStart || snapshot.state.activeTourId) return;
    const tour = api
      .getTours()
      .find(
        t =>
          typeof t.autoStart === 'object' &&
          t.autoStart !== null &&
          matchPath(
            { path: t.autoStart.route, end: false },
            location.pathname,
          ) &&
          api.getProgress(t.id) === undefined,
      );
    if (tour) {
      api.start(tour.id);
    }
  }, [canAutoStart, location.pathname, api, snapshot.state.activeTourId]);

  const activeTour = snapshot.state.activeTourId
    ? api.getTour(snapshot.state.activeTourId)
    : undefined;
  if (!activeTour || !activeTour.steps[snapshot.state.stepIndex]) {
    return null;
  }
  return <ActiveStep tour={activeTour} stepIndex={snapshot.state.stepIndex} />;
}
