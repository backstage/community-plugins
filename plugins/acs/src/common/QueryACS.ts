import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

export const queryACSData = (serviceName: string) => {
    const [result, setResult] = useState([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const getACSData = async() => {
        await fetch(`${backendUrl}/api/proxy/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${serviceName}`)
            .then(response => response.text())
            .then(text => {
                const lines = text.split('\n');

                const jsonData = lines.map(line => {
                    if (line.trim()) {  // Skip empty lines
                        return JSON.parse(line);
                    }
                });

                jsonData.pop()

                setLoaded(true)
                setResult(jsonData)
            })
            .catch((_error) => {
                setError(true)
                console.error(`Error fetching ACS data for ${data?.serviceName}`);
            })
    }

    useEffect(() => {
        getACSData()

    }, [backendUrl]);

    return { result, loaded, error }
}
