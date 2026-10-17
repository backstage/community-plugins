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
import { useState } from 'react';
import { Box, Card, CardBody, Flex, Text } from '@backstage/ui';
import { AvatarSettings } from './AvatarSettings';
import { TeamQuerySettings } from './TeamQuerySettings';
import { VotingCardsSettings } from './VotingCardsSettings';

type SettingsItemId = 'avatar' | 'team-cards' | 'team-query';

const SECTIONS: ReadonlyArray<{
  items: ReadonlyArray<{ id: SettingsItemId; label: string }>;
  label: string;
}> = [
  {
    items: [
      { id: 'team-query', label: 'Refinement source' },
      { id: 'team-cards', label: 'Voting cards' },
    ],
    label: 'Teams',
  },
  { items: [{ id: 'avatar', label: 'Avatar' }], label: 'Profile' },
];

export const SettingsTab = () => {
  const [active, setActive] = useState<SettingsItemId>('team-query');

  return (
    <Flex
      direction={{ initial: 'column', md: 'row' }}
      gap="6"
      align="start"
      style={{ width: '100%' }}
    >
      <Box style={{ width: '100%', maxWidth: 256, flexShrink: 0 }}>
        <Card>
          <CardBody>
            <Flex direction="column" gap="4">
              {SECTIONS.map(section => (
                <Flex direction="column" gap="1" key={section.label}>
                  <Text
                    variant="body-x-small"
                    weight="bold"
                    color="secondary"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {section.label}
                  </Text>
                  {section.items.map(item => {
                    const selected = active === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActive(item.id)}
                        aria-current={selected}
                        style={{
                          textAlign: 'left',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: 'var(--bui-radius-2)',
                          padding: '6px 10px',
                          background: selected
                            ? 'var(--bui-bg-neutral-2)'
                            : 'transparent',
                          color: selected
                            ? 'var(--bui-fg-primary)'
                            : 'var(--bui-fg-secondary)',
                          font: 'inherit',
                          fontWeight: selected ? 700 : 400,
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </Flex>
              ))}
            </Flex>
          </CardBody>
        </Card>
      </Box>

      <Box style={{ flex: 1, minWidth: 0, width: '100%' }}>
        {active === 'avatar' && <AvatarSettings />}
        {active === 'team-query' && <TeamQuerySettings />}
        {active === 'team-cards' && <VotingCardsSettings />}
      </Box>
    </Flex>
  );
};
