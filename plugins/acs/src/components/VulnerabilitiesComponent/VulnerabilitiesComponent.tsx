import React, { useEffect } from 'react';
import {
  Box,
  Typography,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { queryACSData } from '../../common/QueryACS';
import { SecurityFindingsComponent } from './SecurityFindingsComponent';

export const VulnerabilitiesComponent = () => {
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
        <Box>
            <SecurityFindingsComponent data={ACSDataResult} />
        </Box>
    );
};