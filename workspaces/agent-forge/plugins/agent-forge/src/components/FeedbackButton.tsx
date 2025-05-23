/*
 * Copyright 2025 The Backstage Authors
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

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import ThumbUpIcon from '../icons/thumb-up-icon.png';
import ThumbUpFilledIcon from '../icons/thumb-up-filled-icon.png';
import ThumbDownIcon from '../icons/thumb-down-icon.png';
import ThumbDownFilledIcon from '../icons/thumb-down-filled-icon.png';
import CopyIcon from '../icons/copy.svg';
import React from 'react';
import useStyles from './useStyles';

export enum Feedback {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export interface FeedbackButtonProps {
  enabled: boolean;
  feedback?: string | Feedback;
  handleFeedback: (feedback: Feedback) => void;
  handleCopyToClipBoard: () => void;
}

export function FeedbackButton({
  feedback,
  handleFeedback,
  handleCopyToClipBoard,
}: FeedbackButtonProps) {
  const styles = useStyles();
  return (
    <>
      <img
        className={styles.feedbackIconImage}
        src={feedback === Feedback.LIKE ? ThumbUpFilledIcon : ThumbUpIcon}
        alt="Thumb up"
        title="Thumb up"
        onClick={() => handleFeedback(Feedback.LIKE)}
        onKeyDown={() => {}}
      />
      <img
        className={styles.feedbackIconImage}
        src={
          feedback === Feedback.DISLIKE ? ThumbDownFilledIcon : ThumbDownIcon
        }
        alt="Thumb down"
        title="Thumb down"
        onClick={() => handleFeedback(Feedback.DISLIKE)}
        onKeyDown={() => {}}
      />
      <img
        src={CopyIcon}
        alt="Copy to clipboard"
        title="Copy to clipboard"
        onClick={handleCopyToClipBoard}
        onKeyDown={() => {}}
        className={styles.feedbackIconImage}
      />
    </>
  );
}
