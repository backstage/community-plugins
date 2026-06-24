/*
 * Copyright 2026 The Backstage Authors
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
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  CHECKMARX_PROJECT_ID_ANNOTATION,
  isCheckmarxAvailable,
} from '@backstage-community/plugin-checkmarx-react';
import { CheckmarxCard } from './EntityCheckmarxCard';

/** @public */
export type EntityCheckmarxContentPageProps = {
  title?: string;
  supportTitle?: string;
  missingAnnotationReadMoreUrl?: string;
};

/** @public */
export const CheckmarxContentPage = (
  props: EntityCheckmarxContentPageProps,
) => {
  const { entity } = useEntity();
  const { title, supportTitle, missingAnnotationReadMoreUrl } = props;

  if (!isCheckmarxAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={CHECKMARX_PROJECT_ID_ANNOTATION}
        readMoreUrl={missingAnnotationReadMoreUrl}
      />
    );
  }

  return (
    <Content>
      <ContentHeader title={title ?? 'Checkmarx'}>
        {supportTitle && <SupportButton>{supportTitle}</SupportButton>}
      </ContentHeader>
      <CheckmarxCard
        variant="fullHeight"
        mode="full"
        missingAnnotationReadMoreUrl={missingAnnotationReadMoreUrl}
      />
    </Content>
  );
};
