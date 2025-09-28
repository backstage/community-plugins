/*
 * Copyright 2025 The Backstage Authors
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
import { Content, Header, Page } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core';
import { EntityFluxGitRepositoriesCard } from '../EntityFluxGitRepositoriesCard';
import { EntityFluxHelmRepositoriesCard } from '../EntityFluxHelmRepositoriesCard';
import { EntityFluxOCIRepositoriesCard } from '../EntityFluxOCIRepositoriesCard';
import { EntityFluxKustomizationsCard } from '../EntityFluxKustomizationsCard';
import { EntityFluxHelmReleasesCard } from '../EntityFluxHelmReleasesCard';
import { RequireKubernetesPermissions } from '../../RequireKubernetesPermissions';

const useStyles = makeStyles(() => ({
  overflowXScroll: {
    overflowX: 'scroll',
  },
}));

export interface FluxContentProps {
  /**
   * Title
   */
  title?: string;
  /**
   * Subtitle
   */
  subtitle?: string;
  /**
   * Page Title
   */
  pageTitle?: string;
}

/**
 * Main Page of Flux Resources
 *
 * @public
 */
export function FluxContent(props: FluxContentProps) {
  const { title = 'Flux Resources' } = props;
  const classes = useStyles();

  return (
    <Page themeId="tool">
      <Header title={title} />
      <Content className={classes.overflowXScroll}>
        <RequireKubernetesPermissions>
          <EntityFluxKustomizationsCard />
          <EntityFluxHelmReleasesCard />
          <EntityFluxGitRepositoriesCard />
          <EntityFluxHelmRepositoriesCard />
          <EntityFluxOCIRepositoriesCard />
        </RequireKubernetesPermissions>
      </Content>
    </Page>
  );
}
