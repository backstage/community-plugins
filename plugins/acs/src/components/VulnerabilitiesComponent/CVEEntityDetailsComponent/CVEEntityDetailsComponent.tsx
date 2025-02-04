import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTheme } from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';


export const CVEEntityDetailsComponent: React.FC<Props> = ({ data, cveDetails, entityDetails }) => {
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

    const severityLabel = `Severity: ${data.expandedData.severity}`;
    const firstDiscoveredLabel = `First discovered: ${data.expandedData.firstDiscovered}`;
    const publishedLabel = `Published: ${data.expandedData.published}`;

    const workloadLabel = `Workload: ${data.expandedData.workload}`;
    const namespaceLabel = `Namespace: ${data.expandedData.namespace}`;
    const clusterLabel = `Cluster: ${data.expandedData.cluster}`;

    const populateRows = () => {
        const rows = []

        rows.push({
            image: data?.expandedData?.image || "N/A",
            component: data?.expandedData?.component || "N/A",
            version: data?.expandedData?.version || "N/A",
            cveFixedIn: data?.expandedData?.cveFixedIn || "N/A",
            source: data?.expandedData?.source || "N/A",
            location: data?.expandedData?.location || "N/A",
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
                <Typography>{data.expandedData.summary}</Typography>
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
