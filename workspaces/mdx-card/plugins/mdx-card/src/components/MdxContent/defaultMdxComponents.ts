/*
 * Copyright 2026 The Backstage Authors
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
  Accordion,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonIcon,
  ButtonLink,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Cell,
  CellProfile,
  CellText,
  Column,
  Container,
  Flex,
  Grid,
  Link,
  List,
  ListRow,
  Row,
  Skeleton,
  Tab,
  TableBody,
  TableHeader,
  TableRoot,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TagGroup,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import type { MDXComponents } from 'mdx/types';
import { AreaChart, BarChart, LineChart, PieChart } from '../charts';
import { ApiFetcher, ApiFetcherContent, ApiFetcherData } from '../ApiFetcher';
import {
  DataTable,
  EntityRefLink,
  EntityRefLinks,
  MetadataTable,
} from '../templateComponents';

/**
 * Components available to MDX templates by default.
 *
 * @public
 */
export const defaultMdxComponents: MDXComponents = {
  Box,
  Container,
  Flex,
  Grid,

  Card,
  CardBody,
  CardFooter,
  CardHeader,

  Accordion,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
  Tab,
  TabList,
  TabPanel,
  Tabs,

  Text,
  Link,
  Avatar,
  Badge,
  Tag,
  TagGroup,
  Tooltip,
  TooltipTrigger,
  Alert,
  Skeleton,

  Button,
  ButtonIcon,
  ButtonLink,

  List,
  ListRow,
  TableRoot,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
  CellText,
  CellProfile,
  DataTable,
  MetadataTable,

  EntityRefLink,
  EntityRefLinks,

  AreaChart,
  BarChart,
  LineChart,
  PieChart,

  ApiFetcher,
  ApiFetcherContent,
  ApiFetcherData,
};
