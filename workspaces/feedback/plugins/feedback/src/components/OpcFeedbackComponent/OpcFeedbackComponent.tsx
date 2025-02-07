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
import React, { useEffect } from 'react';

import '@one-platform/opc-feedback';

import {
  alertApiRef,
  configApiRef,
  identityApiRef,
  useAnalytics,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import { useTheme } from '@mui/material/styles';

import { feedbackApiRef } from '../../api';
import { FeedbackCategory } from '../../models/feedback.model';
import { rootRouteRef, viewDocsRouteRef } from '../../routes';

export const OpcFeedbackComponent = () => {
  const appConfig = useApi(configApiRef);
  const feedbackApi = useApi(feedbackApiRef);
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);
  const analytics = useAnalytics();
  const theme = useTheme();

  const footer = JSON.stringify({
    name: appConfig.getString('app.title'),
    url: appConfig.getString('app.baseUrl'),
  });
  const projectId = appConfig.getString('feedback.baseEntityRef');
  const summaryLimit =
    appConfig.getOptionalNumber('feedback.summaryLimit') ?? 240;
  const docsSpa = useRouteRef(viewDocsRouteRef);
  const feedbackSpa = useRouteRef(rootRouteRef);

  useEffect(() => {
    const onSubmit = async (event: any) => {
      if (event.detail.data.summary.trim().length < 1) {
        alertApi.post({
          message: 'Summary cannot be empty',
          severity: 'error',
          display: 'transient',
        });
        throw Error('Summary cannot be empty');
      }
      analytics.captureEvent('click', `submit - ${event.detail.data.summary}`);
      const userEntity = (await identityApi.getBackstageIdentity())
        .userEntityRef;
      const lines = event.detail.data.summary.split('\n') as string[];
      const resp = await feedbackApi.createFeedback({
        summary: lines[0],
        description: lines.slice(1).join('\n'),
        projectId: projectId,
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        createdBy: userEntity,
        tag:
          event.detail.data.category === 'BUG'
            ? event.detail.data.error
            : event.detail.data.experience,
        feedbackType:
          event.detail.data.category === 'BUG'
            ? FeedbackCategory.BUG
            : FeedbackCategory.FEEDBACK,
      });
      if (resp.error) {
        alertApi.post({
          message: resp.error,
          severity: 'error',
          display: 'transient',
        });
        throw new Error(resp.error);
      } else {
        alertApi.post({
          message: resp.message as string,
          severity: 'success',
          display: 'transient',
        });
      }
    };
    const elem: any = document.querySelector('opc-feedback');
    elem.onSubmit = onSubmit;
  }, [feedbackApi, projectId, identityApi, analytics, alertApi]);

  return (
    <opc-feedback
      docs={docsSpa()}
      spa={feedbackSpa()}
      theme={theme.palette.mode === 'dark' ? 'dark' : 'blue'}
      app={footer}
      summaryLimit={summaryLimit}
    />
  );
};
