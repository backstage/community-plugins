/*
 * Copyright 2023 The Backstage Authors
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

import { stringifyEntityRef } from '@backstage/catalog-model';
import { Progress } from '@backstage/core-components';
import {
  ErrorApiError,
  errorApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import { ReactNode, useCallback, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import useAsyncFn from 'react-use/esm/useAsyncFn';

import { entityFeedbackApiRef } from '../../api';
import {
  EntityFeedbackResponse,
  FeedbackResponseDialog,
} from '../FeedbackResponseDialog';

/**
 * @public
 */
export enum LikeDislikeFeedbackRatings {
  like = 'LIKE',
  dislike = 'DISLIKE',
  neutral = 'NEUTRAL',
}

/**
 * @public
 */
export interface LikeDislikeButtonsProps {
  feedbackDialogResponses?: EntityFeedbackResponse[];
  feedbackDialogTitle?: ReactNode;
  requestResponse?: boolean;
}

/**
 * @public
 */
export const LikeDislikeButtons = (props: LikeDislikeButtonsProps) => {
  const {
    feedbackDialogResponses,
    feedbackDialogTitle,
    requestResponse = true,
  } = props;
  const errorApi = useApi(errorApiRef);
  const feedbackApi = useApi(entityFeedbackApiRef);
  const identityApi = useApi(identityApiRef);
  const [rating, setRating] = useState<LikeDislikeFeedbackRatings>(
    LikeDislikeFeedbackRatings.neutral,
  );
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const { entity, loading: loadingEntity } = useAsyncEntity();

  const { loading: loadingFeedback } = useAsync(async () => {
    // Wait until entity is loaded
    if (!entity) {
      return;
    }

    try {
      const identity = await identityApi.getBackstageIdentity();
      const prevFeedback = await feedbackApi.getRatings(
        stringifyEntityRef(entity),
      );
      setRating(
        (prevFeedback.find(r => r.userRef === identity.userEntityRef)?.rating ??
          rating) as LikeDislikeFeedbackRatings,
      );
    } catch (e) {
      errorApi.post(e as ErrorApiError);
    }
  }, [entity, feedbackApi, setRating]);

  const [{ loading: savingFeedback }, saveFeedback] = useAsyncFn(
    async (feedback: LikeDislikeFeedbackRatings) => {
      try {
        await feedbackApi.recordRating(stringifyEntityRef(entity!), feedback);
        setRating(feedback);
      } catch (e) {
        errorApi.post(e as ErrorApiError);
      }
    },
    [entity, feedbackApi, setRating],
  );

  const applyRating = useCallback(
    (feedback: LikeDislikeFeedbackRatings) => {
      // Clear rating if feedback is same as current
      if (feedback === rating) {
        saveFeedback(LikeDislikeFeedbackRatings.neutral);
        return;
      }

      saveFeedback(feedback);
      if (feedback === LikeDislikeFeedbackRatings.dislike && requestResponse) {
        setOpenFeedbackDialog(true);
      }
    },
    [rating, requestResponse, saveFeedback, setOpenFeedbackDialog],
  );

  if (loadingEntity || loadingFeedback || savingFeedback) {
    return <Progress />;
  }

  return (
    <>
      <IconButton
        data-testid="entity-feedback-like-button"
        onClick={() => applyRating(LikeDislikeFeedbackRatings.like)}
      >
        {rating === LikeDislikeFeedbackRatings.like ? (
          <Tooltip title="Liked">
            <ThumbUpIcon fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="Like">
            <ThumbUpOutlinedIcon fontSize="small" />
          </Tooltip>
        )}
      </IconButton>
      <IconButton
        data-testid="entity-feedback-dislike-button"
        onClick={() => applyRating(LikeDislikeFeedbackRatings.dislike)}
      >
        {rating === LikeDislikeFeedbackRatings.dislike ? (
          <Tooltip title="Disliked">
            <ThumbDownIcon fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="Dislike">
            <ThumbDownOutlinedIcon fontSize="small" />
          </Tooltip>
        )}
      </IconButton>
      <FeedbackResponseDialog
        entity={entity!}
        open={openFeedbackDialog}
        onClose={() => setOpenFeedbackDialog(false)}
        feedbackDialogResponses={feedbackDialogResponses}
        feedbackDialogTitle={feedbackDialogTitle}
      />
    </>
  );
};
