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
import type { CSSProperties } from 'react';

type CardFaceProps = {
  selected?: boolean;
  value?: number | string;
};

const face = (selected: boolean): CSSProperties => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  userSelect: 'none',
  borderRadius: 'var(--bui-radius-3)',
  border: selected ? '1px solid #2563eb' : '1px solid var(--bui-border-1)',
  background: selected
    ? 'linear-gradient(to bottom right, #3b82f6, #2563eb)'
    : 'linear-gradient(to bottom right, var(--bui-bg-neutral-1), var(--bui-bg-neutral-2))',
  color: selected ? '#ffffff' : 'var(--bui-fg-primary)',
});

const corner: CSSProperties = {
  position: 'absolute',
  fontSize: 10,
  fontWeight: 700,
  lineHeight: 1,
};

export const CardFace = ({ selected = false, value }: CardFaceProps) => (
  <div style={face(selected)}>
    <span style={{ ...corner, top: 4, left: 6 }}>{value ?? ''}</span>
    <span
      style={{
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '-0.01em',
      }}
    >
      {value ?? ''}
    </span>
    <span
      style={{ ...corner, bottom: 4, right: 6, transform: 'rotate(180deg)' }}
    >
      {value ?? ''}
    </span>
  </div>
);
