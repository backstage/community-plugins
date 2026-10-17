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
import { Flex } from '@backstage/ui';
import { CardFace } from './CardFace';
import { CharacterAvatar } from './CharacterAvatar';
import {
  FIBONACCI_VALUES,
  type FibonacciValue,
  type TableParticipant,
} from './types';

type PlayingCardProps = Readonly<{
  onSelect: () => void;
  selected: boolean;
  value: FibonacciValue;
}>;

type VotingCardsProps = Readonly<{
  // The card values this team votes with. When omitted the full deck is shown.
  allowedValues?: ReadonlyArray<string>;
  currentParticipant?: TableParticipant;
  onVote: (value: FibonacciValue) => void;
  selectedVote: FibonacciValue | null;
}>;

// The blue face + lift already signal the pick — no extra ring needed.
const PlayingCard = ({ onSelect, selected, value }: PlayingCardProps) => (
  <button
    aria-pressed={selected}
    onClick={onSelect}
    style={{
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--bui-radius-3)',
      boxShadow: selected
        ? 'var(--bui-shadow-3, 0 8px 16px rgba(0,0,0,0.18))'
        : 'var(--bui-shadow-1, 0 1px 2px rgba(0,0,0,0.1))',
      cursor: 'pointer',
      flexShrink: 0,
      height: '4.75rem',
      padding: 0,
      transform: selected ? 'translateY(-0.375rem)' : undefined,
      transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
      width: '3rem',
    }}
    type="button"
  >
    <CardFace selected={selected} value={value} />
  </button>
);

export const VotingCards = ({
  allowedValues,
  currentParticipant,
  onVote,
  selectedVote,
}: VotingCardsProps) => {
  // Restrict the deck to the team's chosen cards; fall back to the full deck if
  // the team has no config or the filter would leave nothing votable.
  const values =
    allowedValues && allowedValues.length > 0
      ? FIBONACCI_VALUES.filter(value => allowedValues.includes(String(value)))
      : FIBONACCI_VALUES;
  const deck = values.length > 0 ? values : FIBONACCI_VALUES;

  return (
    <Flex align="center" gap="4" style={{ flexShrink: 0 }}>
      {currentParticipant && (
        <CharacterAvatar
          name={currentParticipant.userName}
          seed={currentParticipant.avatarSeed}
          size={40}
          style={currentParticipant.avatarStyle}
        />
      )}
      <Flex gap="2" style={{ flexShrink: 0 }}>
        {deck.map(value => (
          <PlayingCard
            key={value}
            onSelect={() => onVote(value)}
            selected={selectedVote === value}
            value={value}
          />
        ))}
      </Flex>
    </Flex>
  );
};
