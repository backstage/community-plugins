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
import React from 'react';
import useStyles from './useStyles';

export interface ChatSuggestionOptionsProps {
  suggestions: string[];
  optionSelected: (option: string) => void;
}

export function ChatSuggestionOptions({
  suggestions,
  optionSelected,
}: ChatSuggestionOptionsProps) {
  const styles = useStyles();
  return (
    <div className={styles.optionsContainer}>
      {suggestions.map((suggestion: string, index: number) => (
        <div key={index} className={styles.optionContainer}>
          <input
            type="radio"
            id={`option-${index}`}
            name="suggestions"
            value={(index + 1).toString()}
            onChange={e => optionSelected(String(e.target.value))}
          />
          <label htmlFor={`option-${index}`}>{suggestion}</label>
        </div>
      ))}
      <div className={styles.optionContainer}>
        <input
          type="radio"
          id="option-no"
          name="suggestions"
          value="no"
          onChange={e => optionSelected(String(e.target.value))}
        />
        <label htmlFor="option-no">none of these options</label>
      </div>
    </div>
  );
}
