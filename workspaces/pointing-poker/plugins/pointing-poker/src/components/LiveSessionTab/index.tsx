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
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsync } from 'react-use';
import { useSearchParams } from 'react-router-dom';
import { Undo2 } from 'lucide-react';
import { useApi } from '@backstage/core-plugin-api';
import { Box, Flex, Text } from '@backstage/ui';
import type {
  NewStory,
  ParticipantRole,
  SessionSummary,
} from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../api/pointingPokerApiRef';
import { useAvatarPref } from '../../hooks/useAvatarPref';
import { CharacterPicker } from './CharacterPicker';
import { CreateSessionForm } from './CreateSessionForm';
import { Lobby } from './Lobby';
import { QueryStep } from './QueryStep';
import { SessionTable } from './SessionTable';
import type { Character } from './utils/avatar';
import { useJira } from './hooks/useJira';
import { useSession } from './hooks/useSession';
import { useSessionApi } from './hooks/useSessionApi';
import { useTeamMembers } from './hooks/useTeamMembers';

const SESSION_PARAM = 'session';

const ACTIVE_SESSION_KEY = 'pointing-poker.active-session';
const DEMO_MODE = process.env.NODE_ENV === 'development';
const DEMO_ENGINEERS = [
  {
    avatarSeed: 'BotBluffer',
    avatarStyle: 'avataaars',
    userId: 'demo-engineer-maya',
    userName: 'Maya Chen',
    vote: '3',
  },
  {
    avatarSeed: 'ChipDroid',
    avatarStyle: 'avataaars',
    userId: 'demo-engineer-liam',
    userName: 'Liam O’Connor',
    vote: '5',
  },
  {
    avatarSeed: 'MechDealer',
    avatarStyle: 'avataaars',
    userId: 'demo-engineer-sofia',
    userName: 'Sofia Rossi',
    vote: '8',
  },
] as const;
const DEMO_VOTE_DELAY_MS = 2_000;

type CreateDraft = Readonly<{
  name?: string;
  step: 'query' | 'team';
  teamRef?: string;
}>;

type ToastEntry = Readonly<{
  id: string;
  node: ReactNode;
}>;

const LiveSessionTabContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get(SESSION_PARAM);

  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft | null>(null);
  const demoJoinedSession = useRef<string | null>(null);
  const demoStoryId = useRef<string | null>(null);
  const demoVoteTimers = useRef<number[]>([]);

  const api = useApi(pointingPokerApiRef);
  const { currentUser, loading, userTeams } = useTeamMembers('');
  const {
    acceptEstimate,
    activateStory,
    castVote,
    createSession,
    endSession,
    getTeamCards,
    getTeamQuery,
    joinSession,
    leaveSession,
    newRound,
    reopenSession,
    resolveSplit,
    saveTeamQuery,
    setPresenter,
    setRevealed,
    skipStory,
    splitStory,
    unvote,
    updateRole,
  } = useSessionApi();
  const { runJql } = useJira();
  const { getAvatarPref, saveAvatarPref } = useAvatarPref();
  const { session, setSession } = useSession(
    sessionId,
    currentUser?.metadata.name ?? '',
  );

  const refreshSession = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    const next = await api.getSession(sessionId);
    setSession(next);
  }, [api, sessionId, setSession]);

  const [toastEntry, setToastEntry] = useState<ToastEntry | null>(null);
  const toastTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const dismiss = useCallback((id: string) => {
    setToastEntry(prev => (prev && prev.id === id ? null : prev));
  }, []);

  const toast = useCallback(
    (options: { description: ReactNode; duration?: number }): string => {
      const id = `toast-${Date.now()}`;
      setToastEntry({ id, node: options.description });
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      if (options.duration) {
        toastTimerRef.current = setTimeout(() => {
          setToastEntry(prev => (prev && prev.id === id ? null : prev));
        }, options.duration);
      }
      return id;
    },
    [],
  );

  const UNDO_TOAST_MS = 5000;

  const activeUndoRef = useRef<null | { storyId: string; toastId: string }>(
    null,
  );
  const activeUndoTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const clearActiveUndo = useCallback(() => {
    activeUndoRef.current = null;
    if (activeUndoTimerRef.current) {
      clearTimeout(activeUndoTimerRef.current);
      activeUndoTimerRef.current = null;
    }
  }, []);

  const performUndo = useCallback(async () => {
    const undo = activeUndoRef.current;
    if (!undo || !sessionId) {
      return;
    }
    clearActiveUndo();
    dismiss(undo.toastId);
    await activateStory(sessionId, undo.storyId);
    await refreshSession();
  }, [sessionId, dismiss, activateStory, refreshSession, clearActiveUndo]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!activeUndoRef.current) {
        return;
      }
      const isUndoCombo =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'z';
      if (!isUndoCombo) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      void performUndo();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [performUndo]);

  const userId = currentUser?.metadata.name ?? '';
  const userName =
    currentUser?.spec.profile?.displayName ??
    currentUser?.metadata.name ??
    'Unknown user';
  const teamName =
    userTeams?.find(t => t.ref === session?.teamRef)?.name ?? 'your team';

  const { loading: savedCharacterLoading, value: savedCharacter } =
    useAsync(async (): Promise<Character | undefined> => {
      if (!userId) {
        return undefined;
      }
      const pref = await getAvatarPref(userId);
      return pref
        ? {
            seed: pref.avatarSeed,
            style: pref.avatarStyle as Character['style'],
          }
        : undefined;
    }, [userId]);

  const { value: allowedCardValues } = useAsync(async () => {
    if (!session?.teamRef) {
      return undefined;
    }
    return (await getTeamCards(session.teamRef)) ?? undefined;
  }, [session?.teamRef]);

  const autoJoinedSession = useRef<null | string>(null);

  useEffect(() => {
    if (searchParams.get(SESSION_PARAM)) {
      return;
    }
    const stored = window.sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (stored) {
      setSearchParams({ [SESSION_PARAM]: stored }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    if (!session || session.status !== 'completed') {
      window.sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
      return;
    }
    window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    const allRefined = !session.currentStoryId && session.stories.length > 0;
    if (!allRefined) {
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessionId,
    session?.status,
    session?.currentStoryId,
    session?.stories.length,
  ]);

  const openSession = (id: string) => {
    autoJoinedSession.current = null;
    setSearchParams({ [SESSION_PARAM]: id });
  };

  const clearActiveSession = () => {
    autoJoinedSession.current = null;
    window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    setSearchParams({});
  };

  const handleLeave = async () => {
    if (sessionId && userId) {
      await leaveSession(sessionId, userId);
    }
    clearActiveSession();
  };

  const handleJoin = (summary: SessionSummary) => {
    openSession(summary.id);
  };

  const handleStartCreate = () => {
    setCreateDraft({ step: 'team' });
  };

  const handleTeamConfirm = async (name: string, teamRef: string) => {
    if (userId) {
      setCreating(true);
      try {
        const saved = await getTeamQuery(teamRef);
        if (saved) {
          const issues = await runJql(saved);
          if (issues.length > 0) {
            const created = await createSession({
              name,
              query: saved,
              stories: issues.map(issue => ({
                ticketKey: issue.key,
                title: issue.summary,
              })),
              teamRef,
              userId,
              userName,
            });
            setCreateDraft(null);
            openSession(created.id);
            return;
          }
        }
      } catch {
        // Fall through to the manual refinement step below.
      } finally {
        setCreating(false);
      }
    }
    setCreateDraft({ name, step: 'query', teamRef });
  };

  const handleStartFromQuery = async (jql: string, stories: NewStory[]) => {
    if (!userId || !createDraft?.name || !createDraft.teamRef) {
      return;
    }
    const { name, teamRef } = createDraft;

    setCreating(true);
    try {
      await saveTeamQuery(teamRef, jql);
      const created = await createSession({
        name,
        query: jql,
        stories,
        teamRef,
        userId,
        userName,
      });
      setCreateDraft(null);
      openSession(created.id);
    } finally {
      setCreating(false);
    }
  };

  const handleCharacterJoin = async (
    character: Character,
    role: ParticipantRole,
  ) => {
    if (!sessionId || !userId) {
      return;
    }

    setJoining(true);
    try {
      await joinSession(sessionId, {
        avatarSeed: character.seed,
        avatarStyle: character.style,
        role,
        userId,
        userName,
      });
      try {
        await saveAvatarPref(userId, {
          avatarSeed: character.seed,
          avatarStyle: character.style,
        });
      } catch {
        // ignore — joining already succeeded
      }
      await refreshSession();
    } finally {
      setJoining(false);
    }
  };

  const handleBack = () => {
    clearActiveSession();
  };

  useEffect(() => {
    if (
      !sessionId ||
      !userId ||
      !session ||
      savedCharacterLoading ||
      !savedCharacter ||
      joining ||
      autoJoinedSession.current === sessionId
    ) {
      return;
    }
    const participant = session.participants.find(p => p.userId === userId);
    if (participant?.avatarSeed) {
      return;
    }
    autoJoinedSession.current = sessionId;
    void handleCharacterJoin(savedCharacter, participant?.role ?? 'voter');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessionId,
    userId,
    session,
    savedCharacter,
    savedCharacterLoading,
    joining,
  ]);

  useEffect(() => {
    if (
      !DEMO_MODE ||
      !sessionId ||
      !session ||
      session.status !== 'pending' ||
      demoJoinedSession.current === sessionId ||
      !session.participants.some(p => p.userId === userId && p.avatarSeed)
    ) {
      return;
    }

    const missingEngineers = DEMO_ENGINEERS.filter(
      engineer => !session.participants.some(p => p.userId === engineer.userId),
    );
    demoJoinedSession.current = sessionId;
    if (missingEngineers.length === 0) {
      return;
    }

    void Promise.all(
      missingEngineers.map(engineer =>
        joinSession(sessionId, {
          avatarSeed: engineer.avatarSeed,
          avatarStyle: engineer.avatarStyle,
          role: 'voter',
          userId: engineer.userId,
          userName: engineer.userName,
        }),
      ),
    ).then(refreshSession);
  }, [joinSession, refreshSession, session, sessionId, userId]);

  useEffect(() => {
    demoStoryId.current = session?.currentStoryId ?? null;

    return () => {
      demoVoteTimers.current.forEach(window.clearTimeout);
      demoVoteTimers.current = [];
    };
  }, [session?.currentStoryId]);

  if (loading && !userTeams) {
    return (
      <Box p="4">
        <Text as="p" color="secondary">
          Loading team members…
        </Text>
      </Box>
    );
  }

  if (createDraft?.step === 'team' && !sessionId) {
    return (
      <CreateSessionForm
        creating={creating}
        initialTeamRef=""
        onBack={() => setCreateDraft(null)}
        onConfirm={(name, teamRef) => {
          void handleTeamConfirm(name, teamRef);
        }}
        teams={userTeams ?? []}
      />
    );
  }

  if (createDraft?.step === 'query' && createDraft.teamRef && !sessionId) {
    return (
      <QueryStep
        onBack={() => setCreateDraft({ ...createDraft, step: 'team' })}
        onStart={handleStartFromQuery}
        starting={creating}
        teamName={
          userTeams?.find(t => t.ref === createDraft.teamRef)?.name ??
          'your team'
        }
        teamRef={createDraft.teamRef}
      />
    );
  }

  if (!sessionId) {
    return (
      <Lobby
        currentUserId={userId}
        onEndSession={endSession}
        onJoin={handleJoin}
        onReopenSession={reopenSession}
        onStartCreate={handleStartCreate}
        userTeams={userTeams ?? []}
      />
    );
  }

  if (!session) {
    return (
      <Box p="4">
        <Text as="p" color="secondary">
          Loading session…
        </Text>
      </Box>
    );
  }

  const me = session.participants.find(p => p.userId === userId);
  const hasJoined = Boolean(me?.avatarSeed);

  if (hasJoined) {
    return (
      <>
        <SessionTable
          allowedCardValues={allowedCardValues}
          currentUserId={userId}
          onAccept={async estimate => {
            await acceptEstimate(sessionId, estimate);
            await refreshSession();
          }}
          onEndSession={async () => {
            await endSession(sessionId);
            clearActiveSession();
          }}
          onLeave={() => {
            void handleLeave();
          }}
          onNewRound={async () => {
            await newRound(sessionId);
            await refreshSession();
          }}
          onReveal={async revealed => {
            await setRevealed(sessionId, revealed);
            await refreshSession();
          }}
          onRoleChange={async role => {
            await updateRole(sessionId, userId, role);
            await refreshSession();
          }}
          onActivateStory={async storyId => {
            await activateStory(sessionId, storyId);
            await refreshSession();
          }}
          onSetPresenter={async (storyId, presenterUserId) => {
            await setPresenter(sessionId, storyId, presenterUserId);
            await refreshSession();
          }}
          onResolveSplit={async (mode, estimate) => {
            if (!session.currentStoryId) {
              return;
            }
            await resolveSplit(
              sessionId,
              session.currentStoryId,
              mode,
              estimate,
            );
            await refreshSession();
          }}
          onSplit={async (storyId, subtasks) => {
            await splitStory(sessionId, storyId, subtasks);
            await refreshSession();
          }}
          onSkip={async () => {
            const skipped = session.stories.find(
              s => s.id === session.currentStoryId,
            );
            if (activeUndoRef.current) {
              dismiss(activeUndoRef.current.toastId);
              clearActiveUndo();
            }
            await skipStory(sessionId);
            await refreshSession();
            if (!skipped) {
              return;
            }
            const label = skipped.ticketKey ?? skipped.title;
            const toastId = toast({
              description: (
                <Flex align="center" gap="3">
                  <Undo2
                    aria-hidden
                    size={16}
                    style={{ flexShrink: 0, opacity: 0.7 }}
                  />
                  <Text
                    as="span"
                    variant="body-small"
                    truncate
                    style={{ flex: 1, minWidth: 0 }}
                    title={label}
                  >
                    {`${label} skipped`}
                  </Text>
                  <button
                    onClick={() => {
                      void performUndo();
                    }}
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--bui-radius-2)',
                      color: 'var(--bui-fg-info)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      font: 'inherit',
                      fontWeight: 600,
                      padding: '6px 12px',
                    }}
                  >
                    Undo
                  </button>
                </Flex>
              ),
              duration: UNDO_TOAST_MS,
            });
            activeUndoRef.current = { storyId: skipped.id, toastId };
            activeUndoTimerRef.current = setTimeout(
              clearActiveUndo,
              UNDO_TOAST_MS,
            );
          }}
          onUnvote={async () => {
            await unvote(sessionId, userId);
            await refreshSession();
          }}
          onVote={async value => {
            await castVote(sessionId, userId, userName, value);
            await refreshSession();

            if (DEMO_MODE) {
              demoVoteTimers.current.forEach(window.clearTimeout);
              const votedStoryId = session.currentStoryId;
              const currentVotes = new Set(
                session.stories
                  .find(story => story.id === votedStoryId)
                  ?.votes.map(vote => vote.userId) ?? [],
              );
              const waitingEngineers = DEMO_ENGINEERS.filter(
                engineer => !currentVotes.has(engineer.userId),
              );
              demoVoteTimers.current = waitingEngineers.map((engineer, index) =>
                window.setTimeout(() => {
                  if (demoStoryId.current !== votedStoryId) {
                    return;
                  }
                  void castVote(
                    sessionId,
                    engineer.userId,
                    engineer.userName,
                    engineer.vote,
                  ).then(refreshSession);
                }, DEMO_VOTE_DELAY_MS * (index + 1)),
              );
            }
          }}
          session={session}
          teamName={teamName}
        />
        {toastEntry && (
          <Box
            style={{
              background: 'var(--bui-bg-neutral-1)',
              border: '1px solid var(--bui-border-1)',
              borderRadius: 'var(--bui-radius-3)',
              bottom: 24,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)',
              left: '50%',
              minWidth: 320,
              padding: '12px 16px',
              position: 'fixed',
              transform: 'translateX(-50%)',
              zIndex: 100,
            }}
          >
            {toastEntry.node}
          </Box>
        )}
      </>
    );
  }

  if (savedCharacterLoading) {
    return (
      <Box p="4">
        <Text as="p" color="secondary">
          Loading session…
        </Text>
      </Box>
    );
  }

  if (savedCharacter) {
    return (
      <Box p="4">
        <Text as="p" color="secondary">
          Joining session…
        </Text>
      </Box>
    );
  }

  return (
    <CharacterPicker
      allowRoleChange={me?.role !== 'host'}
      initialRole={me?.role ?? 'voter'}
      joining={joining}
      onBack={handleBack}
      onJoin={handleCharacterJoin}
      profilePicture={currentUser?.spec.profile?.picture}
      sessionName={session.name}
      teamName={teamName}
      userName={userName}
    />
  );
};

export const LiveSessionTab = () => <LiveSessionTabContent />;
