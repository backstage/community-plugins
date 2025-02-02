import React from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

export const KenerStatusPage = () => {
    const { entity } = useEntity();
    const annotations = entity?.metadata.annotations || {};

    const uptimeBadgeUrl = annotations['kener/uptimeBadge'];
    const statusBadgeUrl = annotations['kener/statusBadge'];

    return (
        <Page themeId="tool">
            <Header title="Kener Status" subtitle={`For ${entity?.metadata.name || 'Unknown Entity'}`} />
            <Content>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <img
                            src={uptimeBadgeUrl}
                            alt="Kener Uptime Badge"
                            style={{ maxWidth: '200px' }}
                        />
                        <img
                            src={statusBadgeUrl}
                            alt="Kener Status Badge"
                            style={{ maxWidth: '200px' }}
                        />
                    </div>
                </div>
            </Content>
        </Page>
    );
};