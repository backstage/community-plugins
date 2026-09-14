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
import { useEffect, useRef, useState } from 'react';
import { Check, Info, Play, TriangleAlert } from 'lucide-react';
import {
  Alert,
  Box,
  Button,
  ButtonIcon,
  Card,
  CardBody,
  Flex,
  Select,
  SelectItem,
  Skeleton,
  Text,
} from '@backstage/ui';
import type { Ticket } from '@backstage-community/plugin-pointing-poker-common';
import { useJira } from '../LiveSessionTab/hooks/useJira';
import { useSessionApi } from '../LiveSessionTab/hooks/useSessionApi';
import { useTeamMembers } from '../LiveSessionTab/hooks/useTeamMembers';
import { buildDefaultJql } from '../LiveSessionTab/utils/jql';
import { formatRelativeShort } from '../LiveSessionTab/utils/relativeTime';

type RunState = 'error' | 'idle' | 'loading' | 'provider-missing' | 'ready';

type Status = {
  color: string;
  icon: 'alert' | 'check' | 'info' | null;
  text: string;
};

export const TeamQuerySettings = () => {
  const { loading: teamsLoading, userTeams } = useTeamMembers('');
  const jira = useJira();
  const { getTeamQuery, saveTeamQuery } = useSessionApi();
  const apiRef = useRef({ ...jira, getTeamQuery });
  apiRef.current = { ...jira, getTeamQuery };

  const teams = userTeams ?? [];

  const [teamRef, setTeamRef] = useState('');
  const [jql, setJql] = useState('');
  const [rows, setRows] = useState<Ticket[]>([]);
  const [state, setState] = useState<RunState>('loading');
  const [error, setError] = useState<null | string>(null);
  const [ranJql, setRanJql] = useState<null | string>(null);
  const [savedJql, setSavedJql] = useState<null | string>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!teamRef && userTeams && userTeams.length > 0) {
      setTeamRef(userTeams[0].ref);
    }
  }, [teamRef, userTeams]);

  useEffect(() => {
    if (!teamRef) {
      return undefined;
    }
    let active = true;
    const load = async () => {
      setState('loading');
      setError(null);
      const saved = await apiRef.current.getTeamQuery(teamRef);
      const initial =
        saved ?? buildDefaultJql(await apiRef.current.getProjectKey(teamRef));
      if (!active) {
        return;
      }
      setJql(initial);
      setSavedJql(saved);
      const provider = await apiRef.current.getProvider();
      if (!active) {
        return;
      }
      if (!provider.id) {
        setRows([]);
        setRanJql(null);
        setState('provider-missing');
        return;
      }
      if (!saved) {
        setRows([]);
        setRanJql(null);
        setState('ready');
        return;
      }
      try {
        const issues = await apiRef.current.runJql(initial);
        if (active) {
          setRows(issues);
          setRanJql(initial);
          setState('idle');
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Query failed');
          setState('error');
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [teamRef]);

  const handleRun = async () => {
    setState('loading');
    setError(null);
    try {
      const provider = await apiRef.current.getProvider();
      if (!provider.id) {
        setRows([]);
        setRanJql(null);
        setState('provider-missing');
        return;
      }
      const issues = await apiRef.current.runJql(jql);
      setRows(issues);
      setRanJql(jql);
      setState('idle');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Query failed');
      setState('error');
    }
  };

  const handleSave = async () => {
    if (!teamRef) {
      return;
    }
    setSaving(true);
    try {
      await saveTeamQuery(teamRef, jql);
      setSavedJql(jql);
    } finally {
      setSaving(false);
    }
  };

  const stale = state === 'idle' && ranJql !== null && ranJql !== jql;
  const isSaved = savedJql === jql;
  const hasRows = rows.length > 0;

  const status: Status = (() => {
    if (state === 'loading') {
      return { color: 'var(--bui-fg-secondary)', icon: null, text: 'Testing…' };
    }
    if (state === 'ready') {
      return {
        color: 'var(--bui-fg-secondary)',
        icon: 'info',
        text: 'Edit the query and run it to preview matching tickets',
      };
    }
    if (state === 'provider-missing') {
      return {
        color: 'var(--bui-fg-warning)',
        icon: 'info',
        text: 'Configure Jira to run and preview this query',
      };
    }
    if (state === 'error') {
      return {
        color: 'var(--bui-fg-danger)',
        icon: 'alert',
        text: error ?? 'Query failed',
      };
    }
    if (stale) {
      return {
        color: 'var(--bui-fg-warning)',
        icon: 'alert',
        text: 'Query edited — run it to refresh the preview',
      };
    }
    if (!hasRows) {
      return {
        color: 'var(--bui-fg-secondary)',
        icon: 'info',
        text: '0 tickets — nothing matches yet',
      };
    }
    return {
      color: 'var(--bui-fg-success)',
      icon: 'check',
      text: `${rows.length} ticket${rows.length === 1 ? '' : 's'} match · live`,
    };
  })();

  const previewLabel = (() => {
    if (stale) {
      return 'last run';
    }
    if (ranJql !== null && ranJql === savedJql) {
      return 'saved query';
    }
    return 'unsaved query';
  })();

  if (teamsLoading && teams.length === 0) {
    return (
      <Card>
        <CardBody>
          <Text color="secondary">Loading teams…</Text>
        </CardBody>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardBody>
          <Flex direction="column" gap="1">
            <Text as="h2" variant="title-medium" weight="bold">
              Refinement source
            </Text>
            <Text color="secondary">You are not a member of any team yet.</Text>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="h2" variant="title-medium" weight="bold">
              Refinement source
            </Text>
            <Text as="p" color="secondary">
              The JQL that sources which stories to refine. Saved per team — set
              one for each team you belong to. New sessions start from it.
            </Text>
          </Box>

          <Box style={{ maxWidth: 384 }}>
            <Select
              label="Team"
              selectedKey={teamRef}
              onSelectionChange={key => setTeamRef(String(key))}
            >
              {teams.map(team => (
                <SelectItem key={team.ref} id={team.ref} textValue={team.name}>
                  {team.name}
                </SelectItem>
              ))}
            </Select>
          </Box>

          <Box
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            <Box>
              <Text variant="body-small" weight="bold">
                JQL
              </Text>
              <Box style={{ position: 'relative', marginTop: 4 }}>
                <textarea
                  value={jql}
                  spellCheck={false}
                  onChange={event => setJql(event.target.value)}
                  style={{
                    height: 320,
                    width: '100%',
                    resize: 'vertical',
                    borderRadius: 'var(--bui-radius-3)',
                    border: '1px solid var(--bui-border-1)',
                    background: 'var(--bui-bg-neutral-1)',
                    color: 'var(--bui-fg-primary)',
                    padding: 12,
                    paddingRight: 48,
                    fontFamily: 'var(--bui-font-monospace)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <Box style={{ position: 'absolute', top: 8, right: 8 }}>
                  <ButtonIcon
                    icon={<Play size={16} />}
                    variant="tertiary"
                    size="medium"
                    isDisabled={state === 'loading'}
                    onClick={handleRun}
                    aria-label="Run query"
                    style={{
                      background: 'transparent',
                      borderColor: 'transparent',
                      color: 'var(--bui-fg-success)',
                    }}
                  />
                </Box>
              </Box>
              <Flex
                align="center"
                gap="1"
                style={{ marginTop: 8, color: status.color }}
              >
                {status.icon === 'check' && <Check size={16} />}
                {status.icon === 'alert' && <TriangleAlert size={16} />}
                {status.icon === 'info' && <Info size={16} />}
                <Text variant="body-small" style={{ color: 'inherit' }}>
                  {status.text}
                </Text>
              </Flex>
            </Box>

            <Box>
              <Flex
                align="center"
                justify="between"
                style={{ marginBottom: 4 }}
              >
                <Text variant="body-small" color="secondary">
                  Preview ·{' '}
                  <Text as="span" variant="body-small" weight="bold">
                    {previewLabel}
                  </Text>
                </Text>
                {state === 'idle' && (
                  <Text variant="body-small" color="secondary">
                    {`${rows.length} found`}
                  </Text>
                )}
              </Flex>

              <Box
                style={{
                  height: 320,
                  overflowY: 'auto',
                  borderRadius: 'var(--bui-radius-3)',
                  border: '1px solid var(--bui-border-1)',
                }}
              >
                {state === 'loading' && (
                  <Flex direction="column" gap="2" p="4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} width="100%" height={24} />
                    ))}
                  </Flex>
                )}
                {state === 'ready' && (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="1"
                    p="4"
                    style={{ height: '100%' }}
                  >
                    <Info
                      size={20}
                      style={{ color: 'var(--bui-fg-secondary)' }}
                    />
                    <Text variant="body-small" color="secondary">
                      Run the query to preview matching tickets.
                    </Text>
                  </Flex>
                )}
                {state === 'provider-missing' && (
                  <Flex direction="column" gap="3" p="4">
                    <Alert
                      status="warning"
                      icon
                      title="Action required: connect Jira"
                      description="Ticket previews and refinement sessions cannot load stories until a ticket provider is configured."
                    />
                    <Text as="p" variant="body-small" weight="bold">
                      1. Configure the Jira host in app-config.yaml
                    </Text>
                    <Box
                      style={{
                        background: 'var(--bui-bg-neutral-1)',
                        border: '1px solid var(--bui-border-1)',
                        borderRadius: 'var(--bui-radius-3)',
                        fontFamily: 'var(--bui-font-monospace)',
                        fontSize: 12,
                        overflowX: 'auto',
                        padding: 12,
                        whiteSpace: 'pre',
                      }}
                    >
                      {
                        'pointingPoker:\n  jira:\n    host: https://your-company.atlassian.net'
                      }
                    </Box>
                    <Text as="p" variant="body-small" weight="bold">
                      2. Export your Jira credentials
                    </Text>
                    <Box
                      style={{
                        background: 'var(--bui-bg-neutral-1)',
                        border: '1px solid var(--bui-border-1)',
                        borderRadius: 'var(--bui-radius-3)',
                        fontFamily: 'var(--bui-font-monospace)',
                        fontSize: 12,
                        overflowX: 'auto',
                        padding: 12,
                        whiteSpace: 'pre',
                      }}
                    >
                      {
                        'export JIRA_USER_EMAIL=you@company.com\nexport JIRA_API_TOKEN=your-api-token'
                      }
                    </Box>
                    <Text as="p" variant="body-small" weight="bold">
                      3. Restart yarn start
                    </Text>
                    <Text as="p" variant="body-small">
                      Jira is enabled automatically after both credentials are
                      available to the backend.
                    </Text>
                  </Flex>
                )}
                {state === 'error' && (
                  <Box p="4">
                    <Text variant="body-small" color="danger">
                      {error ?? 'Query failed'}
                    </Text>
                  </Box>
                )}
                {state === 'idle' && !hasRows && (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="1"
                    p="4"
                    style={{ height: '100%' }}
                  >
                    <Info
                      size={20}
                      style={{ color: 'var(--bui-fg-secondary)' }}
                    />
                    <Text variant="body-small" color="secondary">
                      No tickets match — loosen the query.
                    </Text>
                  </Flex>
                )}
                {state === 'idle' &&
                  hasRows &&
                  rows.map(issue => (
                    <Flex
                      key={issue.key}
                      gap="3"
                      p="3"
                      style={{ borderBottom: '1px solid var(--bui-border-1)' }}
                    >
                      {issue.typeIconUrl && (
                        <img
                          alt={issue.type ?? ''}
                          title={issue.type}
                          src={issue.typeIconUrl}
                          style={{
                            marginTop: 2,
                            height: 16,
                            width: 16,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <a
                          href={issue.url ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          title={issue.summary}
                          style={{
                            color: 'var(--bui-fg-primary)',
                            textDecoration: 'none',
                            fontSize: 15,
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {issue.summary}
                        </a>
                        <Flex
                          align="center"
                          gap="2"
                          style={{
                            marginTop: 4,
                            color: 'var(--bui-fg-secondary)',
                          }}
                        >
                          <Text
                            variant="body-x-small"
                            style={{
                              color: 'inherit',
                              fontFamily: 'var(--bui-font-monospace)',
                            }}
                          >
                            {issue.key}
                          </Text>
                          {issue.sprint && (
                            <Text
                              variant="body-x-small"
                              style={{ color: 'inherit' }}
                            >
                              · {issue.sprint}
                            </Text>
                          )}
                          {issue.created && (
                            <Text
                              variant="body-x-small"
                              style={{ color: 'inherit' }}
                              title={new Date(issue.created).toLocaleString()}
                            >
                              · {formatRelativeShort(issue.created)}
                            </Text>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                  ))}
              </Box>
            </Box>
          </Box>

          <Flex align="center" gap="3">
            <Button
              variant="primary"
              isDisabled={saving || isSaved}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save query'}
            </Button>
            {isSaved && !saving && (
              <Flex
                align="center"
                gap="1"
                style={{ color: 'var(--bui-fg-success)' }}
              >
                <Check size={16} />
                <Text variant="body-small" style={{ color: 'inherit' }}>
                  Saved as the team default
                </Text>
              </Flex>
            )}
            {!isSaved && !saving && (
              <Text variant="body-small" color="secondary">
                Unsaved changes
              </Text>
            )}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};
