/*
 * Copyright 2024 The Backstage Authors
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
import type { FC } from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      fill: theme.palette.text.primary,
    },
    disabledButton: {
      fill: theme.palette.grey[600],
    },
  }),
);

export const ViewLogsIcon: FC<{ disabled?: boolean }> = ({ disabled }) => {
  const classes = useStyles();
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={disabled ? classes.disabledButton : classes.icon}
    >
      <path d="M4.5 21C4.0875 21 3.73438 20.8531 3.44063 20.5594C3.14688 20.2656 3 19.9125 3 19.5V4.5C3 4.0875 3.14688 3.73438 3.44063 3.44063C3.73438 3.14688 4.0875 3 4.5 3H19.5C19.9125 3 20.2656 3.14688 20.5594 3.44063C20.8531 3.73438 21 4.0875 21 4.5V19.5C21 19.9125 20.8531 20.2656 20.5594 20.5594C20.2656 20.8531 19.9125 21 19.5 21H4.5ZM4.5 19.5H19.5V6.5H4.5V19.5ZM12.001 16.875C10.667 16.875 9.475 16.5154 8.425 15.7962C7.375 15.077 6.60833 14.1437 6.125 12.9962C6.60833 11.8487 7.37466 10.9167 8.42398 10.2C9.47329 9.48333 10.665 9.125 11.999 9.125C13.333 9.125 14.525 9.48459 15.575 10.2038C16.625 10.923 17.3917 11.8563 17.875 13.0038C17.3917 14.1513 16.6253 15.0833 15.576 15.8C14.5267 16.5167 13.335 16.875 12.001 16.875ZM11.9971 14.25C11.649 14.25 11.3542 14.1282 11.1125 13.8846C10.8708 13.6409 10.75 13.3451 10.75 12.9971C10.75 12.649 10.8718 12.3542 11.1155 12.1125C11.3591 11.8708 11.6549 11.75 12.003 11.75C12.351 11.75 12.6458 11.8718 12.8875 12.1155C13.1292 12.3591 13.25 12.6549 13.25 13.003C13.25 13.351 13.1282 13.6458 12.8846 13.8875C12.6409 14.1292 12.3451 14.25 11.9971 14.25ZM12 15C12.56 15 13.0333 14.8067 13.42 14.42C13.8067 14.0333 14 13.56 14 13C14 12.44 13.8067 11.9667 13.42 11.58C13.0333 11.1933 12.56 11 12 11C11.44 11 10.9667 11.1933 10.58 11.58C10.1933 11.9667 10 12.44 10 13C10 13.56 10.1933 14.0333 10.58 14.42C10.9667 14.8067 11.44 15 12 15Z" />
    </svg>
  );
};
