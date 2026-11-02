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
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionProgress } from './SessionProgress';

jest.mock('./hooks/useSessionApi', () => ({
  useSessionApi: () => ({ getTeamQuery: jest.fn().mockResolvedValue(null) }),
}));

const stories = [
  {
    id: 's1',
    title: 'First issue',
    ticketKey: 'SCRUM-42',
    state: 'active' as const,
  },
  {
    id: 's2',
    title: 'Second issue',
    ticketKey: 'SCRUM-43',
    state: 'pending' as const,
  },
  {
    id: 's3',
    title: 'Third issue',
    ticketKey: 'SCRUM-44',
    state: 'pending' as const,
  },
];

describe('SessionProgress', () => {
  it('activates a queued story, closes the queue, and shows the selected position', () => {
    const onActivate = jest.fn();
    const { rerender } = render(
      <SessionProgress
        currentStoryId="s1"
        stories={stories}
        onActivateStory={onActivate}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Story 1 of 3/ }));
    fireEvent.click(
      screen.getByRole('button', { name: /SCRUM-44 Third issue/ }),
    );
    expect(onActivate).toHaveBeenCalledWith('s3');
    expect(
      screen.queryByRole('button', { name: /SCRUM-44 Third issue/ }),
    ).not.toBeInTheDocument();
    rerender(
      <SessionProgress
        currentStoryId="s3"
        stories={stories.map(s => ({
          ...s,
          state: s.id === 's3' ? 'active' : 'pending',
        }))}
        onActivateStory={onActivate}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Story 3 of 3/ }));
    expect(
      screen.getByRole('button', { name: /SCRUM-42 First issue/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /SCRUM-44 Third issue/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps the queue read-only for participants without activation access', () => {
    render(<SessionProgress currentStoryId="s1" stories={stories} />);
    fireEvent.click(screen.getByRole('button', { name: /^Story 1 of 3/ }));
    expect(screen.getByText('Third issue')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Third issue/ }),
    ).not.toBeInTheDocument();
  });
});
