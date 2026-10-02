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
import { useApi } from '@backstage/core-plugin-api';
import type {
  CreateSessionRequest,
  JoinSessionRequest,
  NewStory,
  Participant,
  ParticipantRole,
  Session,
  SplitResolution,
} from '@backstage-community/plugin-pointing-poker-common';
import { pointingPokerApiRef } from '../../../api/pointingPokerApiRef';

export const useSessionApi = () => {
  const api = useApi(pointingPokerApiRef);

  const getTeamQuery = (teamRef: string): Promise<null | string> =>
    api.getTeamQuery(teamRef);

  const saveTeamQuery = (teamRef: string, jql: string): Promise<void> =>
    api.saveTeamQuery(teamRef, jql);

  const getTeamCards = (teamRef: string): Promise<null | string[]> =>
    api.getTeamCards(teamRef);

  const saveTeamCards = (teamRef: string, cards: string[]): Promise<void> =>
    api.saveTeamCards(teamRef, cards);

  const createSession = (request: CreateSessionRequest): Promise<Session> =>
    api.createSession(request);

  const joinSession = (
    sessionId: string,
    request: JoinSessionRequest,
  ): Promise<Participant> => api.joinSession(sessionId, request);

  const leaveSession = (sessionId: string, userId: string): Promise<void> =>
    api.leaveSession(sessionId, userId);

  const updateRole = (
    sessionId: string,
    userId: string,
    role: ParticipantRole,
  ): Promise<void> => api.updateRole(sessionId, userId, role);

  const castVote = (
    sessionId: string,
    userId: string,
    userName: string,
    value: string,
  ): Promise<Session> => api.castVote(sessionId, { userId, userName, value });

  const unvote = (sessionId: string, userId: string): Promise<Session> =>
    api.unvote(sessionId, userId);

  const setRevealed = (
    sessionId: string,
    revealed: boolean,
  ): Promise<Session> => api.reveal(sessionId, revealed);

  const newRound = (sessionId: string): Promise<Session> =>
    api.newRound(sessionId);

  const skipStory = (sessionId: string): Promise<Session> =>
    api.skip(sessionId);

  const activateStory = (
    sessionId: string,
    storyId: string,
  ): Promise<Session> => api.activateStory(sessionId, storyId);

  const setPresenter = (
    sessionId: string,
    storyId: string,
    presenterUserId: null | string,
  ): Promise<Session> => api.setPresenter(sessionId, storyId, presenterUserId);

  const acceptEstimate = (
    sessionId: string,
    estimate: string,
  ): Promise<Session> => api.accept(sessionId, estimate);

  const splitStory = (
    sessionId: string,
    storyId: string,
    subtasks: NewStory[],
  ): Promise<Session> => api.splitStory(sessionId, storyId, subtasks);

  const resolveSplit = (
    sessionId: string,
    storyId: string,
    mode: SplitResolution,
    estimate?: string,
  ): Promise<Session> => api.resolveSplit(sessionId, storyId, mode, estimate);

  const endSession = (sessionId: string): Promise<void> =>
    api.endSession(sessionId);

  const reopenSession = (sessionId: string): Promise<void> =>
    api.reopenSession(sessionId);

  return {
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
    saveTeamCards,
    saveTeamQuery,
    setPresenter,
    setRevealed,
    skipStory,
    splitStory,
    unvote,
    updateRole,
  };
};
