/*
 * Copyright 2025 The Backstage Authors
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
import React, { useEffect, useState, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useParticipantsStyles } from './Styles';
import { EntityPicker } from './EntityPicker';
import { ParticipantsList } from './List';
import { EntityService } from './Service';

export interface ParticipantsProps {
  onParticipantsChange: (
    participants: Array<{ id: string; name: string; displayName?: string }>,
  ) => void;
}

export const Participants = ({ onParticipantsChange }: ParticipantsProps) => {
  const classes = useParticipantsStyles();
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [excludedUsers, setExcludedUsers] = useState<Set<string>>(new Set());
  const [resolvedParticipants, setResolvedParticipants] = useState<
    Array<{
      id: string;
      name: string;
      displayName?: string;
      fromGroup?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [processingGroups, setProcessingGroups] = useState(false);

  // Create service instance
  const entityService = useMemo(
    () => new EntityService(catalogApi),
    [catalogApi],
  );

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const fetchedEntities = await entityService.fetchEntities();
        setEntities(fetchedEntities);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load entities'),
        );
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [entityService]);

  const handleSelectionChange = async (selected: string[]) => {
    setSelectedEntities(selected);
    setProcessingGroups(true);

    try {
      const selectedEntitiesList = entities.filter(entity => {
        if (!entity.metadata.uid) return false;
        return selected.includes(entity.metadata.uid);
      });

      const participants = await entityService.resolveParticipants(
        selectedEntitiesList,
        excludedUsers,
      );

      setResolvedParticipants(participants);
      onParticipantsChange(participants);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to process groups'),
      );
    } finally {
      setProcessingGroups(false);
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    // Find the participant to get details about it
    const participant = resolvedParticipants.find(p => p.id === participantId);

    if (participant) {
      // If removing from a group, add to excluded users list
      if (participant.fromGroup) {
        setExcludedUsers(prev => new Set([...prev, participantId]));
      } else {
        // If directly selected, remove it from selectedEntities
        setSelectedEntities(prev => prev.filter(id => id !== participantId));
      }

      // Remove from resolved participants
      const newParticipants = resolvedParticipants.filter(
        p => p.id !== participantId,
      );
      setResolvedParticipants(newParticipants);
      onParticipantsChange(newParticipants);
    }
  };

  const handleClearSelection = () => {
    setSelectedEntities([]);
    setResolvedParticipants([]);
    setExcludedUsers(new Set()); // Reset excluded users
    onParticipantsChange([]);
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Participants
        </Typography>

        {/* Entity Picker Component */}
        <EntityPicker
          entities={entities}
          selectedEntities={selectedEntities}
          onChange={handleSelectionChange}
          isProcessing={processingGroups}
        />

        {/* Loading indicator */}
        {processingGroups && (
          <div className={classes.loadingContainer}>
            <CircularProgress size={24} />
          </div>
        )}

        {/* Selected Participants List */}
        <ParticipantsList
          participants={resolvedParticipants}
          onRemoveParticipant={handleRemoveParticipant}
          onClearAll={handleClearSelection}
          isProcessing={processingGroups}
        />
      </CardContent>
    </Card>
  );
};
