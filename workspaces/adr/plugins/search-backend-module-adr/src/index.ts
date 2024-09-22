/**
 * The adr backend module for the search plugin.
 *
 * @packageDocumentation
 */

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

import {
  coreServices,
  createBackendModule,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import {
  DefaultAdrCollatorFactory,
  readScheduleConfigOptions,
} from './collators';
import {
  AdrFilePathFilterFn,
  AdrParser,
} from '@backstage-community/plugin-adr-common';

export {
  type AdrCollatorFactoryOptions,
  DefaultAdrCollatorFactory,
} from './collators';

/**
 * Options for {@link adrsCollatorExtensionPoint}.
 *
 * @public
 */
export type AdrsCollatorExtensionPoint = {
  /**
   * Allows you to customize how entities are shaped into documents.
   */
  setAdrFilePathFilter(filePathFilterFn: AdrFilePathFilterFn): void;

  /**
   * Allows you to parse files into different ADR formats.
   */
  setAdrParser(adrParser: AdrParser): void;
};

/**
 * Extension point for customizing how ADRs are shaped into
 * documents for the search backend.
 *
 * @public
 */
export const adrsCollatorExtensionPoint =
  createExtensionPoint<AdrsCollatorExtensionPoint>({
    id: 'search.adrsCollator.extension',
  });

/**
 * Search backend module for the ADRs index.
 *
 * @public
 */
export default createBackendModule({
  pluginId: 'search',
  moduleId: 'adr-collator',
  register(reg) {
    let adrFilePathFilterFn: AdrFilePathFilterFn | undefined;
    let parser: AdrParser | undefined;

    reg.registerExtensionPoint(adrsCollatorExtensionPoint, {
      setAdrFilePathFilter(filePathFilterFn) {
        if (adrFilePathFilterFn) {
          throw new Error('setAdrFilePathFilter can only be called once');
        }
        adrFilePathFilterFn = filePathFilterFn;
      },
      setAdrParser(adrParser) {
        if (parser) {
          throw new Error('setAdrParser can only be called once');
        }
        parser = adrParser;
      },
    });

    reg.registerInit({
      deps: {
        auth: coreServices.auth,
        cache: coreServices.cache,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        logger: coreServices.rootLogger,
        reader: coreServices.urlReader,
        scheduler: coreServices.scheduler,
        indexRegistry: searchIndexRegistryExtensionPoint,
        catalog: catalogServiceRef,
      },
      async init({
        auth,
        cache,
        config,
        discovery,
        logger,
        reader,
        scheduler,
        indexRegistry,
        catalog,
      }) {
        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(
            readScheduleConfigOptions(config),
          ),
          factory: DefaultAdrCollatorFactory.fromConfig({
            auth,
            cache,
            config,
            discovery,
            logger,
            reader,
            adrFilePathFilterFn,
            parser,
            catalogClient: catalog,
          }),
        });
      },
    });
  },
});
