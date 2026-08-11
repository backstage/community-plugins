/*
 * Copyright 2020 The Backstage Authors
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

import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@backstage/ui';
import { RiLinkM } from '@remixicon/react';
import { Link, MarkdownContent } from '@backstage/core-components';
import { isValidUrl } from '../../utils/components';
import type { EntrySnapshot } from '../../utils/types';
import { RadarTimeline } from '../RadarTimeline';
import styles from './RadarDescription.module.css';

export type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  timeline?: EntrySnapshot[];
  url?: string;
  links?: Array<{ url: string; title: string }>;
};

const RadarDescription = (props: Props): React.JSX.Element => {
  function showDialogActions(
    url: string | undefined,
    links: Array<{ url: string; title: string }> | undefined,
  ): Boolean {
    return isValidUrl(url) || Boolean(links && links.length > 0);
  }

  const { open, onClose, title, description, timeline, url, links } = props;

  // Controlled Dialog without DialogTrigger — matches BUI docs and avoids broken
  // overlays when opened from SVG legend/blip clicks (no trigger element).
  return (
    <Dialog
      data-testid="radar-description"
      className={styles.dialog}
      isOpen={open}
      isDismissable
      width="min(960px, 90vw)"
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <DialogHeader data-testid="radar-description-dialog-title">
        {title}
      </DialogHeader>
      <DialogBody>
        <MarkdownContent content={description} />
        <RadarTimeline timeline={timeline} />
      </DialogBody>
      {showDialogActions(url, links) && (
        <DialogFooter>
          {links?.map(link => (
            <Link
              key={link.url}
              to={link.url}
              onClick={onClose}
              className={styles.dialogLink}
            >
              <RiLinkM size={16} />
              {link.title}
            </Link>
          ))}
          {isValidUrl(url) && (
            <Link
              key={url}
              to={url!}
              onClick={onClose}
              className={styles.dialogLink}
            >
              <RiLinkM size={16} />
              LEARN MORE
            </Link>
          )}
        </DialogFooter>
      )}
    </Dialog>
  );
};

export { RadarDescription };
