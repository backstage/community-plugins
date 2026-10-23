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
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiCompass3Line } from '@remixicon/react';
import { ReactElement } from 'react';
import { useGuidedTour } from '../hooks/useGuidedTour';

/**
 * Props for {@link RestartTourAction}.
 *
 * @public
 */
export interface RestartTourActionProps {
  /** Id of the tour to (re)start, e.g. `example/intro`. */
  tourId: string;
  /** Accessible name and tooltip. Default "Restart the tour". */
  label?: string;
  /** Icon of the button. Defaults to a compass. */
  icon?: ReactElement;
}

/**
 * An icon button that (re)starts a guided tour from its first step. Meant
 * for plugin headers, e.g. through `PluginHeaderActionBlueprint`. Renders
 * nothing when the guided tour plugin is not installed or the tour is
 * unknown.
 *
 * @example
 * ```tsx
 * PluginHeaderActionBlueprint.make({
 *   name: 'restart-tour',
 *   params: {
 *     loader: () =>
 *       import('@internal/backstage-plugin-guided-tour-react').then(m => (
 *         <m.RestartTourAction tourId="example/intro" />
 *       )),
 *   },
 * });
 * ```
 *
 * @public
 */
export function RestartTourAction(props: RestartTourActionProps) {
  const {
    tourId,
    label = 'Restart the tour',
    icon = <RiCompass3Line />,
  } = props;
  const tour = useGuidedTour(tourId);
  if (!tour.available) {
    return null;
  }
  return (
    <TooltipTrigger>
      <ButtonIcon
        variant="secondary"
        icon={icon}
        aria-label={label}
        onPress={() => tour.start({ force: true })}
      />
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}
