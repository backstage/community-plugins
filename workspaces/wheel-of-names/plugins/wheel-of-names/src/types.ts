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
// eslint-disable-next-line @backstage/no-undeclared-imports
import { Entity } from '@backstage/catalog-model';

/**
 * Represents a participant in the wheel of names
 * @public
 */
export interface Participant {
  id: string;
  name: string;
  displayName?: string;
  fromGroup?: string;
}

/**
 * Props for the Participants component
 * @public
 */
export interface ParticipantsProps {
  onParticipantsChange: (participants: Participant[]) => void;
  initialParticipants?: Participant[];
}

/**
 * Props for the ParticipantsList component
 * @public
 */
export interface ParticipantsListProps {
  participants: Participant[];
  onRemoveParticipant: (id: string) => void;
  onClearAll: () => void;
  isProcessing: boolean;
}

/**
 * Props for the EntityPicker component
 * @public
 */
export interface EntityPickerProps {
  entities: Entity[];
  selectedEntities: string[];
  onChange: (selected: string[]) => void;
  isProcessing: boolean;
}

/**
 * Entity spec type for handling profile information
 * @public
 */
export interface EntitySpec {
  profile?: {
    displayName?: string;
  };
  [key: string]: any;
}

/**
 * Main props for the Wheel component
 * @public
 */
export interface WheelProps {
  participants: Participant[];
}
