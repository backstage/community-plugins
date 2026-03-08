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
import type {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import type { LlamaStackClient } from './LlamaStackClient';
import type {
  SafetyConfig,
  ShieldInfo,
  ShieldRegistration,
  SafetyViolation,
  RunShieldResponse,
} from '../../types';
import { toErrorMessage } from '../../services/utils';

/**
 * Accessor function that returns the current LlamaStackClient.
 * Allows SafetyService to always use the latest client managed by ClientManager.
 */
export type SafetyClientAccessor = () => LlamaStackClient;

/**
 * Safety Service - Handles guardrails using Llama Stack Safety API
 *
 * Provides:
 * - Input validation (check user messages before processing)
 * - Output filtering (check AI responses before returning)
 *
 * Uses LlamaStackClient (via accessor) for all HTTP communication,
 * ensuring consistent TLS handling and dynamic baseUrl support.
 */
export class SafetyService {
  private readonly logger: LoggerService;
  private readonly config: RootConfigService;
  private readonly getClient?: SafetyClientAccessor;
  private safetyConfig: SafetyConfig | null = null;
  private availableShields: ShieldInfo[] = [];
  private initialized = false;

  constructor(options: {
    logger: LoggerService;
    config: RootConfigService;
    getClient?: SafetyClientAccessor;
  }) {
    this.logger = options.logger;
    this.config = options.config;
    this.getClient = options.getClient;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const llamaStackConfig = this.config.getOptionalConfig(
        'agenticChat.llamaStack',
      );
      if (!llamaStackConfig) {
        this.logger.info(
          'agenticChat.llamaStack not configured, safety service disabled',
        );
        this.initialized = true;
        return;
      }

      this.safetyConfig = this.loadSafetyConfig();

      if (!this.safetyConfig?.enabled) {
        this.logger.info('Safety guardrails are disabled');
        this.initialized = true;
        return;
      }

      if (!this.getClient) {
        this.logger.warn(
          'Safety enabled but no LlamaStackClient accessor provided, shield API calls will fail',
        );
        this.initialized = true;
        return;
      }

      await this.loadAvailableShields();

      this.logger.info(
        `Safety service initialized with ${this.availableShields.length} shield(s) available`,
      );
      this.initialized = true;
    } catch (error) {
      this.logger.warn(
        `Failed to initialize safety service: ${toErrorMessage(
          error,
        )}. Safety checks will be skipped.`,
      );
      this.safetyConfig = null;
      this.initialized = true;
    }
  }

  private loadSafetyConfig(): SafetyConfig | null {
    try {
      const safetyConfig = this.config.getOptionalConfig('agenticChat.safety');
      if (!safetyConfig) {
        return { enabled: false };
      }

      const registerShieldsConfig =
        safetyConfig.getOptionalConfigArray('registerShields');
      const registerShields: ShieldRegistration[] = [];

      if (registerShieldsConfig) {
        for (const shieldConfig of registerShieldsConfig) {
          registerShields.push({
            shieldId: shieldConfig.getString('shieldId'),
            providerId: shieldConfig.getString('providerId'),
            providerShieldId: shieldConfig.getString('providerShieldId'),
          });
        }
      }

      const onErrorValue = safetyConfig.getOptionalString('onError');
      const onError: 'allow' | 'block' =
        onErrorValue === 'allow' ? 'allow' : 'block';

      return {
        enabled: safetyConfig.getOptionalBoolean('enabled') ?? false,
        inputShields: safetyConfig.getOptionalStringArray('inputShields'),
        outputShields: safetyConfig.getOptionalStringArray('outputShields'),
        registerShields:
          registerShields.length > 0 ? registerShields : undefined,
        onError,
      };
    } catch (error) {
      this.logger.debug('No safety configuration found');
      return { enabled: false };
    }
  }

  /**
   * Fetch available shields from Llama Stack.
   * If none found, attempt to register configured shields.
   */
  private async loadAvailableShields(): Promise<void> {
    try {
      const client = this.getClient!();
      const response = await client.request<
        { data?: ShieldInfo[] } | ShieldInfo[]
      >('/v1/shields', { method: 'GET' });

      const shields = Array.isArray(response) ? response : response.data || [];
      this.availableShields = shields;

      this.logger.debug(
        `Found ${this.availableShields.length} existing shields`,
      );

      if (this.availableShields.length === 0) {
        this.logger.info(
          'No shields found, attempting to register configured shields...',
        );
        await this.registerConfiguredShields();

        const reloadResponse = await client.request<
          { data?: ShieldInfo[] } | ShieldInfo[]
        >('/v1/shields', { method: 'GET' });
        const reloadedShields = Array.isArray(reloadResponse)
          ? reloadResponse
          : reloadResponse.data || [];
        this.availableShields = reloadedShields;
      }

      if (this.availableShields.length > 0) {
        this.logger.info(
          `Safety shields available: ${this.availableShields
            .map(s => s.identifier)
            .join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Could not load shields: ${toErrorMessage(error)}`);
      this.availableShields = [];
    }
  }

  /**
   * Register safety shields on Llama Stack.
   * Only registers shields that are explicitly configured in registerShields.
   */
  private async registerConfiguredShields(): Promise<void> {
    const shieldsToRegister = this.safetyConfig?.registerShields;

    if (!shieldsToRegister || shieldsToRegister.length === 0) {
      this.logger.info(
        'No shields configured for registration (agenticChat.safety.registerShields). ' +
          'Safety checks will only work with pre-existing shields on the server.',
      );
      return;
    }

    this.logger.info(
      `Attempting to register ${shieldsToRegister.length} configured shield(s)...`,
    );

    const client = this.getClient!();

    for (const shield of shieldsToRegister) {
      try {
        await client.request('/v1/shields/register', {
          method: 'POST',
          body: {
            shield_id: shield.shieldId,
            provider_id: shield.providerId,
            provider_shield_id: shield.providerShieldId,
          },
        });
        this.logger.info(
          `Registered shield: ${shield.shieldId} (provider: ${shield.providerId})`,
        );
      } catch (error) {
        const errorMsg = toErrorMessage(error);
        this.logger.warn(
          `Could not register shield "${shield.shieldId}": ${errorMsg}`,
        );
        this.logger.info(
          `  Make sure the "${shield.providerId}" provider is configured on your Llama Stack server`,
        );
      }
    }
  }

  /**
   * Dynamic overrides from admin panel (EffectiveConfig).
   * When set, these take precedence over the YAML-loaded safetyConfig.
   */
  private dynamicOverrides?: {
    enabled?: boolean;
    inputShields?: string[];
    outputShields?: string[];
    onError?: 'allow' | 'block';
  };

  /**
   * Apply dynamic overrides from EffectiveConfig.
   * Called per-request (or when admin config changes) by the orchestrator/provider.
   */
  applyDynamicOverrides(overrides: {
    safetyEnabled?: boolean;
    inputShields?: string[];
    outputShields?: string[];
    safetyOnError?: 'allow' | 'block';
  }): void {
    if (
      overrides.safetyEnabled !== undefined ||
      overrides.inputShields !== undefined ||
      overrides.outputShields !== undefined ||
      overrides.safetyOnError !== undefined
    ) {
      this.dynamicOverrides = {
        enabled: overrides.safetyEnabled,
        inputShields: overrides.inputShields,
        outputShields: overrides.outputShields,
        onError: overrides.safetyOnError,
      };
    }
  }

  private isEffectivelyEnabled(): boolean {
    if (this.dynamicOverrides?.enabled !== undefined) {
      return this.dynamicOverrides.enabled;
    }
    return this.safetyConfig?.enabled ?? false;
  }

  private getEffectiveInputShields(): string[] | undefined {
    return (
      this.dynamicOverrides?.inputShields ?? this.safetyConfig?.inputShields
    );
  }

  private getEffectiveOutputShields(): string[] | undefined {
    return (
      this.dynamicOverrides?.outputShields ?? this.safetyConfig?.outputShields
    );
  }

  isEnabled(): boolean {
    return this.isEffectivelyEnabled();
  }

  getAvailableShields(): ShieldInfo[] {
    return this.availableShields;
  }

  /**
   * Check user input against input shields.
   * Returns violation if input is blocked, undefined if OK.
   */
  async checkInput(userMessage: string): Promise<SafetyViolation | undefined> {
    if (!this.isEffectivelyEnabled()) {
      return undefined;
    }

    const inputShields = this.getEffectiveInputShields();
    if (!inputShields || inputShields.length === 0) {
      if (this.availableShields.length === 0) {
        return undefined;
      }
      return this.runShield(this.availableShields[0].identifier, userMessage);
    }

    for (const shieldId of inputShields) {
      const violation = await this.runShield(shieldId, userMessage);
      if (violation) {
        this.logger.info(
          `Input blocked by shield ${shieldId}: ${violation.user_message}`,
        );
        return violation;
      }
    }

    return undefined;
  }

  /**
   * Check AI output against output shields.
   * Returns violation if output is blocked, undefined if OK.
   */
  async checkOutput(aiResponse: string): Promise<SafetyViolation | undefined> {
    if (!this.isEffectivelyEnabled()) {
      return undefined;
    }

    const outputShields = this.getEffectiveOutputShields();
    if (!outputShields || outputShields.length === 0) {
      return undefined;
    }

    for (const shieldId of outputShields) {
      const violation = await this.runShield(shieldId, aiResponse);
      if (violation) {
        this.logger.info(
          `Output blocked by shield ${shieldId}: ${violation.user_message}`,
        );
        return violation;
      }
    }

    return undefined;
  }

  /**
   * Run a specific shield against content via POST /v1/safety/run-shield.
   *
   * On API error the behavior depends on onError config:
   * - 'block': Return a synthetic violation (fail-closed, secure default)
   * - 'allow': Return undefined to let the message through (fail-open)
   */
  private async runShield(
    shieldId: string,
    content: string,
  ): Promise<SafetyViolation | undefined> {
    if (!this.getClient) {
      this.logger.warn(
        `Cannot run shield ${shieldId}: no LlamaStackClient accessor`,
      );
      return this.handleShieldError(
        shieldId,
        'No LlamaStackClient accessor available',
      );
    }

    try {
      const client = this.getClient();
      const response = await client.request<RunShieldResponse>(
        '/v1/safety/run-shield',
        {
          method: 'POST',
          body: {
            shield_id: shieldId,
            messages: [{ role: 'user', content }],
          },
        },
      );

      return response.violation ?? undefined;
    } catch (error) {
      const errorMsg = toErrorMessage(error);
      this.logger.warn(`Failed to run shield ${shieldId}: ${errorMsg}`);
      return this.handleShieldError(shieldId, errorMsg);
    }
  }

  private getEffectiveOnError(): 'allow' | 'block' {
    return (
      this.dynamicOverrides?.onError ?? this.safetyConfig?.onError ?? 'block'
    );
  }

  private handleShieldError(
    shieldId: string,
    errorMsg: string,
  ): SafetyViolation | undefined {
    const onError = this.getEffectiveOnError();

    if (onError === 'block') {
      this.logger.warn(
        `Safety check failed for shield ${shieldId} - blocking message (onError: block)`,
      );
      return {
        violation_level: 'error',
        user_message: `Safety check unavailable. Message blocked for security. (Shield: ${shieldId})`,
        metadata: { error: errorMsg, shield_id: shieldId },
      };
    }

    this.logger.warn(
      `Safety check failed for shield ${shieldId} - allowing message (onError: allow)`,
    );
    return undefined;
  }
}
