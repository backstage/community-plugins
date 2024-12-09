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
import { CodeSnippet, InfoCard } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import React from 'react';
import {
  YAMLCodeDataType,
  generateYAMLCode,
} from '../../utils/generateYAMLCode';

const defaultYAMLCodeData = {
  limits: {
    cpu: '-',
    memory: '-',
  },
  requests: {
    cpu: '-',
    memory: '-',
  },
};

interface CodeInfoCardProps {
  cardTitle: string;
  showCopyCodeButton: boolean;
  yamlCodeData?: YAMLCodeDataType;
}

export const CodeInfoCard: React.FC<CodeInfoCardProps> = ({
  cardTitle,
  showCopyCodeButton,
  yamlCodeData,
}) => {
  const YAMLCode = generateYAMLCode(yamlCodeData || defaultYAMLCodeData);

  return (
    <InfoCard
      title={
        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
          {cardTitle}
        </Typography>
      }
    >
      <CodeSnippet
        text={YAMLCode}
        language="yaml"
        showCopyCodeButton={showCopyCodeButton}
      />
    </InfoCard>
  );
};
