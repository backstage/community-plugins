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
import { createBackend } from '@backstage/backend-defaults';

/**
 * Agentic Chat Backend Development Server
 *
 * Supports both Guest auth and Keycloak OIDC.
 * Configure auth.providers.oidc in app-config.yaml for Keycloak.
 */

const backend = createBackend();

// Add auth backend for authentication
// This enables the auth providers configured in app-config.yaml
backend.add(import('@backstage/plugin-auth-backend'));
// Add guest provider for development (works without session middleware)
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// Add OIDC provider module for Keycloak integration (requires RHDH for full functionality)
backend.add(import('@backstage/plugin-auth-backend-module-oidc-provider'));

// Add Agentic Chat plugin
backend.add(import('../src'));

backend.start();
