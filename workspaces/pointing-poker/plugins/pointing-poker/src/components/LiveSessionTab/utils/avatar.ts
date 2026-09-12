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
import { avataaars, personas } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

const STYLES = { avataaars, personas } as const;

// 'photo' is a virtual style: instead of a generated character, the seed holds
// the player's real profile-picture URL (rendered directly by CharacterAvatar).
export type AvatarStyle = 'photo' | keyof typeof STYLES;

export type Character = Readonly<{
  seed: string;
  style: AvatarStyle;
}>;

const DEFAULT_AVATAR_STYLE: AvatarStyle = 'avataaars';

// Keep every character upbeat: no "pacifier" (stuff in mouth) and no "frown"
// (sad). Constraining it here keeps those out of every avatar, now and future.
const ALLOWED_MOUTHS = [
  'bigSmile',
  'lips',
  'smile',
  'smirk',
  'surprise',
] as const;

// A fixed cast of poker-themed characters players can pick from. Avatars are
// deterministic from the seed, so the same choice always renders identically.
export const CHARACTERS: Character[] = [
  'PokerAce',
  'BluffMaster',
  'RiverKing',
  'BotBluffer',
  'ChipDroid',
  'MechDealer',
  'SharkBite',
  'PokerPanda',
  'FoxFlush',
  'WolfAllIn',
  'PikachuBluff',
  'CharizardFold',
  'SnorlaxStack',
  'MewtwoRaise',
  'AlienAnte',
  'SpaceJoker',
  'GlitchGoblin',
  'HighRoller',
  'DonkeyTilt',
  'NinjaNuts',
  'VikingVillain',
  'WizardWager',
  'SteampunkStake',
  'GhostBluff',
  'DragonDealer',
  'SamuraiStack',
  'ClownCall',
  'CaptainChip',
  'LegendaryLimp',
].map(seed => ({ seed, style: DEFAULT_AVATAR_STYLE }));

// Soft, varied backdrops so every hair colour (incl. white/grey) stays legible
// instead of blending into a flat grey tile.
const BACKGROUND_COLORS = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'ffdfbf',
  'c8e6c9',
];

export const createAvatarDataUri = (style: string, seed: string): string => {
  // Legacy participants may still carry the 'personas' style; everything new is
  // avataaars. The mouth constraint is personas-specific.
  if (style === 'personas') {
    return createAvatar(personas, {
      backgroundColor: BACKGROUND_COLORS,
      backgroundType: ['solid'],
      mouth: [...ALLOWED_MOUTHS],
      seed,
    }).toDataUri();
  }
  return createAvatar(avataaars, {
    backgroundColor: BACKGROUND_COLORS,
    backgroundType: ['solid'],
    seed,
  }).toDataUri();
};

export const surpriseMe = (exclude?: Character): Character => {
  const pool = exclude
    ? CHARACTERS.filter(
        c => !(c.seed === exclude.seed && c.style === exclude.style),
      )
    : CHARACTERS;

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};
