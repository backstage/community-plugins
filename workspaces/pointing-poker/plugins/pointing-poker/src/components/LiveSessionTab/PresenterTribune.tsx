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
import { LogOut, Mic } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar';
import type { TableParticipant } from './types';

export type PresenterInfo = Readonly<{
  canPresent: boolean;
  canRelease: boolean;
  canTakeOver: boolean;
  presenter?: TableParticipant;
  reporterInSession: boolean;
  reporterName?: string;
  showCredit: boolean;
}>;

type PresenterTribuneProps = Readonly<{
  hasVoted: boolean;
  info: PresenterInfo;
  onRelease: () => void;
  onTakeMic: () => void;
}>;

const BOX_W = 190;
const BOX_H = 150;

const extractInitials = (name: string): string =>
  name
    .split(/\s+/)
    .map(part => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Full name reads best; only when it would overflow the plate do we fall back to
// "First L." rather than shrinking the font.
const MAX_PLATE_CHARS = 18;
const formatPlateName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length <= MAX_PLATE_CHARS) {
    return trimmed;
  }
  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  return last ? `${first} ${last.charAt(0)}.` : first;
};

const stageActionStyle = {
  alignItems: 'center',
  background: 'rgba(43,45,51,0.9)',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 'var(--bui-radius-full)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 11,
  fontWeight: 600,
  gap: 5,
  padding: '6px 9px',
  whiteSpace: 'nowrap',
} as const;

// A compact wooden speaker's tribune for the head of the poker table. It carries
// whoever is presenting the current story. Colours are fixed hex to match the
// felt table, a dark object regardless of theme.
export const PresenterTribune = ({
  hasVoted,
  info,
  onRelease,
  onTakeMic,
}: PresenterTribuneProps) => {
  const {
    canRelease,
    canTakeOver,
    presenter,
    reporterInSession,
    reporterName,
    showCredit,
  } = info;
  const plateName = presenter ? formatPlateName(presenter.userName) : 'Empty';
  const credit =
    showCredit && reporterName
      ? `for ${formatPlateName(reporterName)}`
      : undefined;
  const hasActions = Boolean(presenter) && (canTakeOver || canRelease);

  return (
    <div style={{ height: BOX_H, position: 'relative', width: BOX_W }}>
      <svg
        aria-hidden
        height={BOX_H}
        viewBox={`0 0 ${BOX_W} ${BOX_H}`}
        width={BOX_W}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="tribune-body">
            <path d="M44 58 L146 58 L166 150 L24 150 Z" />
          </clipPath>
          <linearGradient id="tribune-velvet" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#46735a" />
            <stop offset="1" stopColor="#365844" />
          </linearGradient>
          <linearGradient id="tribune-velvet-muted" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#5f6b64" />
            <stop offset="1" stopColor="#49524c" />
          </linearGradient>
        </defs>

        <g clipPath="url(#tribune-body)">
          <rect fill="#EF9F27" height={23} width={BOX_W} x={0} y={58} />
          <rect fill="#BA7517" height={23} width={BOX_W} x={0} y={81} />
          <rect fill="#854F0B" height={23} width={BOX_W} x={0} y={104} />
          <rect fill="#633806" height={23} width={BOX_W} x={0} y={127} />
          <rect
            fill="#d4b46a"
            height={1.2}
            opacity={0.7}
            width={BOX_W}
            x={0}
            y={80.4}
          />
          <rect
            fill="#d4b46a"
            height={1.2}
            opacity={0.7}
            width={BOX_W}
            x={0}
            y={103.4}
          />
          <rect
            fill="#d4b46a"
            height={1.2}
            opacity={0.7}
            width={BOX_W}
            x={0}
            y={126.4}
          />
        </g>
        <path
          d="M44 58 L146 58 L166 150 L24 150 Z"
          fill="none"
          stroke="#d4b46a"
          strokeWidth={2}
        />

        <rect fill="#d4b46a" height={4} rx={2} width={64} x={63} y={55} />
        <path
          d="M66 58 L124 58 L124 106 Q110 116 95 114 Q80 116 66 106 Z"
          fill={
            presenter ? 'url(#tribune-velvet)' : 'url(#tribune-velvet-muted)'
          }
        />

        <rect
          fill="#f4e9cd"
          height={32}
          rx={6}
          stroke="#c9a24a"
          strokeWidth={1.5}
          width={134}
          x={28}
          y={100}
        />
        <text
          fill="#3a2a12"
          fontSize={13}
          fontWeight={700}
          textAnchor="middle"
          x={95}
          y={credit ? 113 : 120}
        >
          {plateName}
        </text>
        {credit && (
          <text
            fill="#8a7444"
            fontSize={8}
            fontStyle="italic"
            textAnchor="middle"
            x={95}
            y={124}
          >
            {credit}
          </text>
        )}
      </svg>

      {presenter ? (
        <div
          style={{
            borderRadius: 'var(--bui-radius-full)',
            boxShadow: `${
              hasVoted ? '0 0 0 4px #60a5fa' : '0 0 0 4px #d4b46a'
            }, 0 10px 15px -3px rgba(0,0,0,0.3)`,
            left: '50%',
            position: 'absolute',
            top: 12,
            transform: 'translateX(-50%)',
          }}
        >
          <CharacterAvatar
            name={presenter.userName}
            seed={presenter.avatarSeed}
            size={56}
            style={presenter.avatarStyle}
          />
        </div>
      ) : (
        <div
          style={{
            alignItems: 'center',
            backgroundColor: '#2b2d33',
            border: '2px dashed rgba(212,180,106,0.6)',
            borderRadius: 'var(--bui-radius-full)',
            color: 'rgba(212,180,106,0.7)',
            display: 'flex',
            fontSize: '0.875rem',
            fontWeight: 600,
            height: 56,
            justifyContent: 'center',
            left: '50%',
            position: 'absolute',
            top: 12,
            transform: 'translateX(-50%)',
            width: 56,
          }}
        >
          {reporterName ? extractInitials(reporterName) : ''}
        </div>
      )}

      {hasActions && (
        <div
          style={{
            alignItems: 'flex-end',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            left: 'calc(100% - 28px)',
            position: 'absolute',
            top: 14,
          }}
        >
          {canTakeOver && (
            <button onClick={onTakeMic} style={stageActionStyle} type="button">
              <Mic size={14} />
              Take stage
            </button>
          )}
          {canRelease && (
            <button onClick={onRelease} style={stageActionStyle} type="button">
              <LogOut size={14} />
              {canTakeOver ? 'Clear stage' : 'Leave stage'}
            </button>
          )}
        </div>
      )}

      {!presenter && (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            left: '50%',
            position: 'absolute',
            top: 136,
            transform: 'translateX(-50%)',
            width: '100%',
          }}
        >
          {!reporterInSession && (
            <span
              style={{
                backgroundColor: 'rgba(180,90,20,0.85)',
                borderRadius: 'var(--bui-radius-1)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '0.125rem 0.375rem',
                textTransform: 'uppercase',
              }}
            >
              Reporter not in session
            </span>
          )}
          {info.canPresent && (
            <button
              onClick={onTakeMic}
              style={{
                background: '#d4b46a',
                border: 'none',
                borderRadius: 'var(--bui-radius-2)',
                boxShadow:
                  '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1)',
                color: '#3a2a12',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.75rem',
              }}
              type="button"
            >
              I'll present it
            </button>
          )}
        </div>
      )}
    </div>
  );
};
