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
import { Grid } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import {
  EntityAboutCard,
  EntityDependsOnComponentsCard,
  EntityDependsOnResourcesCard,
  EntityHasComponentsCard,
  EntityHasResourcesCard,
  EntityHasSubcomponentsCard,
  EntityHasSystemsCard,
  EntityLayout,
  EntityLinksCard,
  EntitySwitch,
  EntityOrphanWarning,
  EntityProcessingErrorsPanel,
  isComponentType,
  isKind,
  hasCatalogProcessingErrors,
  isOrphan,
  hasRelationWarnings,
  EntityRelationWarning,
} from '@backstage/plugin-catalog';
import {
  EntityGroupProfileCard,
  EntityMembersListCard,
  EntityOwnershipCard,
  EntityUserProfileCard,
} from '@backstage/plugin-org';
import {
  EntityFeedbackResponseContent,
  EntityLikeDislikeRatingsCard,
  LikeDislikeButtons,
} from '@backstage-community/plugin-entity-feedback';

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid item xs={12}>
          <EntityOrphanWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <Grid item xs={12}>
          <EntityRelationWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid item xs={12}>
          <EntityProcessingErrorsPanel />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>

    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>

    <Grid item md={2}>
      <InfoCard title="Rate this entity">
        <LikeDislikeButtons />
      </InfoCard>
    </Grid>

    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const defaultEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/feedback" title="Feedback">
      <EntityFeedbackResponseContent />
    </EntityLayout.Route>
  </EntityLayout>
);

const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isComponentType('service')}>
      {serviceEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case if={isComponentType('website')}>
      {websiteEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);

const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid item md={4} xs={12}>
          <EntityLinksCard />
        </Grid>
        <Grid item md={8}>
          <EntityHasComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityHasResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const domainPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3} alignItems="stretch">
        {entityWarningContent}
        <Grid item md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityHasSystemsCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityUserProfileCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard variant="gridItem" />
        </Grid>
        <Grid item xs={12}>
          <EntityLikeDislikeRatingsCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        {entityWarningContent}
        <Grid item xs={12} md={6}>
          <EntityGroupProfileCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityOwnershipCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityMembersListCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <EntityLinksCard />
        </Grid>
        <Grid item xs={12}>
          <EntityLikeDislikeRatingsCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);

export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage} />
    <EntitySwitch.Case if={isKind('system')} children={systemPage} />
    <EntitySwitch.Case if={isKind('domain')} children={domainPage} />
    <EntitySwitch.Case if={isKind('group')} children={groupPage} />
    <EntitySwitch.Case if={isKind('user')} children={userPage} />

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);
