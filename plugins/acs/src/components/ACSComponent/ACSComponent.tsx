import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
    InfoCard,
    Header,
    Page,
    Content,
    ContentHeader,
} from '@backstage/core-components';

export function ACSComponent() {
    return <Page themeId="tool">
        <Header title="Hello World!" subtitle="Optional subtitle">
        </Header>
        <Content>
            <ContentHeader title="My Plugin Header">
            </ContentHeader>
            <Grid container spacing={3} direction="column">
                <Grid item>
                    <InfoCard title="My Plugin Card">
                        <Typography variant="body1">
                            Hello from my plugin!
                        </Typography>
                    </InfoCard>
                </Grid>
            </Grid>
        </Content>
    </Page>
}

