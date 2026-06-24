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
import { ButtonLink } from '@backstage/ui';

import styles from './EntityPage.module.css';
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
  EntityUserProfileCard,
  EntityGroupProfileCard,
  EntityMembersListCard,
  EntityOwnershipCard,
} from '@backstage/plugin-org';
import { EntityTechdocsContent } from '@backstage/plugin-techdocs';
import { EmptyState } from '@backstage/core-components';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
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

import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';

import {
  EntityKubernetesContent,
  isKubernetesAvailable,
} from '@backstage/plugin-kubernetes';
import { TopologyPage } from '@backstage-community/plugin-topology';

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
        <div className={styles.col12}>
          <EntityOrphanWarning />
        </div>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <div className={styles.col12}>
          <EntityRelationWarning />
        </div>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <div className={styles.col12}>
          <EntityProcessingErrorsPanel />
        </div>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <div className={styles.entityGrid}>
    {entityWarningContent}
    <div className={styles.colMd6}>
      <EntityAboutCard />
    </div>
    <div className={styles.colMd6}>
      <EntityCatalogGraphCard height={400} />
    </div>
    <div className={styles.colMd4}>
      <EntityLinksCard />
    </div>
    <div className={styles.colMd8}>
      <EntityHasSubcomponentsCard />
    </div>
  </div>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/topology" title="Topology">
      <TopologyPage />
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <div className={styles.entityGrid}>
        <div className={styles.colMd6}>
          <EntityProvidedApisCard />
        </div>
        <div className={styles.colMd6}>
          <EntityConsumedApisCard />
        </div>
      </div>
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <div className={styles.entityGrid}>
        <div className={styles.colMd6}>
          <EntityDependsOnComponentsCard />
        </div>
        <div className={styles.colMd6}>
          <EntityDependsOnResourcesCard />
        </div>
      </div>
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

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <div className={styles.entityGrid}>
        <div className={styles.colMd6}>
          <EntityDependsOnComponentsCard />
        </div>
        <div className={styles.colMd6}>
          <EntityDependsOnResourcesCard />
        </div>
      </div>
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
      <div className={styles.entityGrid}>
        {entityWarningContent}
        <div className={styles.colMd6}>
          <EntityAboutCard />
        </div>
        <div className={styles.colMd6}>
          <EntityCatalogGraphCard height={400} />
        </div>
        <div className={styles.colMd4}>
          <EntityLinksCard />
        </div>
        <div className={styles.colMd12}>
          <div className={styles.entityGrid}>
            <div className={styles.colMd6}>
              <EntityProvidingComponentsCard />
            </div>
            <div className={styles.colMd6}>
              <EntityConsumingComponentsCard />
            </div>
          </div>
        </div>
      </div>
    </EntityLayout.Route>

    <EntityLayout.Route path="/definition" title="Definition">
      <div className={styles.entityGrid}>
        <div className={styles.col12}>
          <EntityApiDefinitionCard />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className={styles.entityGrid}>
        {entityWarningContent}
        <div className={styles.colMd6}>
          <EntityUserProfileCard />
        </div>
        <div className={styles.colMd6}>
          <EntityOwnershipCard />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className={styles.entityGrid}>
        {entityWarningContent}
        <div className={styles.colMd6}>
          <EntityGroupProfileCard />
        </div>
        <div className={styles.colMd6}>
          <EntityOwnershipCard />
        </div>
        <div className={styles.colMd6}>
          <EntityMembersListCard />
        </div>
        <div className={styles.colMd6}>
          <EntityLinksCard />
        </div>
      </div>
    </EntityLayout.Route>
  </EntityLayout>
);

const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <div className={styles.entityGrid}>
        {entityWarningContent}
        <div className={styles.colMd6}>
          <EntityAboutCard />
        </div>
        <div className={styles.colMd6}>
          <EntityCatalogGraphCard height={400} />
        </div>
        <div className={styles.colMd4}>
          <EntityLinksCard />
        </div>
        <div className={styles.colMd8}>
          <EntityHasComponentsCard />
        </div>
        <div className={styles.colMd6}>
          <EntityHasApisCard />
        </div>
        <div className={styles.colMd6}>
          <EntityHasResourcesCard />
        </div>
      </div>
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
      <div className={styles.entityGrid}>
        {entityWarningContent}
        <div className={styles.colMd6}>
          <EntityAboutCard />
        </div>
        <div className={styles.colMd6}>
          <EntityCatalogGraphCard height={400} />
        </div>
        <div className={styles.colMd6}>
          <EntityHasSystemsCard />
        </div>
      </div>
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
