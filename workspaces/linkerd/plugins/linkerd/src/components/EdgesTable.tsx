/*
 * Copyright 2024 The Backstage Authors
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
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { useStatsForEntity } from '../hooks/useStatsForEntity';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  makeStyles,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import RemoveCircle from '@material-ui/icons/RemoveCircle';

import { stringifyEntityRef } from '@backstage/catalog-model';

const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },

  gridItemCardContent: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  header: {
    padding: 16,
  },
});

export const EdgesTable = () => {
  const { entity } = useEntity();
  const styles = useStyles();
  const { stats, loading } = useStatsForEntity(entity);

  const content = () => {
    if (!stats && loading) {
      return <CircularProgress />;
    }

    if (!stats || !stats.current || !stats.current.pods.meshedPodsPercentage) {
      return (
        <Typography paragraph>
          This service doesn't look like it's tagged with the right service, or
          linkerd is not injected.
        </Typography>
      );
    }

    const incoming =
      stats?.incoming?.map(edge => {
        const matchedEdge = stats?.edges.find(
          e =>
            e.dst.namespace === stats.current.namespace &&
            e.dst.name === stats.current.name &&
            e.dst.type === stats.current.type &&
            e.src.type === edge.type &&
            e.src.name === edge.name &&
            e.src.namespace === edge.namespace,
        );

        return {
          ...edge,
          direction: 'incoming',
          secure: matchedEdge?.noIdentityMsg === '',
        };
      }) ?? [];

    const outgoing =
      stats?.outgoing?.map(edge => {
        const matchedEdge = stats?.edges.find(
          e =>
            e.src.namespace === stats.current.namespace &&
            e.src.name === stats.current.name &&
            e.src.type === stats.current.type &&
            e.dst.type === edge.type &&
            e.dst.name === edge.name &&
            e.dst.namespace === edge.namespace,
        );

        return {
          ...edge,
          direction: 'outgoing',
          secure: matchedEdge?.noIdentityMsg === '',
        };
      }) ?? [];

    const edges = [...incoming, ...outgoing]
      .filter(f => f.type === 'deployment')
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Direction</TableCell>
              <TableCell align="right">Name</TableCell>
              <TableCell align="right">RPS</TableCell>
              <TableCell align="right">S/R</TableCell>
              <TableCell align="right">TLS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {edges.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  <Chip
                    label={
                      row.direction === 'incoming' ? 'Incoming' : 'Outgoing'
                    }
                    color={
                      row.direction === 'incoming' ? 'primary' : 'secondary'
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <EntityRefLink
                    entityRef={stringifyEntityRef({
                      kind: 'component',
                      name: row.name,
                      namespace: row.namespace,
                    })}
                  />
                </TableCell>
                <TableCell align="right">{`${row.requestRate.toFixed(
                  2,
                )}`}</TableCell>
                <TableCell align="right">
                  {`${Math.round(row.successRate * 100)}%`}
                </TableCell>
                <TableCell align="right">
                  {row.secure ? (
                    <CheckCircle color="primary" />
                  ) : (
                    <RemoveCircle color="secondary" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Card className={styles.gridItemCard}>
      <CardHeader title="Mesh Edges" className={styles.header} />
      <Divider />
      <CardContent className={styles.gridItemCardContent}>
        {content()}
      </CardContent>
    </Card>
  );
};
