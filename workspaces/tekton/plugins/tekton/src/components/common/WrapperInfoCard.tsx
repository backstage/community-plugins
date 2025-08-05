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
import type { PropsWithChildren } from 'react';

import { BottomLinkProps, InfoCard } from '@backstage/core-components';

import { ClusterErrors } from '../../types/types';
import { ClusterSelector, ErrorPanel } from '../common';

type WrapperInfoCardProps = {
  title: string;
  allErrors?: ClusterErrors;
  footerLink?: BottomLinkProps;
  showClusterSelector?: boolean;
};

export const WrapperInfoCard = ({
  children,
  allErrors,
  footerLink,
  title,
  showClusterSelector = true,
}: PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard
      title={title}
      {...(showClusterSelector && { subheader: <ClusterSelector /> })}
      deepLink={footerLink}
    >
      {children}
    </InfoCard>
  </>
);

export default WrapperInfoCard;
