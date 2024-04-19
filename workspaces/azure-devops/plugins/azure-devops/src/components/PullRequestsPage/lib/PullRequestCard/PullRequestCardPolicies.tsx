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

import { Policy } from '@backstage-community/plugin-azure-devops-common';
import { PullRequestCardPolicy } from './PullRequestCardPolicy';
import React from 'react';

type PullRequestCardProps = {
  policies: Policy[];
  className: string;
};

export const PullRequestCardPolicies = ({
  policies,
  className,
}: PullRequestCardProps) => (
  <div className={className}>
    {policies.map(policy => (
      <PullRequestCardPolicy key={policy.id} policy={policy} />
    ))}
  </div>
);
