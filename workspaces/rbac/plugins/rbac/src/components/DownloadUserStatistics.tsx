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
import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import Button from '@mui/material/Button';

import { licensedUsersApiRef } from '../api/LicensedUsersClient';

function DownloadCSVLink() {
  const licensedUsersClient = useApi(licensedUsersApiRef);
  const handleDownload = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault(); // Prevent the default link behavior

    try {
      const response = await licensedUsersClient.downloadStatistics();

      if (response.ok) {
        // Get the CSV data as a string
        const csvData = await response.text();

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'licensed-users.csv';
        document.body.appendChild(a);
        a.click();

        // Clean up the temporary link and object URL
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(
          `Failed to download the csv file with list licensed users  ${response.statusText}`,
        );
      }
    } catch (error) {
      throw new Error(`Error during the download: ${error}`);
    }
  };

  return (
    <Button
      href="/download-csv"
      onClick={handleDownload}
      sx={{
        color: theme => theme.palette.link,
        textDecoration: 'underline',
      }}
      size="small"
    >
      Download User List
    </Button>
  );
}

export default DownloadCSVLink;
