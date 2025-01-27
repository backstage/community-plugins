import react, { useCallback, useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

const QueryACSData = (serviceName: string) => {
    const [result, setResult] = useState([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const getACSData = useCallback(() => {
        fetch(`${backendUrl}/api/proxy/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${serviceName}`)
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
            })

        return null;
    }, [backendUrl, serviceName]);

    useEffect(() => {
        getACSData()

    }, [getACSData]);

    return { result, loaded, error }
}

export default QueryACSData;
