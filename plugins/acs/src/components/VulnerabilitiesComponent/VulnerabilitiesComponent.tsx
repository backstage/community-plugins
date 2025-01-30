import React, { useState } from 'react';
import {
  Box,
  Typography,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import QueryACSData from '../../common/QueryACS';
import { SecurityFindingsComponent } from './SecurityFindingsComponent';

import { DataFilterComponent } from '../DataFilterComponent';

export const VulnerabilitiesComponent = ({ deploymentName }) => {
    const {
        result: ACSDataResult,
        loaded: ACSDataLoaded,
        error: ACSDataError,
    } = QueryACSData(deploymentName);

    const useStyles = makeStyles(theme => ({
        root: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    }));

    const classes = useStyles();

    const [filters, setFilters] = useState({});

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

    if (ACSDataResult.length === 0) {
        return (
            <InfoCard>
                <Typography align="center" variant="button">
                    No results found for query {deploymentName}. The annotation `rhdh/acs-deployment:` followed by the deployment name of the entity will need to be added to the entity for data to display.
                </Typography>
            </InfoCard>
        );
    }

    return (
        <Box>
            <DataFilterComponent
                setFilters={setFilters}
                data={ACSDataResult}
            />

            <SecurityFindingsComponent data={ACSDataResult} filters={filters} />
        </Box>
    );
};
