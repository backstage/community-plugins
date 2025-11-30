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
import { FONT_FAMILY } from '../theme/fonts';
import { SimpleTooltip } from './SimpleTooltip';

interface ComponentDisplayProps {
  /**
   * The file path to display
   */
  filePath?: string;

  /**
   * The component name to display
   */
  component: string;
}

/**
 * A component to display file path and component name in a two-line format
 */
export const ComponentDisplay = ({
  filePath = '',
  component,
}: ComponentDisplayProps) => {
  const tooltipText = `${filePath}\n${component}`;

  return (
    <SimpleTooltip title={tooltipText} centered>
      <div
        style={{
          textAlign: 'left',
          lineHeight: '1.2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#666' }}>{filePath}</div>
        <div style={{ fontSize: '0.875rem', fontFamily: FONT_FAMILY }}>
          {component}
        </div>
      </div>
    </SimpleTooltip>
  );
};
