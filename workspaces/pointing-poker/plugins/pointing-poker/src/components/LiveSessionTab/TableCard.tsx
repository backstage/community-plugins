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
import { Layers } from 'lucide-react';
import { CardFace } from './CardFace';
import type { FibonacciValue } from './types';

type TableCardProps = Readonly<{
  faceUp: boolean;
  hasVoted: boolean;
  tiltZ: number;
  value?: FibonacciValue;
}>;

// The card lives inside the already-tilted table surface, so it only needs a
// few degrees of in-plane spin (rotateZ) plus the reveal flip (rotateY).
export const TableCard = ({
  faceUp,
  hasVoted,
  tiltZ,
  value,
}: TableCardProps) => {
  if (!hasVoted) {
    return (
      <div
        style={{
          border: '2px dashed rgba(255,255,255,0.4)',
          borderRadius: 'var(--bui-radius-3)',
          height: 80,
          transform: `rotateZ(${tiltZ}deg)`,
          width: 64,
        }}
      />
    );
  }

  return (
    <div
      style={{
        height: 80,
        position: 'relative',
        transform: `rotateZ(${tiltZ}deg)`,
        transformStyle: 'preserve-3d',
        width: 64,
      }}
    >
      <div
        aria-hidden
        style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 'var(--bui-radius-3)',
          filter: 'blur(6px)',
          inset: 0,
          position: 'absolute',
          transform: 'translateY(4px)',
        }}
      />

      <div
        style={{
          inset: 0,
          position: 'absolute',
          transform: `rotateY(${faceUp ? 180 : 0}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
        }}
      >
        {/* Back — patterned face-down card. */}
        <div
          style={{
            background: 'linear-gradient(to bottom right, #4f46e5, #3730a3)',
            backfaceVisibility: 'hidden',
            borderRadius: 'var(--bui-radius-3)',
            boxShadow:
              'inset 0 -2px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.3)',
            inset: 0,
            overflow: 'hidden',
            position: 'absolute',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--bui-radius-2)',
              display: 'flex',
              inset: 5,
              justifyContent: 'center',
              position: 'absolute',
            }}
          >
            <Layers size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </div>
        </div>

        {/* Front — revealed value, sharing the deck's card face. */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            borderRadius: 'var(--bui-radius-3)',
            boxShadow:
              'inset 0 -2px 0 rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.3)',
            inset: 0,
            position: 'absolute',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardFace value={value} />
        </div>
      </div>
    </div>
  );
};
