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
import { useEffect, useRef, useState } from 'react';
import { useAsync } from 'react-use';
import { Eye, Flag, LogOut, XCircle } from 'lucide-react';
import { Box, Button, Flex, Text } from '@backstage/ui';
import type {
  NewStory,
  ParticipantRole,
  Session,
  SplitResolution,
  Subtask,
} from '@backstage-community/plugin-pointing-poker-common';
import { PokerTable } from './PokerTable';
import type { PresenterInfo } from './PresenterTribune';
import { ResultsSheet } from './ResultsSheet';
import { RoleSelector } from './RoleSelector';
import { SessionComplete } from './SessionComplete';
import { SessionProgress } from './SessionProgress';
import { SplitRollup } from './SplitRollup';
import { ParentContext, SubtaskBreadcrumb } from './SubtaskContext';
import { SubtaskChip, SubtaskPicker } from './SubtaskPicker';
import { TicketCard } from './TicketCard';
import { VotingCards } from './VotingCards';
import { WatchingList } from './WatchingList';
import { FIBONACCI_VALUES } from './types';
import type { FibonacciValue, UserRole } from './types';
import { buildVoteEntries } from './utils/buildVotes';
import { analyzeVotes } from './utils/consensus';
import type { VoteAnalysis } from './utils/consensus';
import { NUMERIC_DECK } from './utils/deck';
import { useAutoReveal } from './hooks/useAutoReveal';
import { useFillHeight } from './hooks/useFillHeight';
import { useJira } from './hooks/useJira';
import { useTicketInfo } from './hooks/useTicketInfo';

const DECK = FIBONACCI_VALUES.map(String);

// Snap the average to the closest real card by distance (1.2 -> 1, 3.5 -> 3).
// On an exact tie lean to the bigger card: the deck is ascending, so iterating
// with `<=` lets the larger neighbour win.
const nearestDeckValue = (value: number): number => {
  let best = NUMERIC_DECK[0];
  let bestDistance = Math.abs(value - best);
  for (const card of NUMERIC_DECK) {
    const distance = Math.abs(value - card);
    if (distance <= bestDistance) {
      best = card;
      bestDistance = distance;
    }
  }
  return best;
};

const pickAcceptValue = (analysis: VoteAnalysis): null | string =>
  analysis.average === null
    ? null
    : String(nearestDeckValue(Number(analysis.average)));

type SessionTableProps = Readonly<{
  allowedCardValues?: ReadonlyArray<string>;
  currentUserId: string;
  onAccept: (estimate: string) => Promise<void> | void;
  onActivateStory: (storyId: string) => Promise<void> | void;
  onEndSession: () => Promise<void> | void;
  onLeave: () => void;
  onNewRound: () => Promise<void> | void;
  onResolveSplit: (
    mode: SplitResolution,
    estimate?: string,
  ) => Promise<void> | void;
  onReveal: (revealed: boolean) => Promise<void> | void;
  onRoleChange: (role: ParticipantRole) => Promise<void> | void;
  onSetPresenter: (
    storyId: string,
    presenterUserId: null | string,
  ) => Promise<void> | void;
  onSkip: () => Promise<void> | void;
  onSplit: (storyId: string, subtasks: NewStory[]) => Promise<void> | void;
  onUnvote: () => Promise<void> | void;
  onVote: (value: string) => Promise<void> | void;
  session: Session;
  teamName?: string;
}>;

const resolveStoryTitle = (
  current: { title: string } | undefined,
  totalStories: number,
): string | undefined => {
  if (current) {
    return current.title;
  }
  return totalStories > 0 ? 'All stories refined 🎉' : undefined;
};

