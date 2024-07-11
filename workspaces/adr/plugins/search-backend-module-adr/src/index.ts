/**
 * The adr backend module for the search plugin.
 *
 * @packageDocumentation
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
        tokenManager: coreServices.tokenManager,
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
        tokenManager,
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
            tokenManager,
            adrFilePathFilterFn,
            parser,
            catalogClient: catalog,
          }),
        });
      },
    });
  },
});
