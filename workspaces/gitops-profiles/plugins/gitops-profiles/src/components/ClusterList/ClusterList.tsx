/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, JSX } from 'react';
import ClusterTable from '../ClusterTable/ClusterTable';
import Button from '@material-ui/core/Button';
import useAsync from 'react-use/esm/useAsync';
import { gitOpsApiRef } from '../../api';
import Alert from '@material-ui/lab/Alert';

import { SupportButton, Progress } from '@backstage/core-components';
import { Container, Flex, Header, Text } from '@backstage/ui';
import { useApi, githubAuthApiRef } from '@backstage/core-plugin-api';

const ClusterList = () => {
  const api = useApi(gitOpsApiRef);
  const githubAuth = useApi(githubAuthApiRef);
  const [githubUsername, setGithubUsername] = useState(String);

  const { loading, error, value } = useAsync(async () => {
    const accessToken = await githubAuth.getAccessToken(['repo', 'user']);
    if (!githubUsername) {
      const userInfo = await api.fetchUserInfo({ accessToken });
      setGithubUsername(userInfo.login);
    }
    return api.listClusters({
      gitHubToken: accessToken,
      gitHubUser: githubUsername,
    });
  });
  let content: JSX.Element;
  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = (
      <div>
        <Alert severity="error">
          Error encountered while fetching list of GitOps-managed cluster.{' '}
          {error.toString()}
        </Alert>
        <Alert severity="info">
          Please make sure that you start GitOps-API backend on localhost port
          3008 before using this plugin.
        </Alert>
      </div>
    );
  } else {
    content = (
      <>
        <Flex justify="between" align="center" mb="4">
          <Text as="h2" variant="title-medium">
            Clusters
          </Text>
          <Flex align="center" gap="2">
            <Button
              variant="contained"
              color="primary"
              href="/gitops-cluster-create"
            >
              Create GitOps-managed Cluster
            </Button>
            <SupportButton>All clusters</SupportButton>
          </Flex>
        </Flex>
        <ClusterTable components={value!.result} />
      </>
    );
  }

  return (
    <>
      <Header
        title="GitOps-managed Clusters"
        metadata={[{ label: 'Welcome', value: githubUsername }]}
      />
      <Container>{content}</Container>
    </>
  );
};

export default ClusterList;
