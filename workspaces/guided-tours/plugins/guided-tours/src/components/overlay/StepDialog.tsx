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
import { Dialog, DialogBody } from '@backstage/ui';
import { ReactNode } from 'react';
import { Spotlight, SPOTLIGHT_Z_INDEX } from './Spotlight';

/**
 * The page is dimmed by the spotlight mask alone, also for centered steps,
 * so the dim never changes between anchored and centered steps. The BUI
 * dialog overlay therefore loses its own backdrop and is raised above the
 * mask. The rule only matches overlays that hold a tour dialog.
 */
const overlayStyle =
  `.bui-DialogOverlay[data-guided-tour-dialog] ` +
  `{ background: transparent; z-index: ${SPOTLIGHT_Z_INDEX + 1}; }`;

export interface StepDialogProps {
  children: ReactNode;
  onDismiss(): void;
}

/**
 * Centered modal for steps without a usable target and for the loading
 * placeholder, over the full spotlight mask. Escape is handled by the
 * overlay; a click on the mask and the card's own close button dismiss the
 * tour.
 */
export function StepDialog(props: StepDialogProps) {
  const { children, onDismiss } = props;
  return (
    <>
      <Spotlight rect={null} />
      <style>{overlayStyle}</style>
      <Dialog
        isOpen
        isKeyboardDismissDisabled
        onOpenChange={open => !open && onDismiss()}
        width={420}
        data-guided-tour-dialog=""
      >
        <DialogBody>{children}</DialogBody>
      </Dialog>
    </>
  );
}
