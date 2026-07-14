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

import type { ReactNode, ComponentProps } from 'react';
import { ButtonIcon, Text } from '@backstage/ui';
import { RiCloseLine } from '@remixicon/react';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import styles from './CustomDialogTitle.module.css';

/*
  DialogTitleProps, DialogTitle, DialogContent and DialogActions
  are copied from the git-release plugin
*/

export interface DialogTitleProps {
  id: string;
  children: ReactNode;
  onClose: () => void;
}

export const DialogContent = (
  props: ComponentProps<typeof MuiDialogContent>,
) => <MuiDialogContent classes={{ root: styles.dialogContent }} {...props} />;

export const DialogActions = (
  props: ComponentProps<typeof MuiDialogActions>,
) => <MuiDialogActions classes={{ root: styles.dialogActions }} {...props} />;

export const CustomDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={styles.root} {...other}>
      <Text variant="title-small" className={styles.title}>
        {children}
      </Text>
      {onClose ? (
        <ButtonIcon
          aria-label="close"
          className={styles.closeButton}
          icon={<RiCloseLine size={16} />}
          variant="secondary"
          onPress={onClose}
        />
      ) : null}
    </MuiDialogTitle>
  );
};
