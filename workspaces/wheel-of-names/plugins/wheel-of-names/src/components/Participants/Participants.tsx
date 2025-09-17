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
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Entity } from '@backstage/catalog-model';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Avatar,
  InputAdornment,
} from '@material-ui/core';

import { Alert } from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import AddIcon from '@material-ui/icons/Add';
import { useParticipantsStyles } from './Styles';
import { ParticipantsList } from './List';
import { EntityService } from './Service';
import ClearIcon from '@material-ui/icons/Clear';

export interface Participant {
  id: string;
  name: string;
  displayName?: string;
  fromGroup?: string;
}

interface EntitySpec {
  profile?: {
    displayName?: string;
  };
  [key: string]: any;
}

export interface ParticipantsProps {
  onParticipantsChange: (participants: Participant[]) => void;
  initialParticipants?: Participant[];
}

export const Participants = ({
  onParticipantsChange,
  initialParticipants = [],
}: ParticipantsProps) => {
  const classes = useParticipantsStyles();
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const searchLimit =
    configApi.getOptionalNumber('wheelOfNames.searchLimit') || 10;
  const [entities, setEntities] = useState<Entity[]>([]);
  const [excludedUsers, setExcludedUsers] = useState<Set<string>>(new Set());
  const [resolvedParticipants, setResolvedParticipants] = useState<
    Array<{
      id: string;
      name: string;
      displayName?: string;
      fromGroup?: string;
    }>
  >(initialParticipants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [processingGroups, setProcessingGroups] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // New state variables for pagination
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const totalEntitiesRef = useRef<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Create service instance
  const entityService = useMemo(
    () => new EntityService(catalogApi),
    [catalogApi],
  );

  // Handle intersection observer for infinite scrolling
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && searchTerm) {
          setPage(prevPage => prevPage + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, searchTerm],
  );

  // Effect to fetch entities based on search term
  useEffect(() => {
    if (!searchTerm) {
      setEntities([]);
      setHasMore(true);
      setPage(0);
      totalEntitiesRef.current = 0;
      return;
    }

    // Reset when search term changes
    if (page === 0) {
      setEntities([]);
      totalEntitiesRef.current = 0;
    }

    const loadEntities = async () => {
      setLoading(true);
      try {
        const offset = page * searchLimit;
        const fetchedEntities = await entityService.fetchEntities(
          searchTerm,
          searchLimit,
          offset,
        );

        // If fewer entries are returned than requested, we've reached the end
        if (fetchedEntities.items.length < searchLimit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // Update total items count
        setTotalItems(fetchedEntities.totalItems);

        // Append entries instead of replacing them
        setEntities(prevEntities =>
          page === 0
            ? fetchedEntities.items
            : [...prevEntities, ...fetchedEntities.items],
        );

        totalEntitiesRef.current += fetchedEntities.items.length;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load entities'),
        );
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [entityService, searchTerm, searchLimit, page]);

  // Handle search input with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value); // Update input value immediately for responsiveness

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to update search term after user stops typing
    const timeout = setTimeout(() => {
      // Reset when search term changes
      setPage(0);
      setEntities([]);
      setHasMore(true);
      totalEntitiesRef.current = 0;
      setSearchTerm(value);
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };

  // Add entity to participants (either a user directly or members of a group)
  const handleAddEntity = async (entity: Entity) => {
    if (!entity.metadata.uid) return;

    setProcessingGroups(true);

    try {
      if (entity.kind === 'Group') {
        // If it's a group, fetch its members
        const groupMembers = await entityService.fetchGroupMembers(
          entity.metadata.name,
        );

        // Process all members of the group that aren't already excluded
        const newParticipants = [];

        for (const member of groupMembers) {
          if (!member.metadata.uid || excludedUsers.has(member.metadata.uid))
            continue;

          // Skip if already in participants
          if (resolvedParticipants.some(p => p.id === member.metadata.uid))
            continue;

          newParticipants.push({
            id: member.metadata.uid,
            name: member.metadata.name,
            displayName:
              // Type assertion to handle potential undefined values
              (member.spec as EntitySpec)?.profile?.displayName ||
              member.metadata.title ||
              member.metadata.name,
            fromGroup: entity.metadata.name,
          });
        }

        // Add new participants to existing ones
        const updatedParticipants = [
          ...resolvedParticipants,
          ...newParticipants,
        ];
        setResolvedParticipants(updatedParticipants);
        onParticipantsChange(updatedParticipants);
      } else {
        // Skip if already in participants
        if (resolvedParticipants.some(p => p.id === entity.metadata.uid))
          return;

        const newParticipant: Participant = {
          id: entity.metadata.uid,
          name: entity.metadata.name,
          displayName:
            // Type assertion to handle potential undefined values
            (entity.spec as EntitySpec)?.profile?.displayName ||
            entity.metadata.title ||
            entity.metadata.name,
        };

        const updatedParticipants = [...resolvedParticipants, newParticipant];
        setResolvedParticipants(updatedParticipants);
        onParticipantsChange(updatedParticipants);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add entity'));
    } finally {
      setProcessingGroups(false);
    }
  };

  // Handle removal of a participant
  const handleRemoveParticipant = (participantId: string) => {
    // Find the participant to determine if it was from a group
    const participant = resolvedParticipants.find(p => p.id === participantId);

    if (participant && participant.fromGroup) {
      // If from a group, add to excluded users to prevent re-adding when group is selected again
      setExcludedUsers(prev => new Set([...prev, participantId]));
    }

    // Remove from participants list
    const updatedParticipants = resolvedParticipants.filter(
      p => p.id !== participantId,
    );

    setResolvedParticipants(updatedParticipants);
    onParticipantsChange(updatedParticipants);
  };

  // Clear all participants
  const handleClearSelection = () => {
    setResolvedParticipants([]);
    setExcludedUsers(new Set());
    onParticipantsChange([]);
  };

  // Add this function inside your component
  const handleClearSearch = () => {
    setSearchTerm('');
    setInputValue(''); // Clear both states
    setEntities([]);
    setPage(0);
    setHasMore(true);
    totalEntitiesRef.current = 0;
  };

  return (
    <Card>
      <CardHeader title="Participants" />
      <CardContent>
        {error && (
          <Alert severity="error" className={classes.alert}>
            {error.message}
          </Alert>
        )}

        {/* Search field */}
        <TextField
          label="Search users and groups"
          variant="outlined"
          fullWidth
          margin="normal"
          value={inputValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading && <CircularProgress size={20} />}
                {!loading && searchTerm && (
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />

        {/* Search Results */}
        {searchTerm && entities.length > 0 && (
          <Card variant="outlined" className={classes.searchResults}>
            <div className={classes.searchResultsHeader}>
              <Typography
                variant="subtitle2"
                className={classes.searchResultsTitle}
              >
                {totalItems} results
              </Typography>
              <Divider />
            </div>
            <List className={classes.searchResultsList} dense>
              {entities.map((entity, index) => {
                // Skip if already selected
                const isUserAlreadySelected = resolvedParticipants.some(
                  p => p.id === entity.metadata.uid,
                );

                const isGroupMemberAlreadyExcluded =
                  entity.kind === 'User' &&
                  entity.metadata.uid &&
                  excludedUsers.has(entity.metadata.uid);

                if (isUserAlreadySelected || isGroupMemberAlreadyExcluded) {
                  return null;
                }

                const displayName =
                  // Type assertion to handle potential undefined values
                  (entity.spec as EntitySpec)?.profile?.displayName ||
                  entity.metadata.title ||
                  entity.metadata.name;

                return (
                  <ListItem
                    key={entity.metadata.uid}
                    button
                    // Apply ref to last element for infinite scrolling
                    ref={
                      index === entities.length - 1 ? lastElementRef : undefined
                    }
                  >
                    <Avatar
                      className={
                        entity.kind === 'Group'
                          ? classes.groupAvatar
                          : classes.userAvatar
                      }
                    >
                      {entity.kind === 'Group' ? <GroupIcon /> : <PersonIcon />}
                    </Avatar>
                    <ListItemText
                      primary={displayName}
                      secondary={entity.kind}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="add"
                        onClick={() => handleAddEntity(entity)}
                        disabled={processingGroups}
                      >
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
              {/* Loading indicator for infinite scrolling */}
              {loading && (
                <ListItem ref={loadingRef} button>
                  <ListItemText
                    secondary={
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <CircularProgress size={20} />
                      </div>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Card>
        )}

        {searchTerm && !loading && entities.length === 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            className={classes.noResults}
          >
            No users or groups found. Try a different search term.
          </Typography>
        )}

        {processingGroups && (
          <div className={classes.processingContainer}>
            <CircularProgress size={24} />
            <Typography variant="body2">Processing group members...</Typography>
          </div>
        )}

        {/* Current participants list */}
        <div className={classes.participantsContainer}>
          <ParticipantsList
            participants={resolvedParticipants}
            onRemoveParticipant={handleRemoveParticipant}
            onClearAll={handleClearSelection}
            isProcessing={processingGroups}
          />
        </div>
      </CardContent>
    </Card>
  );
};
