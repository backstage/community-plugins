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

import React, { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { jiraApiRef } from '../../api';
import {
  Card,
  CardContent,
  CircularProgress,
  Link,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { usernameApi } from '../../utils/usernameApi';
import { JiraNoBorderIcon } from '../../utils/assets';
import calculateDaysAgo from '../../utils/daysAgo';

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: '8px',
    boxShadow: 'none',
    backgroundColor: '#FFFFFF',
    padding: '0px',
    height: '371px',
  },
  table: {
    minWidth: 650,
    boxShadow: 'none',
    border: 'none',
  },
  tableBody: { overflowY: 'auto' },
  headerText: {
    fontWeight: 500,
    fontSize: 16,
    backgroundColor: '#F3F4F8',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  chip: {
    marginRight: theme.spacing(1),
    borderRadius: '8px',
    marginTop: '4px',
  },
  prIcon: {
    color: '#3B82F6',
  },
  row: {
    height: 'auto',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  header: {
    padding: '0px 16px',
    backgroundColor: '#F3F4F8',
  },
  cell: {
    padding: '0px 22px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'none',
  },
}));

export const JiraLocalComponent = () => {
  const classes = useStyles();

  const jiraApi = useApi(jiraApiRef);
  const [issues, setIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const { profile } = usernameApi();
  const username = profile?.email;

  const fetchIssues = async () => {
    const jql = 'ORDER BY Created';
    const maxResults = 100;

    try {
      const { total } = await jiraApi.fetchAndStoreIssues(jql, 0, 0, username);

      const promises = [];
      for (let startAt = 0; startAt < total; startAt += maxResults) {
        promises.push(
          jiraApi.fetchAndStoreIssues(jql, maxResults, startAt, username),
        );
      }

      const allResults = await Promise.all(promises);
      const allData = allResults.flat();

      const totalIssues = await jiraApi.getStoredIssues();
      setIssues(
        totalIssues.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      );
      setTotalPages(Math.ceil(total / maxResults));
    } catch (e) {
      console.error('Error fetching issues:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    fetchIssues();
  }, [currentPage, username]);

  return (
    <Card className={classes.card}>
      <CardContent
        style={{ paddingLeft: 0, paddingRight: 0, overflowY: 'auto' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            style={{
              marginBottom: '16px',
              fontWeight: 500,
              fontSize: 20,
              color: '#6A6A6A',
              paddingLeft: '20px',
            }}
          >
            My tasks
          </Typography>
        </div>
        <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
          <Table className={classes.table} aria-label="jira issues table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerText}>Title</TableCell>
                <TableCell className={classes.headerText}>Created</TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <div
                style={{
                  width: 'full',
                  height: 'full',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <TableBody className={classes.tableBody}>
                {issues?.map((issue, index) => (
                  <TableRow key={index} className={classes.row}>
                    <TableCell
                      className={classes.cell}
                      style={{
                        color: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      }}
                    >
                      <JiraNoBorderIcon />
                      <Link
                        href={issue?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Typography variant="body1">
                          {issue?.title.length > 50
                            ? `${issue?.title.slice(0, 50)}...`
                            : issue?.title}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell className={classes.cell}>
                      {calculateDaysAgo(issue?.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
