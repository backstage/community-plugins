/*
 * Copyright 2021 The Backstage Authors
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

import {
  Button,
  ButtonIcon,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import { DialogTrigger } from 'react-aria-components';
import { RiCloseLine } from '@remixicon/react';
import type { KeyboardEvent } from 'react';
import { useState } from 'react';
import { cn } from '../../utils';
import styles from './PreformattedText.module.css';

interface PreformattedTextProps {
  text: string;
  maxChars: number;
}

interface ExpandableProps extends PreformattedTextProps {
  expandable: boolean;
  title: string;
}

interface NonExpandableProps extends PreformattedTextProps {
  expandable?: never;
  title?: string;
}

export const PreformattedText = ({
  text,
  maxChars,
  expandable,
  title,
}: NonExpandableProps | ExpandableProps) => {
  const [open, setOpen] = useState(false);

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (expandable && event.key === 'Enter') {
      setOpen(true);
    }
  };

  return (
    <>
      <div
        role={expandable ? 'button' : undefined}
        onClick={() => expandable && setOpen(true)}
        onKeyUp={handleKeyUp}
        tabIndex={expandable ? 0 : undefined}
      >
        <pre className={cn(styles.pre, expandable && styles.expandable)}>
          {text.slice(0, maxChars - 1).trim()}
          {text.length > maxChars - 1 && '…'}
        </pre>
      </div>

      {expandable && (
        <DialogTrigger>
          <Dialog
            isOpen={open}
            isDismissable
            onOpenChange={isOpen => {
              if (!isOpen) setOpen(false);
            }}
          >
            <DialogHeader>
              <span>{title}</span>
              <ButtonIcon
                aria-label="close"
                icon={<RiCloseLine size={16} />}
                variant="secondary"
                onPress={() => setOpen(false)}
              />
            </DialogHeader>
            <DialogBody>
              <pre className={styles.fullPre}>{text}</pre>
            </DialogBody>
            <DialogFooter>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </Dialog>
        </DialogTrigger>
      )}
    </>
  );
};
