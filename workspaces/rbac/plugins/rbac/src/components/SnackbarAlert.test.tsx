/*
 * Copyright 2024 The Backstage Authors
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

import { SnackbarAlert } from './SnackbarAlert';

describe('SnackbarAlert', () => {
  it('displays the Snackbar with the message when toastMessage is provided', () => {
    const toastMessage = 'Test message';
    render(
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={() => {}} />,
    );

    expect(screen.getByText(toastMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(toastMessage);
  });

  it('does not display the Snackbar when toastMessage is an empty string', () => {
    render(<SnackbarAlert toastMessage="" onAlertClose={() => {}} />);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('calls onAlertClose when the Snackbar is closed', () => {
    const onAlertClose = jest.fn();
    render(
      <SnackbarAlert toastMessage="Test message" onAlertClose={onAlertClose} />,
    );

    fireEvent.click(screen.getByLabelText(/close/i));

    expect(onAlertClose).toHaveBeenCalled();
  });
});