const formatNames = (names: string[]): string => {
  if (names.length <= 1) {
    return names[0] ?? '';
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
};

type WaitingInput = Readonly<{
  isHost: boolean;
  pendingNames: string[];
  votesRevealed: boolean;
}>;

type WaitingStatus = Readonly<{ label: string; pulse: boolean }>;

const buildWaitingStatus = ({
  isHost,
  pendingNames,
  votesRevealed,
}: WaitingInput): undefined | WaitingStatus => {
  if (votesRevealed) {
    return undefined;
  }
  if (pendingNames.length > 0) {
    return {
      label: `Waiting on ${formatNames(pendingNames)} to vote`,
      pulse: false,
    };
  }
  return {
    label: 'Everyone’s in — revealing votes…',
    pulse: !isHost,
  };
};

type HostRevealActionProps = Readonly<{
  allVoted: boolean;
  hasVotes: boolean;
  onReveal: () => void;
  totalVoters: number;
  votedCount: number;
}>;

// The host's pre-reveal control. With no votes yet there's nothing to do; once
// everyone's in the reveal is automatic; the only real button is the
// partial-state override for when someone has dropped off.
const HostRevealAction = ({
  allVoted,
  hasVotes,
  onReveal,
  totalVoters,
  votedCount,
}: HostRevealActionProps) => {
  if (!hasVotes) {
    return (
      <Flex
        align="center"
        gap="2"
        style={{
          background: 'var(--bui-bg-neutral-2)',
          border: '1px solid var(--bui-border-1)',
          borderRadius: 'var(--bui-radius-full)',
          padding: '0.375rem var(--bui-space-4)',
        }}
      >
        <Text as="span" color="secondary" variant="body-small" weight="bold">
          Waiting for the first vote
        </Text>
        <span aria-hidden style={{ display: 'flex', gap: 4 }}>
          <span
            style={{
              background: 'var(--bui-fg-info)',
              borderRadius: 'var(--bui-radius-full)',
              height: 6,
              width: 6,
            }}
          />
          <span
            style={{
              background: 'var(--bui-fg-info)',
              borderRadius: 'var(--bui-radius-full)',
              height: 6,
              width: 6,
            }}
          />
          <span
            style={{
              background: 'var(--bui-fg-info)',
              borderRadius: 'var(--bui-radius-full)',
              height: 6,
              width: 6,
            }}
          />
        </span>
      </Flex>
    );
  }

  if (allVoted) {
    return null;
  }

  return (
    <Button
      iconStart={<Eye size={16} />}
      onClick={onReveal}
      variant="secondary"
    >
      {`Reveal now · ${votedCount} of ${totalVoters} in`}
    </Button>
  );
};

const parseVoteValue = (value: string): FibonacciValue | null => {
  if (value === '?') {
    return '?';
  }
  const numeric = Number(value);
  return FIBONACCI_VALUES.includes(numeric as FibonacciValue)
    ? (numeric as FibonacciValue)
    : null;
};

const buildVoteValueMap = (
  votes: ReadonlyArray<{ userId: string; value: string }>,
): Map<string, FibonacciValue> => {
  const map = new Map<string, FibonacciValue>();
  votes.forEach(v => {
    const parsed = parseVoteValue(v.value);
    if (parsed !== null) {
      map.set(v.userId, parsed);
    }
  });
  return map;
};

const buildTableSummary = (
  analysis: VoteAnalysis,
): Readonly<{ primary: string; secondary: string }> => {
  if (analysis.status === 'unanimous') {
    return { primary: analysis.mode ?? '—', secondary: 'Unanimous' };
  }
  if (analysis.spread) {
    return {
      primary: `${analysis.spread.low}–${analysis.spread.high}`,
      secondary: analysis.status === 'discuss' ? 'Spread' : 'Close',
    };
  }
  return { primary: analysis.mode ?? '—', secondary: 'Close' };
};

const normalizeName = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, ' ');

type PresenterInput = Readonly<{
  currentUserId: string;
  isHost: boolean;
  isObserver: boolean;
  participants: Session['participants'];
  presenterUserId?: string;
  reporterName?: string;
}>;

