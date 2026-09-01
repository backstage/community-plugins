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

import { ButtonIcon } from '@backstage/ui';
import { RiAddLine, RiFullscreenLine, RiSubtractLine } from '@remixicon/react';

const ICON_SIZE = 16;

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  className?: string;
}

/**
 * Zoom in, zoom out and fit-to-view buttons.
 *
 * Exported so a view can place these outside the canvas — the runs-table panel
 * renders them in its header, beside the close button.
 */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onFit,
  className,
}: ZoomControlsProps) {
  return (
    <div className={className}>
      <ButtonIcon
        variant="secondary"
        icon={<RiAddLine size={ICON_SIZE} />}
        onPress={onZoomIn}
        aria-label="Zoom in"
      />
      <ButtonIcon
        variant="secondary"
        icon={<RiSubtractLine size={ICON_SIZE} />}
        onPress={onZoomOut}
        aria-label="Zoom out"
      />
      <ButtonIcon
        variant="secondary"
        icon={<RiFullscreenLine size={ICON_SIZE} />}
        onPress={onFit}
        aria-label="Fit to view"
      />
    </div>
  );
}
