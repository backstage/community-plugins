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
import { useLayoutEffect, useRef, useState } from 'react';
import { CharacterAvatar } from './CharacterAvatar';
import { PresenterTribune } from './PresenterTribune';
import type { PresenterInfo } from './PresenterTribune';
import { TableCard } from './TableCard';
import type { FibonacciValue, TableParticipant } from './types';

type PokerTableProps = Readonly<{
  currentUserId?: string;
  onReleasePresenter: () => void;
  onTakeMic: () => void;
  presenter: PresenterInfo;
  summary?: Readonly<{ primary: string; secondary?: string }>;
  votedUserIds: ReadonlySet<string>;
  voters: ReadonlyArray<TableParticipant>;
  votesRevealed: boolean;
  voteValues: ReadonlyMap<string, FibonacciValue>;
  waitingLabel?: string;
  waitingPulse?: boolean;
}>;

// Flat oval (stadium) table — no 3D tilt. Every voter takes a seat around the
// rail; the current user is anchored at the bottom. Observers are not shown on
// the felt (they live in the Watching panel).
const TABLE_W = 560;
const TABLE_H = 322;
const FELT_INSET = 18;
const RAIL_INSET = 40;

// Seats ride an ellipse just outside the rail; cards lie on a smaller ellipse
// inside the felt.
const AVATAR_RX = 330;
const AVATAR_RY = 230;
const CARD_RX = 190;
const CARD_RY = 98;
const PRESENTER_CARD_Y = -76;

// Fixed composition box, deliberately decoupled from the table/seat geometry:
// the table is fit into this box by `scale`, so changing the table size above
// actually changes it on screen instead of being compensated by a larger
// fit-to-space scale. Seats outside the box still render into the stage.
const COMPOSITION_W = 800;
const COMPOSITION_H = 660;

// The table is a stadium (rounded rectangle), not an ellipse: its rounded ends
// have radius TABLE_H/2 and the straight top/bottom span the middle. Decorative
// gold cup-holder holes sit centred on the rail band (FELT_INSET/2 in from the
// outer edge) at the six classic seat spots — two on each straight edge and one
// on each rounded end. Top- and bottom-centre stay clear for the tribune and
// the host.
const RAIL_MID = FELT_INSET / 2;
const STRAIGHT_HALF = TABLE_W / 2 - TABLE_H / 2;
const HOLE_X = STRAIGHT_HALF * 0.6;
const HOLE_TOP_Y = TABLE_H / 2 - RAIL_MID;
const HOLE_END_X = TABLE_W / 2 - RAIL_MID;
const HOLES: ReadonlyArray<{ x: number; y: number }> = [
  { x: -HOLE_X, y: -HOLE_TOP_Y },
  { x: HOLE_X, y: -HOLE_TOP_Y },
  { x: -HOLE_END_X, y: 0 },
  { x: HOLE_END_X, y: 0 },
  { x: -HOLE_X, y: HOLE_TOP_Y },
  { x: HOLE_X, y: HOLE_TOP_Y },
];

// Allow the composition to grow beyond its natural size when the stage has room
// to spare, so the table fills the space instead of floating in it.
const MAX_SCALE = 1.1;

// Nudge the whole composition up so the bottom seat (the current user) clears
// the fixed results/action bar that overlaps the stage from below.
const LIFT = 16;

// Deterministic per-card spin so cards look tossed, not axis-aligned.
const cardTilt = (index: number): number => ((index * 37) % 11) - 5;

const HOST_SEAT_ANGLE = 90;
const TOP_WEDGE = 42;
const MAX_SEAT_OFFSET = 180 - TOP_WEDGE;

// The host anchors the bottom-centre; the other voters fan out symmetrically to
// either side, leaving a wedge clear at the top for the presenter tribune.
const computeSeatAngles = (count: number, hostIndex: number): number[] => {
  const angles = Array.from<number>({ length: count }).fill(HOST_SEAT_ANGLE);
  if (count <= 1) {
    return angles;
  }
  const order = hostIndex >= 0 ? [hostIndex] : [];
  for (let i = 0; i < count; i++) {
    if (i !== hostIndex) {
      order.push(i);
    }
  }
  const step = MAX_SEAT_OFFSET / Math.ceil((count - 1) / 2);
  order.forEach((voterIndex, rank) => {
    if (rank > 0) {
      const sign = rank % 2 === 1 ? 1 : -1;
      angles[voterIndex] = HOST_SEAT_ANGLE + sign * Math.ceil(rank / 2) * step;
    }
  });
  return angles;
};

