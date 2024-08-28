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

import { feedbackApiRef } from '../../api';
import { FeedbackCategory } from '../../models/feedback.model';
import { rootRouteRef, viewDocsRouteRef } from '../../routes';

export const OpcFeedbackComponent = () => {
  const appConfig = useApi(configApiRef);
  const feedbackApi = useApi(feedbackApiRef);
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);
  const analytics = useAnalytics();

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
      const resp = await feedbackApi.createFeedback({
        summary: event.detail.data.summary,
        description: '',
        projectId: projectId,
        url: window.location.href,
        userAgent: navigator.userAgent,
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
      theme="blue"
      app={footer}
      summaryLimit={summaryLimit}
    />
  );
};