// Resolves who is presenting the current story: an explicit override wins, else
// a display-name match to the ticket reporter (in-room auto), else vacant.
const buildPresenterInfo = ({
  currentUserId,
  isHost,
  isObserver,
  participants,
  presenterUserId,
  reporterName,
}: PresenterInput): PresenterInfo => {
  const normalizedReporter = reporterName
    ? normalizeName(reporterName)
    : undefined;
  const override = presenterUserId
    ? participants.find(p => p.userId === presenterUserId)
    : undefined;
  const autoMatch =
    !override && normalizedReporter
      ? participants.find(p => normalizeName(p.userName) === normalizedReporter)
      : undefined;
  const presenter = override ?? autoMatch;
  const isCurrentPresenter = presenter?.userId === currentUserId;

  return {
    canPresent: !isObserver,
    canRelease: Boolean(presenter) && (isCurrentPresenter || isHost),
    canTakeOver: !isObserver && Boolean(presenter) && !isCurrentPresenter,
    presenter,
    reporterInSession: normalizedReporter
      ? participants.some(p => normalizeName(p.userName) === normalizedReporter)
      : false,
    reporterName,
    showCredit: Boolean(
      presenter &&
        normalizedReporter &&
        normalizeName(presenter.userName) !== normalizedReporter,
    ),
  };
};

