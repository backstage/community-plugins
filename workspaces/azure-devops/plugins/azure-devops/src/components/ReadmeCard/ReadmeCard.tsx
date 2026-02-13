/*
 * Copyright 2022 The Backstage Authors
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

import {
  Box,
  Button,
  Link,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Skeleton,
  Text,
  Flex,
} from '@backstage/ui';
import {
  MarkdownContent,
  EmptyState,
  ErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { useReadme } from '../../hooks';
import classes from './ReadmeCard.module.css';

type Props = {
  maxHeight?: number;
};

type ErrorProps = {
  error: Error;
};

function isNotFoundError(error: any): boolean {
  return error?.response?.status === 404;
}

const ReadmeCardError = ({ error }: ErrorProps) => {
  if (isNotFoundError(error)) {
    return (
      <EmptyState
        title="No README available for this entity"
        missing="field"
        description="You can add a README to your entity by following the Azure DevOps documentation."
        action={
          <Link
            href="https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary">Read more</Button>
          </Link>
        }
      />
    );
  }
  return <ErrorPanel title={error.message} error={error} />;
};

export const ReadmeCard = (props: Props) => {
  const { entity } = useEntity();
  const { loading, error, item: value } = useReadme(entity);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Text variant="title-small" weight="bold">
            Readme
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction="column" gap="4">
            <Skeleton width="100%" height={24} />
            <Skeleton width="100%" height={24} />
            <Skeleton width="80%" height={24} />
            <Skeleton width="100%" height={24} />
            <Skeleton width="90%" height={24} />
          </Flex>
        </CardBody>
      </Card>
    );
  } else if (error) {
    return <ReadmeCardError error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <Text variant="title-small" weight="bold">
          Readme
        </Text>
      </CardHeader>
      <CardBody className={classes.cardBody}>
        <Box className={classes.readMe} style={{ maxHeight: props.maxHeight }}>
          <MarkdownContent content={value?.content ?? ''} />
        </Box>
      </CardBody>
      {value?.url && (
        <CardFooter>
          <Link href={value.url} target="_blank" rel="noopener noreferrer">
            <Button variant="tertiary" size="small">
              Readme
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
