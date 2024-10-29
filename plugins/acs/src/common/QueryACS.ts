import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import jsonlines from 'jsonlines';

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
        return entity?.spec?.system
    }

    const getVulnerabilities = (jsonData: any) => {

        // trying something...
        const deploymentVulnerabilties = jsonData.map((deployment) => {
            console.log("deployment:", deployment)

            const images = deployment.result.images.map((image) => {
                console.log("image:", image)

                return image.scan.components.filter((component) => component.vulns.length > 0)
            })

            console.log("All vulns in deployment: ", images)
        })

        return deploymentVulnerabilties
    }

    const getACSData = async() => {
        const deploymentName = retrieveCatalogItem()
        console.log("Entity", entity)
        console.log("system: ", deploymentName)

        await fetch(`${backendUrl}/api/proxy/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${deploymentName}`)
            .then(response => response.text())
            .then(text => {

                const lines = text.split('\n');

                const jsonData = lines.map(line => {
                    if (line.trim()) {  // Skip empty lines
                        return JSON.parse(line);
                    }

                    return null
                });

                const vulns = getVulnerabilities(jsonData)

                console.log("vulns: ", vulns);

                // TODO: fix issue where additional index is added which is just an empty string

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
