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
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import { tableIconMap, TableIcon } from './table.icons';

type TableMessageProps = {
  icon: TableIcon;
  message: string;
  title: string;
};

export const TableMessage = ({ icon, message, title }: TableMessageProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        flexDirection: 'column',
        gap: '16px',
        padding: '100px 0',
      }}
    >
      <div
        style={{
          backgroundColor: '#DBE8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50px',
          width: '40px',
          height: '40px',
        }}
      >
        <SvgIcon viewBox="-4 -3 24 24">{tableIconMap[icon]}</SvgIcon>
      </div>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">{message}</Typography>
    </div>
  );
};
