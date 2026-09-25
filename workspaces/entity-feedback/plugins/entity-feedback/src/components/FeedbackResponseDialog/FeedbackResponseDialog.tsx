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

import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  ErrorApiError,
  errorApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  entityRouteParams,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Switch,
  TextAreaField,
} from '@backstage/ui';
import { ReactNode, useState } from 'react';
import useAsyncFn from 'react-use/esm/useAsyncFn';

import { entityFeedbackApiRef } from '../../api';
import styles from './FeedbackResponseDialog.module.css';

/**
 * @public
 */
export interface EntityFeedbackResponse {
  id: string;
  label: string;
}
export interface Comments {
  responseComments: {
    [key: string]: string;
  };
  additionalComments?: string;
}

const defaultFeedbackResponses: EntityFeedbackResponse[] = [
  { id: 'incorrect', label: 'Incorrect info' },
  { id: 'missing', label: 'Missing info' },
  { id: 'other', label: 'Other' },
];

/**
 * @public
 */
export interface FeedbackResponseDialogProps {
  entity: Entity;
  feedbackDialogResponses?: EntityFeedbackResponse[];
  feedbackDialogTitle?: ReactNode;
  open: boolean;
  onClose: () => void;
}

/**
 * @public
 */
export const FeedbackResponseDialog = (props: FeedbackResponseDialogProps) => {
  const {
    entity,
    feedbackDialogResponses = defaultFeedbackResponses,
    feedbackDialogTitle = 'Tell us what could be better',
    open,
    onClose,
  } = props;
  const errorApi = useApi(errorApiRef);
  const feedbackApi = useApi(entityFeedbackApiRef);
  const entityRoute = useRouteRef(entityRouteRef);
  const [responseSelections, setResponseSelections] = useState(
    Object.fromEntries(feedbackDialogResponses.map(r => [r.id, false])),
  );
  const [comments, setComments] = useState<Comments>({
    responseComments: {},
    additionalComments: '',
  });
  const [consent, setConsent] = useState(true);

  // Derive the entity URL using the same logic as EntityRefLink
  const entityUrl = entityRoute(
    entityRouteParams(entity, { encodeParams: true }),
  );

  const [{ loading: saving }, saveResponse] = useAsyncFn(async () => {
    // filter out responses that were not selected
    const filteredResponseComments = Object.entries(
      comments.responseComments,
    ).reduce((entry, [key, value]) => {
      if (responseSelections[key]) {
        entry[key] = value;
      }
      return entry;
    }, {} as { [key: string]: string });

    const filteredComments = {
      ...comments,
      responseComments: filteredResponseComments,
    };
    try {
      await feedbackApi.recordResponse(stringifyEntityRef(entity), {
        comments: JSON.stringify(filteredComments),
        consent,
        response: Object.keys(responseSelections)
          .filter(id => responseSelections[id])
          .join(','),
        link: entityUrl,
      });
      onClose();
    } catch (e) {
      errorApi.post(e as ErrorApiError);
    }
  }, [
    comments,
    consent,
    entity,
    entityUrl,
    feedbackApi,
    onClose,
    responseSelections,
  ]);

  return (
    <Dialog
      isOpen={open}
      isDismissable={!saving}
      onOpenChange={isOpen => !isOpen && !saving && onClose()}
    >
      {saving && <Alert status="info" isPending title="Saving feedback" />}
      <DialogHeader>{feedbackDialogTitle}</DialogHeader>
      <DialogBody className={styles.body}>
        <fieldset className={styles.responses} disabled={saving}>
          <legend>Select all that apply</legend>
          {feedbackDialogResponses.map((response: EntityFeedbackResponse) => (
            <div key={response.id} className={styles.response}>
              <Checkbox
                isSelected={responseSelections[response.id]}
                isDisabled={saving}
                onChange={selected =>
                  setResponseSelections(previous => ({
                    ...previous,
                    [response.id]: selected,
                  }))
                }
              >
                {response.label}
              </Checkbox>
              {responseSelections[response.id] && (
                <TextAreaField
                  data-testid={`feedback-response-dialog-comments-input-${response.id}`}
                  label={`Comments about ${response.label}`}
                  isDisabled={saving}
                  rows={2}
                  value={comments.responseComments[response.id] || ''}
                  onChange={value =>
                    setComments(previous => ({
                      ...previous,
                      responseComments: {
                        ...previous.responseComments,
                        [response.id]: value,
                      },
                    }))
                  }
                />
              )}
            </div>
          ))}
        </fieldset>
        <TextAreaField
          data-testid="feedback-response-dialog-comments-input"
          label="Additional comments"
          isDisabled={saving}
          rows={2}
          onChange={value =>
            setComments(previous => ({
              ...previous,
              additionalComments: value,
            }))
          }
          value={comments.additionalComments || ''}
        />
        <Switch
          label="May we contact you about your feedback?"
          isSelected={consent}
          isDisabled={saving}
          onChange={setConsent}
        />
      </DialogBody>
      <DialogFooter className={styles.actions}>
        <Button
          variant="primary"
          data-testid="feedback-response-dialog-submit-button"
          isDisabled={saving}
          onPress={saveResponse}
        >
          Submit
        </Button>
        <Button variant="secondary" isDisabled={saving} onPress={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
