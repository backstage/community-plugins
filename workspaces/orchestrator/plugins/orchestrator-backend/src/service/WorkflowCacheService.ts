import { LoggerService } from '@backstage/backend-plugin-api';
import { PluginTaskScheduler } from '@backstage/backend-tasks';

import { DataIndexService } from './DataIndexService';
import { SonataFlowService } from './SonataFlowService';

export type CacheHandler = 'skip' | 'throw';

export class WorkflowCacheService {
  private readonly TASK_ID = 'task__Orchestrator__WorkflowCacheService';
  private readonly DEFAULT_FREQUENCY_IN_SECONDS = 5;
  private readonly DEFAULT_TIMEOUT_IN_MINUTES = 10;
  private readonly definitionIdCache = new Set<string>();

  constructor(
    private readonly logger: LoggerService,
    private readonly dataIndexService: DataIndexService,
    private readonly sonataFlowService: SonataFlowService,
  ) {}

  public get definitionIds(): string[] {
    return Array.from(this.definitionIdCache);
  }

  public isEmpty(): boolean {
    return this.definitionIdCache.size === 0;
  }

  public isAvailable(
    definitionId?: string,
    cacheHandler: CacheHandler = 'skip',
  ): boolean {
    if (!definitionId) {
      return false;
    }
    const isAvailable = this.definitionIdCache.has(definitionId);
    if (!isAvailable && cacheHandler === 'throw') {
      throw new Error(
        `Workflow service "${definitionId}" not available at the moment`,
      );
    }
    return isAvailable;
  }

  public schedule(args: {
    scheduler: PluginTaskScheduler;
    frequencyInSeconds?: number;
    timeoutInMinutes?: number;
  }): void {
    const {
      scheduler,
      frequencyInSeconds = this.DEFAULT_FREQUENCY_IN_SECONDS,
      timeoutInMinutes = this.DEFAULT_TIMEOUT_IN_MINUTES,
    } = args;

    scheduler.scheduleTask({
      id: this.TASK_ID,
      frequency: { seconds: frequencyInSeconds },
      timeout: { minutes: timeoutInMinutes },
      fn: async () => {
        await this.runTask();
      },
    });
  }

  private async runTask() {
    try {
      const idUrlMap = await this.dataIndexService.fetchWorkflowServiceUrls();
      this.definitionIdCache.forEach(definitionId => {
        if (!idUrlMap[definitionId]) {
          this.definitionIdCache.delete(definitionId);
        }
      });
      await Promise.all(
        Object.entries(idUrlMap).map(async ([definitionId, serviceUrl]) => {
          const isServiceUp = await this.sonataFlowService.pingWorkflowService({
            definitionId,
            serviceUrl,
          });
          if (isServiceUp) {
            this.definitionIdCache.add(definitionId);
          } else if (this.definitionIdCache.has(definitionId)) {
            this.logger.error(
              `Failed to ping service for workflow ${definitionId} at ${serviceUrl}`,
            );
            this.definitionIdCache.delete(definitionId);
          }
        }),
      );

      const workflowDefinitionIds = this.isEmpty()
        ? 'empty cache'
        : Array.from(this.definitionIdCache).join(', ');

      this.logger.debug(
        `${this.TASK_ID} updated the workflow definition ID cache to: ${workflowDefinitionIds}`,
      );
    } catch (error) {
      this.logger.error(`Error running ${this.TASK_ID}: ${error}`);
      return;
    }
  }
}
