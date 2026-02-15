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
import type { MouseEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';

type TablePaginationActionsProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (e: MouseEvent<HTMLButtonElement>, value: number) => void;
};

const FirstPageIcon = () => (
  <SvgIcon
    width="12"
    height="9"
    viewBox="-4 0 21 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1.10156 5.10156L5.60156 0.625C5.8125 0.390625 6.16406 0.390625 6.39844 0.625C6.60938 0.835938 6.60938 1.1875 6.39844 1.39844L2.27344 5.5L6.375 9.625C6.60938 9.83594 6.60938 10.1875 6.375 10.3984C6.16406 10.6328 5.8125 10.6328 5.60156 10.3984L1.10156 5.89844C0.867188 5.6875 0.867188 5.33594 1.10156 5.10156ZM10.1016 0.601562V0.625C10.3125 0.390625 10.6641 0.390625 10.8984 0.625C11.1094 0.835938 11.1094 1.1875 10.8984 1.39844L6.77344 5.52344L10.875 9.625C11.1094 9.83594 11.1094 10.1875 10.875 10.3984C10.6641 10.6328 10.3125 10.6328 10.1016 10.3984L5.60156 5.89844C5.36719 5.6875 5.36719 5.33594 5.60156 5.10156L10.1016 0.601562Z" />
  </SvgIcon>
);

const LastPageIcon = () => (
  <SvgIcon
    width="12"
    height="9"
    viewBox="-5 0 21 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.8984 5.10156C11.1094 5.33594 11.1094 5.6875 10.8984 5.89844L6.39844 10.3984C6.16406 10.6328 5.8125 10.6328 5.60156 10.3984C5.36719 10.1875 5.36719 9.83594 5.60156 9.625L9.70312 5.52344L5.60156 1.39844C5.36719 1.1875 5.36719 0.835938 5.60156 0.625C5.8125 0.390625 6.16406 0.390625 6.375 0.625L10.8984 5.10156ZM1.89844 0.601562L6.39844 5.10156C6.60938 5.33594 6.60938 5.6875 6.39844 5.89844L1.89844 10.3984C1.66406 10.6328 1.3125 10.6328 1.10156 10.3984C0.867188 10.1875 0.867188 9.83594 1.10156 9.625L5.20312 5.52344L1.10156 1.39844C0.867188 1.1875 0.867188 0.835938 1.10156 0.625C1.3125 0.390625 1.66406 0.390625 1.875 0.625L1.89844 0.601562Z" />
  </SvgIcon>
);

const ArrowLeft = () => (
  <SvgIcon
    width="12"
    height="9"
    viewBox="-6 0 21 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0.601562 5.10156L5.10156 0.625C5.3125 0.390625 5.66406 0.390625 5.89844 0.625C6.10938 0.835938 6.10938 1.1875 5.89844 1.39844L1.77344 5.5L5.875 9.625C6.10938 9.83594 6.10938 10.1875 5.875 10.3984C5.66406 10.6328 5.3125 10.6328 5.10156 10.3984L0.601562 5.89844C0.367188 5.6875 0.367188 5.33594 0.601562 5.10156Z" />
  </SvgIcon>
);

const ArrowRight = () => (
  <SvgIcon
    width="12"
    height="9"
    viewBox="-7 0 21 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6.39844 5.10156C6.60938 5.33594 6.60938 5.6875 6.39844 5.89844L1.89844 10.3984C1.66406 10.6328 1.3125 10.6328 1.10156 10.3984C0.867188 10.1875 0.867188 9.83594 1.10156 9.625L5.20312 5.52344L1.10156 1.39844C0.867188 1.1875 0.867188 0.835938 1.10156 0.625C1.3125 0.390625 1.66406 0.390625 1.875 0.625L6.39844 5.10156Z" />
  </SvgIcon>
);

export const TablePaginationActions = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: TablePaginationActionsProps) => {
  const theme = useTheme();

  const handleFirstPageButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    onPageChange(e, 0);
  };

  const handleBackButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    onPageChange(e, page - 1);
  };

  const handleNextButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    onPageChange(e, page + 1);
  };

  const handleLastPageButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        paddingLeft: '24px',
        paddingRight: '12px',
      }}
    >
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
        size="large"
        sx={{
          padding: '0',
          color: theme.palette.mode === 'light' ? '#073C8C' : 'white',
          '&:disabled': {
            color: '#C4C6CB',
          },
        }}
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
        size="large"
        sx={{
          padding: '0',
          color: theme.palette.mode === 'light' ? '#073C8C' : 'white',
          '&:disabled': {
            color: '#C4C6CB',
          },
        }}
      >
        {theme.direction === 'rtl' ? <ArrowRight /> : <ArrowLeft />}
      </IconButton>
      <span style={{ whiteSpace: 'nowrap' }}>{`Page ${
        count > 0 ? page + 1 : 0
      } of ${Math.ceil(count / rowsPerPage)}`}</span>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        size="large"
        sx={{
          padding: '0',
          color: theme.palette.mode === 'light' ? '#073C8C' : 'white',
          '&:disabled': {
            color: '#C4C6CB',
          },
        }}
      >
        {theme.direction === 'rtl' ? <ArrowLeft /> : <ArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
        size="large"
        sx={{
          padding: '0',
          color: theme.palette.mode === 'light' ? '#073C8C' : 'white',
          '&:disabled': {
            color: '#C4C6CB',
          },
        }}
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
};
