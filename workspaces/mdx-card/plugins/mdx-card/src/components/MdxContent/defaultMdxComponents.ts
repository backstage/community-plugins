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
  Link,
  StructuredMetadataTable,
  Table,
} from '@backstage/core-components';
import { EntityRefLink, EntityRefLinks } from '@backstage/plugin-catalog-react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AreaChart, BarChart, LineChart, PieChart } from '../charts';
import { ApiFetcher, ApiFetcherContent, ApiFetcherData } from '../ApiFetcher';

/**
 * Components available to MDX templates by default.
 *
 * @public
 */
export const defaultMdxComponents = {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,

  Link,
  StructuredMetadataTable,
  Table,
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
