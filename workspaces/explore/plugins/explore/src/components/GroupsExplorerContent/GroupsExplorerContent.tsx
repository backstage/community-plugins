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

import React from 'react';
import { GroupsDiagram } from './GroupsDiagram';
import {
  Content,
  ContentHeader,
  DependencyGraphTypes,
  SupportButton,
} from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(
  {
    root: {
      height: '100%',
      maxHeight: '100%',
      minHeight: 0,
    },
  },
  { name: 'ExploreGroupsContent' },
);

export const GroupsExplorerContent = (props: {
  title?: string;
  direction?: DependencyGraphTypes.Direction;
}) => {
  const classes = useStyles();

  return (
    <Content noPadding stretch className={classes.root}>
      <ContentHeader title={props.title ?? 'Groups'}>
        <SupportButton>Explore your groups.</SupportButton>
      </ContentHeader>
      <GroupsDiagram direction={props.direction} />
    </Content>
  );
};
