/*
 * Copyright 2026 The Backstage Authors
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
import { useEntity } from '@backstage/plugin-catalog-react';
import { Badge, Card, CardBody, CardHeader, Flex, Text } from '@backstage/ui';
import {
  MCPCapabilities,
  MCPServerInfo,
  selectMcpServerRemote,
} from '@backstage-community/plugin-mcp-capabilities-common';

interface EnrichedSpec {
  lifecycle?: string;
  capabilities?: MCPCapabilities;
  serverInfo?: MCPServerInfo;
  toolCount?: number;
  resourceCount?: number;
  promptCount?: number;
}

function Field(props: { label: string; value: string }) {
  return (
    <Flex direction="column" gap="1">
      <Text variant="body-small" color="secondary">
        {props.label}
      </Text>
      <Text variant="body-medium">{props.value}</Text>
    </Flex>
  );
}

/**
 * Overview card for a native `mcp-server` API entity. Reads the summary the
 * discovery processor persisted onto the entity spec — no network call.
 */
export function MCPServerOverviewCard() {
  const { entity } = useEntity();
  const spec = (entity.spec ?? {}) as EnrichedSpec;
  const caps = spec.capabilities ?? {};
  const remote = selectMcpServerRemote(entity);

  const capabilityBadges = (
    [
      ['Tools', caps.tools],
      ['Resources', caps.resources],
      ['Prompts', caps.prompts],
    ] as const
  )
    .filter(([, on]) => on)
    .map(([label]) => <Badge key={label}>{label}</Badge>);

  return (
    <Card>
      <CardHeader>
        <Text variant="title-small">MCP Server Info</Text>
      </CardHeader>
      <CardBody>
        <Flex direction="column" gap="4">
          {spec.serverInfo?.name && (
            <Field
              label="Server"
              value={`${spec.serverInfo.name}${
                spec.serverInfo.version ? ` v${spec.serverInfo.version}` : ''
              }`}
            />
          )}

          <Flex direction="column" gap="1">
            <Text variant="body-small" color="secondary">
              Capabilities
            </Text>
            <Flex gap="2">
              {capabilityBadges.length > 0 ? (
                capabilityBadges
              ) : (
                <Text variant="body-medium" color="secondary">
                  Not yet discovered.
                </Text>
              )}
            </Flex>
          </Flex>

          <Flex gap="6">
            <Field label="Tools" value={String(spec.toolCount ?? 0)} />
            <Field label="Resources" value={String(spec.resourceCount ?? 0)} />
            <Field label="Prompts" value={String(spec.promptCount ?? 0)} />
          </Flex>

          {spec.lifecycle && <Field label="Lifecycle" value={spec.lifecycle} />}
          {remote?.type && <Field label="Transport" value={remote.type} />}
          {remote?.url && <Field label="Endpoint" value={remote.url} />}
        </Flex>
      </CardBody>
    </Card>
  );
}
