import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Card, CardContent, Typography } from '@material-ui/core';

export const KenerStatusCard = () => {
    const { entity } = useEntity();
    const annotations = entity?.metadata.annotations || {};

    const uptimeBadgeUrl = annotations['kener/uptimeBadge'];
    const statusBadgeUrl = annotations['kener/statusBadge'];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Kener Status
                </Typography>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    alignItems: 'flex-start',
                    padding: '16px 0'
                }}>
                    <div style={{ width: '100%' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Status
                        </Typography>
                        <img
                            src={statusBadgeUrl}
                            alt="Kener Status Badge"
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                height: 'auto'
                            }}
                        />
                    </div>
                    <div style={{ width: '100%' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Uptime
                        </Typography>
                        <img
                            src={uptimeBadgeUrl}
                            alt="Kener Uptime Badge"
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                height: 'auto'
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};