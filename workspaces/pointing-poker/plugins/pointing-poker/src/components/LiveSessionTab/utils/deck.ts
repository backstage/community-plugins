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
import { FIBONACCI_VALUES } from '../types';

export const NUMERIC_DECK: number[] = FIBONACCI_VALUES.map(Number).filter(
  n => !Number.isNaN(n),
);

// Bounded accept options around a suggested value: the suggestion plus its
// immediate deck neighbours (one step lower / higher) where they exist. "One
// step" follows the deck sequence, not arithmetic — from 5 that's 3 and 8.
export const acceptChoices = (suggested: string): string[] => {
  const index = NUMERIC_DECK.findIndex(value => String(value) === suggested);
  if (index === -1) {
    return [suggested];
  }

  const choices: number[] = [];
  if (index > 0) {
    choices.push(NUMERIC_DECK[index - 1]);
  }
  choices.push(NUMERIC_DECK[index]);
  if (index < NUMERIC_DECK.length - 1) {
    choices.push(NUMERIC_DECK[index + 1]);
  }
  return choices.map(String);
};
