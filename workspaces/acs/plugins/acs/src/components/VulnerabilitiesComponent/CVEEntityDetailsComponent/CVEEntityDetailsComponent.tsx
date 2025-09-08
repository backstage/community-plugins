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
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTheme } from '@material-ui/core/styles';
import { Box, Chip, Grid, Typography } from '@material-ui/core';

export const CVEEntityDetailsComponent = ({
  data,
  cveDetails,
  entityDetails,
}: any) => {
  const [dataRows, setDataRows] = useState([]);
  const theme = useTheme();
  const isDarkMode = theme.palette.type === 'dark';

  const columns: any = [
    {
      name: 'Image',
      selector: (row: any) => row.image,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'Component',
      selector: (row: any) => row.component,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Version',
      selector: (row: any) => row.version,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'CVE fixed in',
      selector: (row: any) => row.cveFixedIn,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: 'Source',
      selector: (row: any) => row.source,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Location',
      selector: (row: any) => row.location,
      sortable: true,
      wrap: true,
    },
  ];

  const severityLabel = `Severity: ${data.expandedData.severity}`;
  const firstDiscoveredLabel = `First discovered: ${data.expandedData.firstDiscovered}`;
  const publishedLabel = `Published: ${data.expandedData.published}`;

  const workloadLabel = `Workload: ${data.expandedData.workload}`;
  const namespaceLabel = `Namespace: ${data.expandedData.namespace}`;
  const clusterLabel = `Cluster: ${data.expandedData.cluster}`;

  const populateRows = () => {
    const rows: any = [];

    rows.push({
      image: data?.expandedData?.image || 'N/A',
      component: data?.expandedData?.component || 'N/A',
      version: data?.expandedData?.version || 'N/A',
      cveFixedIn: data?.expandedData?.cveFixedIn || 'N/A',
      source: data?.expandedData?.source || 'N/A',
      location: data?.expandedData?.location || 'N/A',
    });

    setDataRows(rows);
  };

  const CVEDetails = () => {
    return (
      <Box component="section" sx={{ p: 2 }}>
        <Typography>
          <b>{cveDetails}</b>
        </Typography>
        <Grid container direction="row">
          <Chip label={severityLabel} size="small" variant="outlined" />
          <Chip
            label={firstDiscoveredLabel}
            color="default"
            size="small"
            variant="outlined"
          />
          <Chip
            label={publishedLabel}
            color="default"
            size="small"
            variant="outlined"
          />
        </Grid>
        <Typography>{data.expandedData.summary}</Typography>
      </Box>
    );
  };

  const EntityDetails = () => {
    return (
      <Box component="section" sx={{ p: 2 }}>
        <Typography>
          <b>{entityDetails}</b>
        </Typography>
        <Grid container direction="row">
          <Chip
            label={workloadLabel}
            color="default"
            size="small"
            variant="outlined"
          />
          <Chip
            label={namespaceLabel}
            color="default"
            size="small"
            variant="outlined"
          />
          <Chip
            label={clusterLabel}
            color="default"
            size="small"
            variant="outlined"
          />
        </Grid>

        <Box
          component="section"
          border={1}
          borderColor="grey.500"
          sx={{ p: 2, marginTop: '10px' }}
        >
          <DataTable
            data={dataRows}
            columns={columns}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    populateRows();
    // eslint-disable-next-line
  }, []);

  return (
    <Grid container direction="column" justifyContent="space-between">
      <CVEDetails />
      <EntityDetails />
    </Grid>
  );
};
