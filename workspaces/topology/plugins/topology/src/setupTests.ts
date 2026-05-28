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
import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';

jest.mock('@material-ui/core/styles', () => {
  const actual = jest.requireActual('@material-ui/core/styles');
  const theme = actual.createTheme({
    palette: {
      status: {
        ok: '#1e8549',
        running: '#0366d6',
        pending: '#f0ab00',
        warning: '#f0ab00',
        error: '#c9190b',
      },
    },
  });
  const makeStyles = (stylesOrFn: unknown) => {
    if (typeof stylesOrFn === 'function') {
      return () => (stylesOrFn as (t: typeof theme) => unknown)(theme);
    }
    return () => stylesOrFn;
  };
  return {
    ...actual,
    useTheme: jest.fn(() => theme),
    makeStyles,
  };
});

jest.mock('@material-ui/styles', () => {
  const actual = jest.requireActual('@material-ui/styles');
  const coreStyles = jest.requireActual('@material-ui/core/styles');
  const theme = coreStyles.createTheme({
    palette: {
      status: {
        ok: '#1e8549',
        running: '#0366d6',
        pending: '#f0ab00',
        warning: '#f0ab00',
        error: '#c9190b',
      },
    },
  });
  const makeStyles = (stylesOrFn: unknown) => {
    if (typeof stylesOrFn === 'function') {
      return () => (stylesOrFn as (t: typeof theme) => unknown)(theme);
    }
    return () => stylesOrFn;
  };
  return {
    ...actual,
    useTheme: jest.fn(() => theme),
    makeStyles,
  };
});
