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
import { makeStyles } from '@material-ui/core/styles';

export const useParticipantsStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    minWidth: 200,
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(0.5),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  userChip: {
    margin: theme.spacing(0.5),
    borderColor: theme.palette.primary.main,
  },
  groupChip: {
    margin: theme.spacing(0.5),
    borderColor: theme.palette.secondary.main,
  },
  entityIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  groupIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main,
  },
  checkboxItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
  },
  selectedParticipantsContainer: {
    marginTop: theme.spacing(3),
  },
  selectedParticipantsList: {
    maxHeight: '250px',
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  selectedParticipantItem: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  groupMemberItem: {
    borderLeft: `4px solid ${theme.palette.secondary.main}`,
  },
  participantsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  clearButton: {
    marginTop: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  searchResults: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxHeight: 300, // Begrenzte Höhe für Scrolling
    overflow: 'hidden',
  },
  searchResultsHeader: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.default,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  searchResultsTitle: {
    fontWeight: 'bold',
  },
  searchResultsList: {
    maxHeight: 250, // Reduziere um Header-Höhe
    overflowY: 'auto',
    padding: 0,
  },
  noResults: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  userAvatar: {
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  groupAvatar: {
    backgroundColor: theme.palette.secondary.main,
    marginRight: theme.spacing(1),
  },
  processingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  participantsContainer: {
    marginTop: theme.spacing(2),
  },
  participantsTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
}));
