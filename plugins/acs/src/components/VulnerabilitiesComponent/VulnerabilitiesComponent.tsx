import React, { useEffect } from 'react';
import {
  Grid,
  Typography,
} from '@material-ui/core';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { InfoCard } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { queryACSData } from '../../common/QueryACS'

export const VulnerabilitiesComponent = (data: any) => {
    const {
        result: ACSDataResult,
        loaded: ACSDataLoaded,
        error: ACSDataError,
    } = queryACSData();

    console.log("ACSDataResult: ", ACSDataResult)
    console.log("ACSDataLoaded: ", ACSDataLoaded)
    console.log("ACSDataError: ", ACSDataError)

    useEffect(() => {

    }, [ACSDataResult]);

    const useStyles = makeStyles(theme => ({
        root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
        },
    }));

    const classes = useStyles();

    const columns: GridColDef[] = [
        { field: 'deployment', headerName: 'Deployment', width: 150 },
        { field: 'cvesBySeverity', headerName: 'CVEs by Severity', width: 150 },
        { field: 'cluster', headerName: 'Cluster', width: 150 },
        { field: 'namespace', headerName: 'Namespace', width: 150 },
        { field: 'images', headerName: 'Images', width: 150 },
        { field: 'firstDiscovered', headerName: 'First Discovered', width: 150 },
      ];

      const [nbRows, setNbRows] = React.useState(3);

    if (ACSDataError) {
        return (
            <InfoCard>
                <Typography align="center" variant="button">
                    Error retrieving data from ACS.
                </Typography>
            </InfoCard>
        );
    }
    
    if (!ACSDataLoaded) {
        return (
            <InfoCard className={classes.root}>
                <LinearProgress />
            </InfoCard>
        );
    }

    return (
        <Grid container spacing={3} direction="column">
            <DataGrid {...ACSDataResult} rows={ACSDataResult.slice(0, nbRows)} columns={columns} slots={{ toolbar: GridToolbar }} />
        </Grid>
    );
};