export const PokerTable = ({
  currentUserId,
  onReleasePresenter,
  onTakeMic,
  presenter,
  summary,
  votedUserIds,
  voters,
  votesRevealed,
  voteValues,
  waitingLabel,
  waitingPulse,
}: PokerTableProps) => {
  const votedCount = voters.filter(p => votedUserIds.has(p.userId)).length;
  const presenterUserId = presenter.presenter?.userId;
  const presenterHasVoted = presenterUserId
    ? votedUserIds.has(presenterUserId)
    : false;
  const seatedVoters = voters.filter(
    participant => participant.userId !== presenterUserId,
  );

  const areaRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = areaRef.current;
    if (!element) {
      return undefined;
    }
    let frameId: number | undefined;
    const measure = () => {
      const next = Math.min(
        MAX_SCALE,
        element.clientHeight / COMPOSITION_H,
        element.clientWidth / COMPOSITION_W,
      );
      const measuredScale = next > 0 ? next : 1;
      setScale(current =>
        Math.abs(current - measuredScale) < 0.001 ? current : measuredScale,
      );
    };
    measure();
    const observer = new ResizeObserver(() => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(measure);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  // Calculate positions from the complete voter list. Moving one participant
  // to the tribune should leave an empty seat, not redistribute everyone else.
  const hostIndex = voters.findIndex(v => v.role === 'host');
  const seatAngles = computeSeatAngles(voters.length, hostIndex);
  const seatIndexOf = (userId: string): number =>
    voters.findIndex(voter => voter.userId === userId);
  const angleFor = (userId: string): number =>
    (seatAngles[seatIndexOf(userId)] * Math.PI) / 180;

  return (
    <div
      ref={areaRef}
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          height: COMPOSITION_H,
          position: 'relative',
          transform: `scale(${scale}) translateY(${-LIFT}px)`,
          width: COMPOSITION_W,
        }}
      >
        {/* The oval table, centred in the composition. */}
        <div
          style={{
            height: TABLE_H,
            left: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: TABLE_W,
          }}
        >
          {/* Rail — dark slate with a soft drop shadow for weight. */}
          <div
            style={{
              backgroundColor: '#33353b',
              borderRadius: 'var(--bui-radius-full)',
              boxShadow:
                '0 18px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
              inset: 0,
              position: 'absolute',
            }}
          />

          {/* Felt — muted, sophisticated green. */}
          <div
            style={{
              background: 'linear-gradient(135deg, #46735a 0%, #365844 100%)',
              borderRadius: 'var(--bui-radius-full)',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.35)',
              inset: FELT_INSET,
              position: 'absolute',
            }}
          />

          {/* Inner dashed rail line. */}
          <div
            style={{
              border: '2px dashed rgba(255,255,255,0.15)',
              borderRadius: 'var(--bui-radius-full)',
              inset: RAIL_INSET,
              position: 'absolute',
            }}
          />

          {/* Decorative gold cup-holder holes set into the rail. */}
          {HOLES.map(hole => (
            <div
              key={`hole-${hole.x}-${hole.y}`}
              style={{
                backgroundColor: '#1f2024',
                border: '2px solid #d4b46a',
                borderRadius: 'var(--bui-radius-full)',
                boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6)',
                height: 28,
                left: '50%',
                position: 'absolute',
                top: '50%',
                transform: `translate(calc(-50% + ${hole.x}px), calc(-50% + ${hole.y}px))`,
                width: 28,
              }}
            />
          ))}

          {/* Cards laid on the felt. */}
          {seatedVoters.map(participant => {
            const seatIndex = seatIndexOf(participant.userId);
            const rad = angleFor(participant.userId);
            const x = Math.cos(rad) * CARD_RX;
            const y = Math.sin(rad) * CARD_RY;
            return (
              <div
                key={`card-${participant.userId}`}
                style={{
                  left: '50%',
                  position: 'absolute',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <TableCard
                  faceUp={votedUserIds.has(participant.userId) && votesRevealed}
                  hasVoted={votedUserIds.has(participant.userId)}
                  tiltZ={cardTilt(seatIndex)}
                  value={voteValues.get(participant.userId)}
                />
              </div>
            );
          })}

          {/* The presenter keeps their card on the felt, directly in front of
              the tribune, while their avatar moves onto the stage. */}
          {presenter.presenter && (
            <div
              style={{
                left: '50%',
                position: 'absolute',
                top: '50%',
                transform: `translate(-50%, calc(-50% + ${PRESENTER_CARD_Y}px))`,
              }}
            >
              <TableCard
                faceUp={presenterHasVoted && votesRevealed}
                hasVoted={presenterHasVoted}
                tiltZ={3}
                value={
                  presenterUserId ? voteValues.get(presenterUserId) : undefined
                }
              />
            </div>
          )}

          {/* Center status: reveal outcome, otherwise live voting progress. */}
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              inset: 0,
              justifyContent: 'center',
              position: 'absolute',
              textAlign: 'center',
            }}
          >
            {summary ? (
              <>
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '2.25rem',
                    fontWeight: 700,
                    margin: 0,
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                >
                  {summary.primary}
                </p>
                {summary.secondary && (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.875rem',
                      letterSpacing: '0.05em',
                      margin: '0.25rem 0 0',
                      textTransform: 'uppercase',
                    }}
                  >
                    {summary.secondary}
                  </p>
                )}
              </>
            ) : (
              <>
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    margin: 0,
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                >
                  {`${votedCount} of ${voters.length} voted`}
                </p>
                {waitingLabel && (
                  <p
                    style={{
                      alignItems: 'center',
                      color: 'rgba(255,255,255,0.8)',
                      display: 'flex',
                      fontSize: '0.875rem',
                      gap: '0.375rem',
                      margin: '0.25rem 0 0',
                    }}
                  >
                    {waitingPulse && (
                      <span
                        style={{
                          background: '#6ee7b7',
                          borderRadius: 'var(--bui-radius-full)',
                          height: 8,
                          width: 8,
                        }}
                      />
                    )}
                    {waitingLabel}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div
          style={{
            left: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%) translateY(-198px) scale(0.82)',
            transformOrigin: 'center bottom',
            zIndex: 10,
          }}
        >
          <PresenterTribune
            hasVoted={presenterHasVoted}
            info={presenter}
            onRelease={onReleasePresenter}
            onTakeMic={onTakeMic}
          />
        </div>

        {/* Seats: upright avatar billboards riding the ellipse outside the rail. */}
        {seatedVoters.map(participant => {
          const hasVoted = votedUserIds.has(participant.userId);
          const rad = angleFor(participant.userId);
          const x = Math.cos(rad) * AVATAR_RX;
          const y = Math.sin(rad) * AVATAR_RY;

          const isHost = participant.role === 'host';
          const isYou = participant.userId === currentUserId;

          // The ring carries vote-state only; identity (host / you) lives in the
          // pills below, so the two signals never read as variants of each other.
          const ring = hasVoted
            ? '0 0 0 4px #60a5fa'
            : '0 0 0 2px rgba(255,255,255,0.15)';

          return (
            <div
              key={participant.userId}
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                left: '50%',
                position: 'absolute',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                style={{
                  borderRadius: 'var(--bui-radius-full)',
                  boxShadow: `${ring}, 0 20px 25px -5px rgba(0,0,0,0.3)`,
                }}
              >
                <CharacterAvatar
                  name={participant.userName}
                  seed={participant.avatarSeed}
                  size={76}
                  style={participant.avatarStyle}
                />
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(17,18,20,0.82)',
                  borderRadius: 'var(--bui-radius-2)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.125rem 0.5rem',
                }}
              >
                {participant.userName.split(' ')[0]}
              </span>
              {(isHost || isYou) && (
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '0.25rem',
                  }}
                >
                  {isHost && (
                    <span
                      style={{
                        backgroundColor: '#d4b46a',
                        borderRadius: 'var(--bui-radius-1)',
                        color: '#3a2a12',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '0.125rem 0.375rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      Host
                    </span>
                  )}
                  {isYou && (
                    <span
                      style={{
                        backgroundColor: 'var(--bui-bg-neutral-2)',
                        borderRadius: 'var(--bui-radius-1)',
                        color: 'var(--bui-fg-primary)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '0.125rem 0.375rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
