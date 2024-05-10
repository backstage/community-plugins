import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { MetricCounter } from './MetricCounter';

const useStyles = makeStyles({
  root: {
    width: 400,
    height: 300,
  },
  header: {
    fontSize: 20,
  },
  namespace: {
    fontSize: 20,
  },
  name: {
    fontSize: 20,
  },
  tableMetric: {
    fontWeight: 'bold',
  },
});

export const Node = memo(({ data }) => {
  const styles = useStyles();

  const subheader = () => {
    if (data.l5d) {
      return (
        <>
          <Typography className={styles.name} gutterBottom>
            {data.l5d.resource.namespace}/{data.l5d.resource.name}
          </Typography>
        </>
      );
    }

    return (
      <Typography variant="h5" component="h2" className={styles.name}>
        {data.name}
      </Typography>
    );
  };

  const table = () => {
    if (data.l5d) {
      return (
        <Card variant="outlined">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className={styles.tableMetric}>RPS</TableCell>
                <TableCell align="right">
                  <MetricCounter
                    number={Math.round(data.l5d?.b7e.rps)}
                    suffix=""
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={styles.tableMetric}>S/R</TableCell>
                <TableCell align="right">
                  <MetricCounter
                    number={Math.round(data.l5d?.b7e.successRate)}
                    suffix="%"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={styles.tableMetric}>P99</TableCell>
                <TableCell align="right">
                  <MetricCounter
                    number={Math.round(data.l5d?.stats.latencyMsP99)}
                    lessIsMore
                    suffix="ms"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      );
    }
  };
  return (
    <>
      {data.isTarget && <Handle type="target" position={Position.Left} />}
      <Card variant="outlined" className={styles.root}>
        <CardContent>
          <Typography className={styles.header} color="textSecondary">
            {data.header} {data.l5d?.resource.type}
          </Typography>
          {subheader()}
          {table()}
        </CardContent>
      </Card>
      {data.isSource && <Handle type="source" position={Position.Right} />}
    </>
  );
});
