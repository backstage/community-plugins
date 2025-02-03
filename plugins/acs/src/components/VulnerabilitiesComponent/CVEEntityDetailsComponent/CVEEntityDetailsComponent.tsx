import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTheme } from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';


export const CVEEntityDetailsComponent: React.FC<Props> = ({ data, cveDetails, entityDetails }) => {
    console.log(data)

    const [dataRows, setDataRows] = useState([]);
    const theme = useTheme();
    const isDarkMode = theme.palette.type === 'dark';

    const columns: [] = [
        { name: 'Image', selector: row => row.image, sortable: true, wrap: true, grow: 2 },
        { name: 'Component', selector: row => row.component, sortable: true, wrap: true },
        { name: 'Version', selector: row => row.version, sortable: true, wrap: true, grow: 2 },
        { name: 'CVE fixed in', selector: row => row.cveFixedIn, sortable: true, wrap: true, grow: 2 },
        { name: 'Source', selector: row => row.source, sortable: true, wrap: true },
        { name: 'Location', selector: row => row.location, sortable: true, wrap: true },
    ];

    const severityLabel = `Severity: ${data.expanded_data.severity}`;
    const firstDiscoveredLabel = `First discovered: ${data.expanded_data.first_discovered}`;
    const publishedLabel = `Published: ${data.expanded_data.published}`;

    const workloadLabel = `Workload: ${data.expanded_data.workload}`;
    const namespaceLabel = `Namespace: ${data.expanded_data.namespace}`;
    const clusterLabel = `Cluster: ${data.expanded_data.cluster}`;

    const populateRows = () => {
        const rows = []

        rows.push({
            image: data?.expanded_data?.image || "N/A",
            component: data?.expanded_data?.component || "N/A",
            version: data?.expanded_data?.version || "N/A",
            cveFixedIn: data?.expanded_data?.cveFixedIn || "N/A",
            source: data?.expanded_data?.source || "N/A",
            location: data?.expanded_data?.location || "N/A",
        })

        setDataRows(rows)
    }

    const CVEDetails = () => {
        return (
            <Stack spacing={2}>
               <Typography><b>{cveDetails}</b></Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={severityLabel} color="error" size="small" variant="outlined" />
                    <Chip label={firstDiscoveredLabel} color="default" size="small" variant="outlined" />
                    <Chip label={publishedLabel} color="default" size="small" variant="outlined" />
                  </Stack>
                <Typography>{data.expanded_data.summary}</Typography>
            </Stack>
        )
    }

    const EntityDetails = () => {
        return (
            <Stack spacing={2}>
                <Typography><b>{entityDetails}</b></Typography>
                <Stack direction="row" spacing={1}>
                    <Chip label={workloadLabel} color="default" size="small" variant="outlined" />
                    <Chip label={namespaceLabel} color="default" size="small" variant="outlined" />
                    <Chip label={clusterLabel} color="default" size="small" variant="outlined" />
                </Stack>

                <Box component="section" border={1} borderColor="grey.500" sx={{ p: 2, marginTop: '10px' }}>
                    <DataTable
                        data={dataRows}
                        columns={columns}
                        theme={isDarkMode ? 'dark' : 'light'}
                    />
                </Box>
            </Stack>
        )
    }

    useEffect(() => {
        populateRows()
        // eslint-disable-next-line
    }, []);

    return (
        <Box component="section" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <CVEDetails />
            <EntityDetails />
          </Stack>
        </Box>
    );
};
