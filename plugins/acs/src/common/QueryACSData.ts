import react, { useCallback, useState, useEffect } from 'react';
import { useApi,  fetchApiRef, configApiRef } from '@backstage/core-plugin-api';

export const QueryACSData = (deploymentName: string) => {
    /* eslint-disable consistent-return */
    const [result, setResult] = useState([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const fetchApi = useApi(fetchApiRef);

    const convertDeploymentNameStringToArray = () => {
        return deploymentName.split(",")
    }

    const getACSData = () => {
        const deploymentNameArr = convertDeploymentNameStringToArray();

        deploymentNameArr.forEach((name: string) => {
            fetchApi.fetch(`${backendUrl}/api/proxy/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${name}`)
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
                    setResult(
                        ...result,
                        jsonData
                    );
                })
                .catch((_error) => {
                    setError(true)
                    throw new Error(`Error fetching ACS data`);
                })
        });
    };

    useEffect(() => {
        getACSData()
        // eslint-disable-next-line
    }, [backendUrl]);

    return { result, loaded, error }
}

