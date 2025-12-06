/*
 * Copyright 2025 The Backstage Authors
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
import { ReactNode } from 'react';
import {
  Card,
  Box,
  Text,
  CardBody,
  CardFooter,
  CardHeader,
} from '@backstage/ui';

type FormCardProps = {
  title: string;
  children: ReactNode;
  padding?: string;
};

/**
 * A generic card wrapper for forms that provides consistent styling
 * for form titles and content. This allows forms to be displayed
 * both within cards (on pages) and without cards (in modals).
 */
export const FormCard = (props: FormCardProps) => {
  const { title, children, padding = '3' } = props;

  return (
    // <Card>
    //   <Box p={padding}>
    //     {children}
    //   </Box>
    // </Card>

    <Card>
      <CardHeader>
        <Text variant="title-small">{title}</Text>
      </CardHeader>
      <CardBody>{children}</CardBody>
      <CardFooter>
        <Text>Footer</Text>
      </CardFooter>
    </Card>
  );
};
