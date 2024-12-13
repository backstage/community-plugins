import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

export const queryACSData = () => {
    const [result, setResult] = useState([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    // Get catalog data
    const { entity } = useEntity();

    // TODO: Discuss potential differences in catalog entity data format across different backstage instances
    const retrieveCatalogItem = () => {
        return entity?.metadata?.name
    }

    const getACSData = async() => {
        const deploymentName = retrieveCatalogItem()

        await fetch(`${backendUrl}/api/proxy/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${deploymentName}`)
            .then(response => response.text())
            .then(text => {

                const lines = text.split('\n');

                const jsonData = lines.map(line => {
                    if (line.trim()) {  // Skip empty lines
                        return JSON.parse(line);
                    }
                });

                // TODO: fix issue where additional index is added which is just an undefined
                jsonData.pop()

                setLoaded(true)
                setResult(jsonData)
            })
            .catch((_error) => {
                setError(true)
                console.error(`Error fetching ACS data for ${deploymentName}`);
            })
    }

    useEffect(() => {
        getACSData()

    }, [backendUrl]);

    return { result, loaded, error }
}