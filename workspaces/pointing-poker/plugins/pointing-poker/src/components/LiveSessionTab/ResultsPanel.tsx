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
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Box, Flex, Text } from '@backstage/ui';
import { CardFace } from './CardFace';
import { CharacterAvatar } from './CharacterAvatar';
import type { ConsensusStatus, VoteAnalysis } from './utils/consensus';

type Banner = Readonly<{
  background: string;
  color: string;
  dot: string;
  label: string;
}>;

type ResultsPanelProps = Readonly<{
  analysis: VoteAnalysis;
  hostName: string;
  isHost: boolean;
}>;

type VoteStackProps = Readonly<{
  bucket: VoteAnalysis['distribution'][number];
  isMode: boolean;
}>;

// Green signals consensus; "discuss" stays a calm, neutral tone — it's a normal
// refinement conversation, not a warning.
const buildBanner = (
  status: ConsensusStatus,
  isHost: boolean,
  hostName: string,
): Banner => {
  if (status === 'discuss') {
    return {
      background: 'var(--bui-bg-neutral-2)',
      color: 'var(--bui-fg-secondary)',
      dot: 'var(--bui-fg-secondary)',
      label: isHost
        ? 'Needs discussion — re-vote or talk it out'
        : `Needs discussion — ${hostName} will re-vote or accept`,
    };
  }
  const lead = status === 'unanimous' ? 'Unanimous' : 'Close enough';
  return {
    background: 'color-mix(in srgb, var(--bui-bg-success) 18%, transparent)',
    color: 'var(--bui-fg-success)',
    dot: 'var(--bui-fg-success)',
    label: isHost
      ? `${lead} — accept and move on`
      : `${lead} — waiting for ${hostName} to accept`,
  };
};

const VoteStack = ({ bucket, isMode }: VoteStackProps) => (
  <Flex align="center" direction="column" gap="2">
    <div
      style={{
        borderRadius: 'var(--bui-radius-3)',
        boxShadow: isMode
          ? '0 0 0 2px #2dd4bf, 0 0 0 4px var(--bui-bg-neutral-1)'
          : undefined,
        height: '4.75rem',
        width: '3rem',
      }}
    >
      <CardFace value={bucket.value} />
    </div>
    <div style={{ display: 'flex' }}>
      {bucket.voters.map((voter, index) => (
        <span
          key={voter.userId}
          style={{
            borderRadius: 'var(--bui-radius-full)',
            boxShadow: '0 0 0 2px var(--bui-bg-neutral-1)',
            display: 'inline-flex',
            marginLeft: index === 0 ? 0 : -8,
          }}
          title={voter.userName}
        >
          <CharacterAvatar
            name={voter.userName}
            seed={voter.avatarSeed}
            size={28}
            style={voter.avatarStyle}
          />
        </span>
      ))}
    </div>
  </Flex>
);

export const ResultsPanel = ({
  analysis,
  hostName,
  isHost,
}: ResultsPanelProps) => {
  const banner = buildBanner(analysis.status, isHost, hostName);

  return (
    <Box
      style={{
        background: 'var(--bui-bg-neutral-1)',
        border: '1px solid var(--bui-border-1)',
        borderRadius: 'var(--bui-radius-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--bui-space-4)',
        padding: 'var(--bui-space-4)',
      }}
    >
      <Flex
        align="center"
        gap="2"
        style={{
          background: banner.background,
          borderRadius: 'var(--bui-radius-3)',
          padding: 'var(--bui-space-2) var(--bui-space-3)',
        }}
      >
        {!isHost && (
          <span
            style={{
              background: banner.dot,
              borderRadius: 'var(--bui-radius-full)',
              height: 8,
              width: 8,
            }}
          />
        )}
        <Text
          as="span"
          style={{ color: banner.color }}
          variant="body-small"
          weight="bold"
        >
          {banner.label}
        </Text>
      </Flex>

      <Flex
        align="center"
        justify="center"
        style={{
          flexWrap: 'wrap',
          gap: '1.5rem',
          padding: 'var(--bui-space-2) 0',
        }}
      >
        {/* The played cards, each with the people who chose it stacked below. */}
        <Flex
          align="start"
          justify="center"
          style={{ flexWrap: 'wrap', gap: '1.5rem' }}
        >
          {analysis.distribution.map(bucket => (
            <VoteStack
              bucket={bucket}
              isMode={
                bucket.value === analysis.mode && bucket.voters.length > 1
              }
              key={bucket.value}
            />
          ))}
        </Flex>

        {/* Average — the headline number, kept distinct from the cards. */}
        <Flex
          align="center"
          direction="column"
          gap="1"
          justify="center"
          style={{
            background: 'var(--bui-bg-neutral-1)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-4)',
            minWidth: '6rem',
            padding: 'var(--bui-space-3) var(--bui-space-6)',
          }}
        >
          <Text
            as="div"
            color="secondary"
            style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
            variant="body-x-small"
            weight="bold"
          >
            Average
          </Text>
          <Text
            as="div"
            style={{ fontSize: '1.875rem', lineHeight: 1 }}
            weight="bold"
          >
            {analysis.average ?? '—'}
          </Text>
        </Flex>
      </Flex>

      {analysis.lowOutlier && analysis.highOutlier && (
        <Flex
          align="center"
          style={{
            background: 'var(--bui-bg-neutral-2)',
            borderRadius: 'var(--bui-radius-3)',
            columnGap: '1rem',
            flexWrap: 'wrap',
            padding: 'var(--bui-space-2) var(--bui-space-3)',
            rowGap: '0.25rem',
          }}
        >
          <Flex align="center" gap="1">
            <TrendingDown size={16} style={{ color: 'var(--bui-fg-info)' }} />
            <Text
              as="span"
              variant="body-small"
            >{`${analysis.lowOutlier.userName} · ${analysis.lowOutlier.value}`}</Text>
          </Flex>
          <Flex align="center" gap="1">
            <TrendingUp size={16} style={{ color: 'var(--bui-fg-danger)' }} />
            <Text
              as="span"
              variant="body-small"
            >{`${analysis.highOutlier.userName} · ${analysis.highOutlier.value}`}</Text>
          </Flex>
          <Text as="span" color="secondary" variant="body-small">
            {`${analysis.lowOutlier.userName.split(' ')[0]} & ${
              analysis.highOutlier.userName.split(' ')[0]
            } — what are you each seeing?`}
          </Text>
        </Flex>
      )}
    </Box>
  );
};
