import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export const CVEEntityDetailsComponent: React.FC<Props> = ({ data, cveDetails, entityDetails }) => {
    const [dataRows, setDataRows] = useState([]);
    
    console.log("CVE Entity Details Component Data: ", data);

    const columns: [] = [
        { name: 'Image', selector: row => row.image, sortable: true, wrap: true, width: '200px' },
        { name: 'Component', selector: row => row.component, sortable: true, wrap: true, width: '150px' },
        { name: 'Version', selector: row => row.version, sortable: true, wrap: true, width: '100px' },
        { name: 'CVE fixed in', selector: row => row.cveFixedIn, sortable: true, wrap: true, width: '150px' },
        { name: 'Source', selector: row => row.source, sortable: true, wrap: true, width: '100px' },
        { name: 'Location', selector: row => row.location, sortable: true, wrap: true, width: '150px' },
        { name: 'Advisory', selector: row => row.advisory, sortable: true, wrap: true, width: '100px' }
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
            advisory: data?.expanded_data?.advisory || "N/A"
        })

        setDataRows(rows)
    }

    const CVEDetails = () => {
        return (
            <div>
                <p><b>{cveDetails}</b></p>
                <Stack direction="row" spacing={1}>
                    <Chip label={severityLabel} color="error" size="small" variant="outlined" />
                    <Chip label={firstDiscoveredLabel} color="default" size="small" variant="outlined" />
                    <Chip label={publishedLabel} color="default" size="small" variant="outlined" />
                </Stack>
                <p>{data.expanded_data.summary}</p>
            </div>
        )
    }

    const EntityDetails = () => {
        return (
            <div>
                <p><b>{entityDetails}</b></p>
                <Stack direction="row" spacing={1}>
                    <Chip label={workloadLabel} color="default" size="small" variant="outlined" />
                    <Chip label={namespaceLabel} color="default" size="small" variant="outlined" />
                    <Chip label={clusterLabel} color="default" size="small" variant="outlined" />
                </Stack>

                <Box component="section" border={1} borderColor="grey.500" sx={{ p: 2, marginTop: '10px' }}>
                    <DataTable
                        data={dataRows}
                        columns={columns}
                        theme="dark"
                    />
                </Box>
            </div>
        )
    }

    useEffect(() => {
        populateRows()
    }, []);

    return (
        <Box component="section" sx={{ p: 2 }}>
            <CVEDetails />
            <EntityDetails />
        </Box>
    );
};