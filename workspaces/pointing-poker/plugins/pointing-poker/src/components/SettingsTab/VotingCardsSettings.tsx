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
import { Check } from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Select,
  SelectItem,
  Text,
} from '@backstage/ui';
import { CardFace } from '../LiveSessionTab/CardFace';
import { useSessionApi } from '../LiveSessionTab/hooks/useSessionApi';
import { useTeamMembers } from '../LiveSessionTab/hooks/useTeamMembers';
import { FIBONACCI_VALUES } from '../LiveSessionTab/types';

const MIN_CARDS = 2;

const ALL_CARDS: ReadonlyArray<string> = FIBONACCI_VALUES.map(String);

const keyOf = (enabled: ReadonlySet<string>): string =>
  ALL_CARDS.filter(value => enabled.has(value)).join(',');

export const VotingCardsSettings = () => {
  const { loading: teamsLoading, userTeams } = useTeamMembers('');
  const { getTeamCards, saveTeamCards } = useSessionApi();

  const teams = userTeams ?? [];

  const [teamRef, setTeamRef] = useState('');
  const [enabled, setEnabled] = useState<ReadonlySet<string>>(
    new Set(ALL_CARDS),
  );
  const [savedKey, setSavedKey] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    void getTeamCards(teamRef).then(cards => {
      if (!active) {
        return;
      }
      const next = new Set(cards ?? ALL_CARDS);
      setEnabled(next);
      setSavedKey(cards ? keyOf(next) : null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamRef]);

  const toggle = (value: string) =>
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });

  const handleSave = async () => {
    if (!teamRef || enabled.size < MIN_CARDS) {
      return;
    }
    setSaving(true);
    try {
      const cards = ALL_CARDS.filter(value => enabled.has(value));
      await saveTeamCards(teamRef, cards);
      setSavedKey(keyOf(enabled));
    } finally {
      setSaving(false);
    }
  };

  const isSaved = savedKey === keyOf(enabled);
  const tooFew = enabled.size < MIN_CARDS;

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
              Voting cards
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
              Voting cards
            </Text>
            <Text as="p" color="secondary">
              Choose the cards this team votes with. Disabled cards are hidden
              from the deck during a session, leaving more room for the ones you
              use.
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

          {loading ? (
            <Text color="secondary">Loading cards…</Text>
          ) : (
            <Flex gap="3" style={{ flexWrap: 'wrap' }}>
              {ALL_CARDS.map(value => {
                const on = enabled.has(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={on}
                    title={on ? `Disable ${value}` : `Enable ${value}`}
                    onClick={() => toggle(value)}
                    style={{
                      position: 'relative',
                      height: 96,
                      width: 64,
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      opacity: on ? 1 : 0.4,
                      filter: on ? 'none' : 'grayscale(1)',
                      transition: 'opacity 0.15s, filter 0.15s',
                    }}
                  >
                    <CardFace value={value} />
                    {on && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 20,
                          width: 20,
                          borderRadius: 'var(--bui-radius-full)',
                          background: 'var(--bui-bg-solid)',
                          color: 'var(--bui-fg-solid)',
                        }}
                      >
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </Flex>
          )}

          <Flex align="center" gap="3">
            <Button
              variant="primary"
              isDisabled={saving || isSaved || tooFew}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save cards'}
            </Button>
            {tooFew ? (
              <Text variant="body-small" color="warning">
                {`Keep at least ${MIN_CARDS} cards`}
              </Text>
            ) : (
              <Text variant="body-small" color="secondary">
                {isSaved ? `${enabled.size} cards enabled` : 'Unsaved changes'}
              </Text>
            )}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};
