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
export type TeamColor = Readonly<{
  border: string;
  chipBg: string;
  chipText: string;
  dot: string;
}>;

const PALETTE: TeamColor[] = [
  { border: '#3b82f6', chipBg: '#dbeafe', chipText: '#1d4ed8', dot: '#3b82f6' },
  { border: '#10b981', chipBg: '#d1fae5', chipText: '#047857', dot: '#10b981' },
  { border: '#8b5cf6', chipBg: '#ede9fe', chipText: '#6d28d9', dot: '#8b5cf6' },
  { border: '#06b6d4', chipBg: '#cffafe', chipText: '#0e7490', dot: '#06b6d4' },
  { border: '#0ea5e9', chipBg: '#e0f2fe', chipText: '#0369a1', dot: '#0ea5e9' },
  { border: '#6366f1', chipBg: '#e0e7ff', chipText: '#4338ca', dot: '#6366f1' },
  { border: '#14b8a6', chipBg: '#ccfbf1', chipText: '#0f766e', dot: '#14b8a6' },
];

const hash = (value: string): number =>
  Array.from(value).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) | 0,
    0,
  );

export const teamColor = (teamRef: string): TeamColor =>
  PALETTE[Math.abs(hash(teamRef)) % PALETTE.length];
