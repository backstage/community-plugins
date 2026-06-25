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
import { isQuayAvailable, QuayPage } from '@backstage-community/plugin-quay';
import {
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CONSUMES_API,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
  RELATION_PART_OF,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';
import { EmptyState } from '@backstage/core-components';
import {
  EntityApiDefinitionCard,
  EntityConsumedApisCard,
  EntityConsumingComponentsCard,
  EntityHasApisCard,
  EntityProvidedApisCard,
  EntityProvidingComponentsCard,
} from '@backstage/plugin-api-docs';
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
  EntityOrphanWarning,
  EntityProcessingErrorsPanel,
  EntityRelationWarning,
  EntitySwitch,
  hasCatalogProcessingErrors,
  hasRelationWarnings,
  isComponentType,
  isKind,
  isOrphan,
} from '@backstage/plugin-catalog';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import {
  EntityKubernetesContent,
  isKubernetesAvailable,
} from '@backstage/plugin-kubernetes';
import {
  EntityGroupProfileCard,
  EntityMembersListCard,
  EntityOwnershipCard,
  EntityUserProfileCard,
} from '@backstage/plugin-org';
import { EntityTechdocsContent } from '@backstage/plugin-techdocs';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ButtonLink, Grid } from '@backstage/ui';

const entityGridProps = {
  columns: { initial: '1', md: '12' } as const,
  gap: '3' as const,
  alignItems: 'stretch' as const,
};

const techdocsContent = (
  <EntityTechdocsContent>
    <TechDocsAddons>
      <ReportIssue />
    </TechDocsAddons>
  </EntityTechdocsContent>
);

const cicdContent = (
  <EntitySwitch>
    <EntitySwitch.Case>
      <EmptyState
        title="No CI/CD available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable CI/CD for it. You can read more about annotations in Backstage by clicking the button below."
        action={
          <ButtonLink
            variant="primary"
            href="https://backstage.io/docs/features/software-catalog/well-known-annotations"
          >
            Read more
          </ButtonLink>
        }
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid.Item colSpan="12">
          <EntityOrphanWarning />
        </Grid.Item>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <Grid.Item colSpan="12">
          <EntityRelationWarning />
        </Grid.Item>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid.Item colSpan="12">
          <EntityProcessingErrorsPanel />
        </Grid.Item>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <Grid.Root {...entityGridProps}>
    {entityWarningContent}
    <Grid.Item colSpan={{ md: '6' }}>
      <EntityAboutCard />
    </Grid.Item>
    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
      <EntityCatalogGraphCard height={400} />
    </Grid.Item>
    <Grid.Item colSpan={{ initial: '12', md: '4' }}>
      <EntityLinksCard />
    </Grid.Item>
    <Grid.Item colSpan={{ initial: '12', md: '8' }}>
      <EntityHasSubcomponentsCard />
    </Grid.Item>
  </Grid.Root>
);

const twoColumnCards = (
  <>
    <Grid.Item colSpan={{ md: '6' }}>
      <EntityDependsOnComponentsCard />
    </Grid.Item>
    <Grid.Item colSpan={{ md: '6' }}>
      <EntityDependsOnResourcesCard />
    </Grid.Item>
  </>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <Grid.Root {...entityGridProps}>
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityProvidedApisCard />
        </Grid.Item>
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityConsumedApisCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid.Root {...entityGridProps}>{twoColumnCards}</Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/quay" title="Quay" if={isQuayAvailable}>
      <QuayPage />
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid.Root {...entityGridProps}>{twoColumnCards}</Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

const defaultEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
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

const apiPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root {...entityGridProps}>
        {entityWarningContent}
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityAboutCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityCatalogGraphCard height={400} />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '4' }}>
          <EntityLinksCard />
        </Grid.Item>
        <Grid.Item colSpan="12">
          <Grid.Root {...entityGridProps}>
            <Grid.Item colSpan={{ md: '6' }}>
              <EntityProvidingComponentsCard />
            </Grid.Item>
            <Grid.Item colSpan={{ md: '6' }}>
              <EntityConsumingComponentsCard />
            </Grid.Item>
          </Grid.Root>
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/definition" title="Definition">
      <Grid.Root {...entityGridProps}>
        <Grid.Item colSpan="12">
          <EntityApiDefinitionCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root {...entityGridProps}>
        {entityWarningContent}
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityUserProfileCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityOwnershipCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root {...entityGridProps}>
        {entityWarningContent}
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityGroupProfileCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityOwnershipCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityMembersListCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityLinksCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root {...entityGridProps}>
        {entityWarningContent}
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityAboutCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityCatalogGraphCard height={400} />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '4' }}>
          <EntityLinksCard />
        </Grid.Item>
        <Grid.Item colSpan={{ md: '8' }}>
          <EntityHasComponentsCard />
        </Grid.Item>
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityHasApisCard />
        </Grid.Item>
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityHasResourcesCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
    <EntityLayout.Route path="/diagram" title="Diagram">
      <EntityCatalogGraphCard
        direction={Direction.TOP_BOTTOM}
        title="System Diagram"
        height={700}
        relations={[
          RELATION_PART_OF,
          RELATION_HAS_PART,
          RELATION_API_CONSUMED_BY,
          RELATION_API_PROVIDED_BY,
          RELATION_CONSUMES_API,
          RELATION_PROVIDES_API,
          RELATION_DEPENDENCY_OF,
          RELATION_DEPENDS_ON,
        ]}
        unidirectional={false}
      />
    </EntityLayout.Route>
  </EntityLayout>
);

const domainPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root {...entityGridProps}>
        {entityWarningContent}
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityAboutCard />
        </Grid.Item>
        <Grid.Item colSpan={{ initial: '12', md: '6' }}>
          <EntityCatalogGraphCard height={400} />
        </Grid.Item>
        <Grid.Item colSpan={{ md: '6' }}>
          <EntityHasSystemsCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage} />
    <EntitySwitch.Case if={isKind('api')} children={apiPage} />
    <EntitySwitch.Case if={isKind('group')} children={groupPage} />
    <EntitySwitch.Case if={isKind('user')} children={userPage} />
    <EntitySwitch.Case if={isKind('system')} children={systemPage} />
    <EntitySwitch.Case if={isKind('domain')} children={domainPage} />

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);