export const SessionTable = ({
  allowedCardValues,
  currentUserId,
  onAccept,
  onActivateStory,
  onEndSession,
  onLeave,
  onNewRound,
  onResolveSplit,
  onReveal,
  onRoleChange,
  onSetPresenter,
  onSkip,
  onSplit,
  onUnvote,
  onVote,
  session,
  teamName,
}: SessionTableProps) => {
  const currentParticipant = session.participants.find(
    p => p.userId === currentUserId,
  );
  const persistedRole = currentParticipant?.role ?? 'voter';

  const currentStory = session.stories.find(
    s => s.id === session.currentStoryId,
  );
  const serverVote =
    currentStory?.votes.find(v => v.userId === currentUserId)?.value ?? null;

  const isSubtaskVoting = Boolean(currentStory?.parentStoryId);
  const isSplitResolution = currentStory?.state === 'split';
  const parentStory = currentStory?.parentStoryId
    ? session.stories.find(s => s.id === currentStory.parentStoryId)
    : undefined;
  const childStories = isSplitResolution
    ? session.stories.filter(s => s.parentStoryId === currentStory?.id)
    : [];
  const subtaskNumbers = childStories
    .map(s => Number(s.estimate))
    .filter(n => Number.isFinite(n));
  const subtaskTotal =
    subtaskNumbers.length > 0
      ? subtaskNumbers.reduce((sum, n) => sum + n, 0)
      : null;

  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => setPickerOpen(false), [session.currentStoryId]);

  const [selectedVote, setSelectedVote] = useState<FibonacciValue | null>(
    serverVote ? parseVoteValue(serverVote) : null,
  );
  const [userRole, setUserRole] = useState<UserRole>(persistedRole);
  const [isRolePopoverOpen, setIsRolePopoverOpen] = useState(false);
  const [endConfirming, setEndConfirming] = useState(false);
  const { height, ref } = useFillHeight();
  // Holds a just-cast vote (or null for an unvote) until the server confirms it,
  // so a background poll can't clobber the choice mid-flight. `undefined` means
  // "no local change pending — trust the server".
  const pendingVote = useRef<FibonacciValue | null | undefined>(undefined);

  useEffect(() => {
    setUserRole(persistedRole);
  }, [persistedRole]);

  useEffect(() => {
    pendingVote.current = undefined;
    setSelectedVote(serverVote ? parseVoteValue(serverVote) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentStoryId]);

  useEffect(() => {
    const parsed = serverVote ? parseVoteValue(serverVote) : null;
    if (pendingVote.current !== undefined) {
      if (parsed === pendingVote.current) {
        pendingVote.current = undefined;
        setSelectedVote(parsed);
      }
      return;
    }
    setSelectedVote(parsed);
  }, [serverVote]);

  const ticket = useTicketInfo(currentStory?.ticketKey);
  const parentTicket = useTicketInfo(parentStory?.ticketKey);
  const { getSubtasks, setStoryPoints } = useJira();

  // Subtasks of the current top-level story, so the host can split it. Skipped
  // for subtask rounds and split parents (they aren't split further).
  const { value: subtasks } = useAsync(async (): Promise<Subtask[]> => {
    if (
      !currentStory ||
      currentStory.parentStoryId ||
      currentStory.state !== 'active' ||
      !currentStory.ticketKey
    ) {
      return [];
    }
    return getSubtasks(currentStory.ticketKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id, currentStory?.ticketKey, currentStory?.state]);
  const subtaskCount = subtasks?.length ?? 0;

  const handleConfirmSplit = (selected: Subtask[]) => {
    if (!currentStory) {
      return;
    }
    setPickerOpen(false);
    void onSplit(
      currentStory.id,
      selected.map(s => ({ ticketKey: s.key, title: s.summary })),
    );
  };

  const handleResolveSplit = (mode: SplitResolution, estimate?: string) => {
    if (mode === 'rollup' && estimate && currentStory?.ticketKey) {
      void setStoryPoints(currentStory.ticketKey, Number(estimate));
    }
    void onResolveSplit(mode, estimate);
  };

  const host = session.participants.find(p => p.role === 'host');
  const hostName =
    host && host.userId !== currentUserId ? host.userName : undefined;

  const canVote = userRole !== 'observer';
  const isHost = userRole === 'host';
  const votesRevealed = Boolean(currentStory?.revealed);
  const storyTitle = resolveStoryTitle(currentStory, session.stories.length);
  const allRefined = !currentStory && session.stories.length > 0;

  const myValue = selectedVote !== null ? String(selectedVote) : serverVote;

  const allVotes = buildVoteEntries(
    currentStory?.votes ?? [],
    session.participants,
    currentUserId,
    myValue,
  );
  const votedUserIds = new Set(allVotes.map(v => v.userId));
  const voteValues = buildVoteValueMap(allVotes);

  const analysis = analyzeVotes(allVotes, DECK);

  const hostFirstName = host ? host.userName.split(' ')[0] : 'the host';
  const voters = session.participants.filter(p => p.role !== 'observer');
  const observers = session.participants.filter(p => p.role === 'observer');
  const pendingVoters = voters.filter(p => !votedUserIds.has(p.userId));
  const pendingNames = pendingVoters.map(p =>
    p.userId === currentUserId ? 'you' : p.userName.split(' ')[0],
  );
  const allVoted = voters.length > 0 && pendingVoters.length === 0;
  const votedCount = voters.length - pendingVoters.length;

  useAutoReveal(allVoted && !votesRevealed && isHost, () => onReveal(true));

  const waitingStatus = buildWaitingStatus({
    isHost,
    pendingNames,
    votesRevealed,
  });

  const summary = buildTableSummary(analysis);

  const presenterInfo = buildPresenterInfo({
    currentUserId,
    isHost,
    isObserver: userRole === 'observer',
    participants: session.participants,
    presenterUserId: currentStory?.presenterUserId,
    reporterName: ticket?.author,
  });

  const handleTakeMic = () => {
    if (currentStory) {
      void onSetPresenter(currentStory.id, currentUserId);
    }
  };

  const handleReleasePresenter = () => {
    if (currentStory) {
      void onSetPresenter(currentStory.id, null);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'observer') {
      setSelectedVote(null);
    }
    void onRoleChange(role);
  };

  const handleVote = (value: FibonacciValue) => {
    if (selectedVote === value) {
      pendingVote.current = null;
      setSelectedVote(null);
      void onUnvote();
      return;
    }
    pendingVote.current = value;
    setSelectedVote(value);
    void onVote(String(value));
  };

  const acceptValue = pickAcceptValue(analysis);

  const renderLeft = () =>
    canVote ? (
      <VotingCards
        allowedValues={allowedCardValues}
        currentParticipant={currentParticipant}
        onVote={handleVote}
        selectedVote={selectedVote}
      />
    ) : (
      <Text as="span" color="secondary" variant="body-small">
        Observing — you are not voting this round.
      </Text>
    );

  const renderSessionAction = () => {
    if (!isHost) {
      return (
        <Button
          iconStart={<LogOut size={16} />}
          onClick={onLeave}
          size="small"
          variant="tertiary"
        >
          Leave session
        </Button>
      );
    }

    if (endConfirming) {
      return (
        <Flex
          align="center"
          gap="2"
          style={{
            background: 'var(--bui-bg-neutral-1)',
            border: '1px solid var(--bui-border-1)',
            borderRadius: 'var(--bui-radius-full)',
            padding: '4px 6px 4px 10px',
          }}
        >
          <Text as="span" variant="body-x-small" weight="bold">
            End for everyone?
          </Text>
          <Button
            onClick={() => setEndConfirming(false)}
            size="small"
            variant="tertiary"
          >
            Cancel
          </Button>
          <Button
            destructive
            onClick={() => {
              setEndConfirming(false);
              void onEndSession();
            }}
            size="small"
            variant="primary"
          >
            End
          </Button>
        </Flex>
      );
    }

    return (
      <Button
        destructive
        iconStart={<XCircle size={16} />}
        onClick={() => setEndConfirming(true)}
        size="small"
        variant="tertiary"
      >
        End session
      </Button>
    );
  };

  return (
    <Flex
      direction="column"
      gap="4"
      ref={ref}
      style={{
        height: height ? `${height}px` : undefined,
        marginBottom: '-6rem',
      }}
    >
      <Flex align="center" justify="between" style={{ flexShrink: 0 }}>
        <Box>
          <Text as="p" color="secondary" variant="body-small">
            Current session
          </Text>
          <Flex align="center" gap="2">
            <Text as="h2" variant="title-medium" weight="bold">
              {session.name}
            </Text>
            <Flex align="center" gap="1">
              <span
                style={{
                  background: 'var(--bui-fg-success)',
                  borderRadius: 'var(--bui-radius-full)',
                  height: 8,
                  width: 8,
                }}
              />
              <Text
                as="span"
                style={{ color: 'var(--bui-fg-success)' }}
                variant="body-small"
              >
                Live
              </Text>
            </Flex>
          </Flex>
        </Box>
        <Flex align="center" gap="2">
          <SessionProgress
            currentStoryId={session.currentStoryId}
            onActivateStory={isHost ? onActivateStory : undefined}
            stories={session.stories}
            teamName={teamName}
            teamRef={session.teamRef}
          />
          <RoleSelector
            hostName={hostName}
            isOpen={isRolePopoverOpen}
            onOpenChange={setIsRolePopoverOpen}
            onRoleChange={handleRoleChange}
            userRole={userRole}
          />
          {renderSessionAction()}
        </Flex>
      </Flex>

      {allRefined && <SessionComplete session={session} />}

      {!allRefined && (
        <Box
          style={{
            display: 'grid',
            flex: 1,
            gap: 'var(--bui-space-6)',
            gridTemplateColumns: '1fr 1fr',
            minHeight: 0,
          }}
        >
          <Box style={{ minHeight: 0 }}>
            <TicketCard
              actions={
                isHost && currentStory && !isSplitResolution ? (
                  <Button
                    iconStart={<Flag size={16} />}
                    onClick={() => onSkip()}
                    variant="secondary"
                  >
                    Skip — not ready
                  </Button>
                ) : undefined
              }
              badge={
                !isSplitResolution && !isSubtaskVoting && subtaskCount > 0 ? (
                  <SubtaskChip
                    count={subtaskCount}
                    onClick={
                      isHost ? () => setPickerOpen(open => !open) : undefined
                    }
                  />
                ) : undefined
              }
              breadcrumb={
                isSubtaskVoting && parentStory?.ticketKey ? (
                  <SubtaskBreadcrumb
                    parentKey={parentStory.ticketKey}
                    parentTicket={parentTicket}
                  />
                ) : undefined
              }
              contextPanel={
                isSubtaskVoting ? (
                  <ParentContext ticket={parentTicket} />
                ) : undefined
              }
              fallbackTitle={storyTitle}
              ticket={ticket}
            >
              {(() => {
                if (isSplitResolution) {
                  return (
                    <Flex direction="column" gap="2">
                      {childStories.map(child => (
                        <Flex align="center" gap="2" key={child.id}>
                          {child.ticketKey && (
                            <Text
                              as="span"
                              color="secondary"
                              style={{
                                fontFamily: 'var(--bui-font-monospace)',
                              }}
                              variant="body-x-small"
                            >
                              {child.ticketKey}
                            </Text>
                          )}
                          <Text
                            as="span"
                            style={{
                              flex: 1,
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={child.title}
                            variant="body-small"
                          >
                            {child.title}
                          </Text>
                          <Text as="span" variant="body-small" weight="bold">
                            {child.estimate ?? '—'}
                          </Text>
                        </Flex>
                      ))}
                    </Flex>
                  );
                }
                if (pickerOpen && isHost && subtaskCount > 0) {
                  return (
                    <SubtaskPicker
                      onCancel={() => setPickerOpen(false)}
                      onConfirm={handleConfirmSplit}
                      subtasks={subtasks ?? []}
                      voteCount={currentStory?.votes.length ?? 0}
                    />
                  );
                }
                return undefined;
              })()}
            </TicketCard>
          </Box>

          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--bui-space-4)',
              minHeight: 0,
              position: 'relative',
            }}
          >
            {isSplitResolution ? (
              <Flex
                align="center"
                justify="center"
                style={{ flex: 1, minHeight: 0 }}
              >
                {isHost ? (
                  <SplitRollup
                    estimatedCount={childStories.length}
                    onResolve={handleResolveSplit}
                    parentEstimate={currentStory?.estimate}
                    parentKey={currentStory?.ticketKey}
                    subtaskTotal={subtaskTotal}
                  />
                ) : (
                  <Text as="p" color="secondary" variant="body-small">
                    {`Subtasks estimated — waiting on ${hostFirstName} to roll up the parent…`}
                  </Text>
                )}
              </Flex>
            ) : (
              <>
                <Flex gap="3" style={{ flex: 1, minHeight: 0 }}>
                  <Box style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <PokerTable
                      currentUserId={currentUserId}
                      onReleasePresenter={handleReleasePresenter}
                      onTakeMic={handleTakeMic}
                      presenter={presenterInfo}
                      summary={votesRevealed ? summary : undefined}
                      votedUserIds={votedUserIds}
                      voters={voters}
                      votesRevealed={votesRevealed}
                      voteValues={voteValues}
                      waitingLabel={waitingStatus?.label}
                      waitingPulse={waitingStatus?.pulse ?? false}
                    />
                  </Box>
                  <Box
                    style={{
                      alignSelf: 'flex-start',
                      flexShrink: 0,
                      width: '10rem',
                    }}
                  >
                    <WatchingList observers={observers} />
                  </Box>
                </Flex>

                {!votesRevealed && (
                  <Flex
                    align="center"
                    justify="between"
                    style={{
                      background: 'var(--bui-bg-neutral-1)',
                      border: '1px solid var(--bui-border-1)',
                      borderRadius: 'var(--bui-radius-3)',
                      flexShrink: 0,
                      gap: 'var(--bui-space-3)',
                      padding: 'var(--bui-space-3)',
                    }}
                  >
                    <Flex align="center" gap="4" style={{ minWidth: 0 }}>
                      {renderLeft()}
                    </Flex>

                    {isHost && (
                      <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
                        <HostRevealAction
                          allVoted={allVoted}
                          hasVotes={votedUserIds.size > 0}
                          onReveal={() => onReveal(true)}
                          totalVoters={voters.length}
                          votedCount={votedCount}
                        />
                      </Flex>
                    )}
                  </Flex>
                )}

                {votesRevealed && (
                  <ResultsSheet
                    acceptValue={acceptValue}
                    analysis={analysis}
                    hostName={hostFirstName}
                    isHost={isHost}
                    onAccept={value => {
                      setSelectedVote(null);
                      if (currentStory?.ticketKey) {
                        void setStoryPoints(
                          currentStory.ticketKey,
                          Number(value),
                        );
                      }
                      void onAccept(value);
                    }}
                    onReVote={() => {
                      setSelectedVote(null);
                      void onNewRound();
                    }}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      )}
    </Flex>
  );
};
