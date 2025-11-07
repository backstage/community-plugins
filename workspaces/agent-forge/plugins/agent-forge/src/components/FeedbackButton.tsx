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
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import ThumbUpIcon from '../icons/thumb-up-icon.png';
import ThumbUpFilledIcon from '../icons/thumb-up-filled-icon.png';
import ThumbDownIcon from '../icons/thumb-down-icon.png';
import ThumbDownFilledIcon from '../icons/thumb-down-filled-icon.png';
import CopyIcon from '../icons/copy.svg';
import React from 'react';

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

const iconStyle = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  marginRight: '8px',
};

export function FeedbackButton({
  enabled,
  feedback,
  handleFeedback,
  handleCopyToClipBoard,
}: FeedbackButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <img
        style={{
          ...iconStyle,
          opacity: enabled ? 1 : 0.5,
          cursor: enabled ? 'pointer' : 'not-allowed',
        }}
        src={feedback === Feedback.LIKE ? ThumbUpFilledIcon : ThumbUpIcon}
        alt="Thumb up"
        title="Thumb up"
        onClick={() => enabled && handleFeedback(Feedback.LIKE)}
        onKeyDown={e =>
          handleKeyDown(e, () => enabled && handleFeedback(Feedback.LIKE))
        }
        role="button"
        tabIndex={0}
      />
      <img
        style={{
          ...iconStyle,
          opacity: enabled ? 1 : 0.5,
          cursor: enabled ? 'pointer' : 'not-allowed',
        }}
        src={
          feedback === Feedback.DISLIKE ? ThumbDownFilledIcon : ThumbDownIcon
        }
        alt="Thumb down"
        title="Thumb down"
        onClick={() => enabled && handleFeedback(Feedback.DISLIKE)}
        onKeyDown={e =>
          handleKeyDown(e, () => enabled && handleFeedback(Feedback.DISLIKE))
        }
        role="button"
        tabIndex={0}
      />
      <img
        src={CopyIcon}
        alt="Copy to clipboard"
        title="Copy to clipboard"
        onClick={handleCopyToClipBoard}
        onKeyDown={e => handleKeyDown(e, handleCopyToClipBoard)}
        style={iconStyle}
        role="button"
        tabIndex={0}
      />
    </>
  );
}
