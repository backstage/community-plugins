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
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Skeleton,
  Table,
  CellText,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from '@backstage/ui';
import {
  MCPPromptInfo,
  MCPResourceInfo,
  MCPServerSpec,
  MCPToolInfo,
} from '@backstage-community/plugin-mcp-capabilities-common';
import { mcpCapabilitiesApiRef } from '../api';
import { SchemaTable } from './SchemaTable';
import { Markdown } from './Markdown';

function toolHints(tool: MCPToolInfo): string[] {
  const a = tool.annotations ?? {};
  const hints: string[] = [];
  if (a.readOnlyHint) hints.push('read-only');
  if (a.destructiveHint) hints.push('destructive');
  if (a.idempotentHint) hints.push('idempotent');
  if (a.openWorldHint) hints.push('open-world');
  return hints;
}

function ToolsPanel(props: { tools: MCPToolInfo[] }) {
  if (props.tools.length === 0) {
    return (
      <Text variant="body-medium" color="secondary">
        This server exposes no tools.
      </Text>
    );
  }
  return (
    <Flex direction="column" gap="4">
      {props.tools.map(tool => (
        <Card key={tool.name}>
          <CardHeader>
            <Flex gap="2" align="center">
              <Text variant="title-small">{tool.name}</Text>
              {toolHints(tool).map(h => (
                <Badge key={h}>{h}</Badge>
              ))}
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap="4">
              {tool.description && <Markdown>{tool.description}</Markdown>}
              <Flex direction="column" gap="2">
                <Text variant="body-small" color="secondary">
                  Input parameters
                </Text>
                <SchemaTable schema={tool.inputSchema} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
}

function ResourcesPanel(props: { resources: MCPResourceInfo[] }) {
  if (props.resources.length === 0) {
    return (
      <Text variant="body-medium" color="secondary">
        This server exposes no resources.
      </Text>
    );
  }
  return (
    <Flex direction="column" gap="4">
      {props.resources.map(resource => (
        <Card key={resource.uri}>
          <CardHeader>
            <Flex gap="2" align="center">
              <Text variant="title-small">{resource.name || resource.uri}</Text>
              {resource.mimeType && <Badge>{resource.mimeType}</Badge>}
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap="4">
              {resource.description && (
                <Markdown>{resource.description}</Markdown>
              )}
              <Flex direction="column" gap="1">
                <Text variant="body-small" color="secondary">
                  URI
                </Text>
                <Text variant="body-medium">{resource.uri}</Text>
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
}

function PromptArgsTable(props: {
  args: NonNullable<MCPPromptInfo['arguments']>;
}) {
  return (
    <Table<{ id: string; name: string; required: string; description: string }>
      data={props.args.map(a => ({
        id: a.name,
        name: a.name,
        required: a.required ? 'required' : '',
        description: a.description ?? '',
      }))}
      pagination={{ type: 'none' }}
      columnConfig={[
        {
          id: 'name',
          label: 'Argument',
          isRowHeader: true,
          cell: r => <CellText title={r.name} />,
        },
        {
          id: 'required',
          label: 'Required',
          cell: r => <CellText title={r.required} />,
        },
        {
          id: 'description',
          label: 'Description',
          cell: r => <CellText title={r.description} />,
        },
      ]}
    />
  );
}

function PromptsPanel(props: { prompts: MCPPromptInfo[] }) {
  if (props.prompts.length === 0) {
    return (
      <Text variant="body-medium" color="secondary">
        This server exposes no prompts.
      </Text>
    );
  }
  return (
    <Flex direction="column" gap="4">
      {props.prompts.map(prompt => {
        const args = prompt.arguments ?? [];
        return (
          <Card key={prompt.name}>
            <CardHeader>
              <Text variant="title-small">{prompt.name}</Text>
            </CardHeader>
            <CardBody>
              <Flex direction="column" gap="4">
                {prompt.description && (
                  <Markdown>{prompt.description}</Markdown>
                )}
                <Flex direction="column" gap="2">
                  <Text variant="body-small" color="secondary">
                    Arguments
                  </Text>
                  {args.length > 0 ? (
                    <PromptArgsTable args={args} />
                  ) : (
                    <Text variant="body-medium" color="secondary">
                      No arguments.
                    </Text>
                  )}
                </Flex>
              </Flex>
            </CardBody>
          </Card>
        );
      })}
    </Flex>
  );
}

/**
 * Entity content (a "Capabilities" tab) for native `mcp-server` API entities. Fetches
 * the live spec from the discovery backend and renders tools, resources, and
 * prompts in pure BUI.
 */
export function MCPToolsContent() {
  const { entity } = useEntity();
  const mcpApi = useApi(mcpCapabilitiesApiRef);
  const entityRef = stringifyEntityRef(entity);

  const [spec, setSpec] = useState<MCPServerSpec | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    mcpApi
      .getServerSpec(entityRef)
      .then(result => {
        if (active) setSpec(result);
      })
      .catch(err => {
        if (active) setError(err as Error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mcpApi, entityRef]);

  if (loading) {
    return <Skeleton style={{ height: 200 }} />;
  }
  if (error) {
    return (
      <Text variant="body-medium" color="danger">
        Failed to load MCP spec: {error.message}
      </Text>
    );
  }
  if (!spec) {
    return null;
  }

  return (
    <Tabs>
      <TabList aria-label="MCP server spec">
        <Tab id="tools">Tools ({spec.tools.length})</Tab>
        <Tab id="resources">Resources ({spec.resources.length})</Tab>
        <Tab id="prompts">Prompts ({spec.prompts.length})</Tab>
      </TabList>
      <TabPanel id="tools">
        <ToolsPanel tools={spec.tools} />
      </TabPanel>
      <TabPanel id="resources">
        <ResourcesPanel resources={spec.resources} />
      </TabPanel>
      <TabPanel id="prompts">
        <PromptsPanel prompts={spec.prompts} />
      </TabPanel>
    </Tabs>
  );
}
