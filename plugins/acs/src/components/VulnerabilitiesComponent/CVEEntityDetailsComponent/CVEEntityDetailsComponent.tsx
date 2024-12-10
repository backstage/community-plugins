import React, { useEffect } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export const CVEEntityDetailsComponent: React.FC<Props> = ({ data, cveDetails, entityDetails }) => {
    console.log("CVE Entity Details Component Data: ", data);
    
    const severityLabel = `Severity: ${data.expanded_data.severity}`;
    const firstDiscoveredLabel = `First discovered: ${data.expanded_data.first_discovered}`;
    const publishedLabel = `Published: ${data.expanded_data.published}`;

    const workloadLabel = `Workload: ${data.expanded_data.workload}`;
    const namespaceLabel = `Namespace: ${data.expanded_data.namespace}`;
    const clusterLabel = `Cluster: ${data.expanded_data.cluster}`;

    return (
        <>
            <p><b>{cveDetails}</b></p>
            <Stack direction="row" spacing={1}>
                <Chip label={severityLabel} color="error" size="small" variant="outlined" />
                <Chip label={firstDiscoveredLabel} color="default" size="small" variant="outlined" />
                <Chip label={publishedLabel} color="default" size="small" variant="outlined" />
            </Stack>
            <p>{data.expanded_data.summary}</p>

            <p><b>{entityDetails}</b></p>
            <Stack direction="row" spacing={1}>
                <Chip label={workloadLabel} color="default" size="small" variant="outlined" />
                <Chip label={namespaceLabel} color="default" size="small" variant="outlined" />
                <Chip label={clusterLabel} color="default" size="small" variant="outlined" />
            </Stack>
        </>
    );
};