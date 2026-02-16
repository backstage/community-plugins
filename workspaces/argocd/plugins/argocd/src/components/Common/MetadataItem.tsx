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
import { Typography } from '@material-ui/core';
import { FlexItem } from '@patternfly/react-core';
import type { ReactNode, FC } from 'react';
import { HTMLAttributes } from 'react';

interface MetadataItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
}

const MetadataItem: FC<MetadataItemProps> = ({ title, children, ...props }) => {
  return (
    <FlexItem {...props}>
      <Typography variant="body1" color="textPrimary">
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {children}
      </Typography>
    </FlexItem>
  );
};

export default MetadataItem;
