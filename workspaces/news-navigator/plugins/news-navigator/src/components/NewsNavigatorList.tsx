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
import React from 'react';
import {
  Typography,
  CardMedia,
  Grid,
  makeStyles,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { useQuery } from '@tanstack/react-query';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { LinkButton } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { NewsItem } from '../types';
import { newsApiRef } from '../api';

const MAX_NEWS_ITEMS = 10;

interface NewsNavigatorListProps {
  category?: string;
  keyword?: string;
}

const useStyles = makeStyles(theme => ({
  newsItem: {
    padding: theme.spacing(2),
  },
  newsContent: {
    flex: 1,
    paddingLeft: theme.spacing(2),
  },
  newsImage: {
    width: 240,
    height: 180,
    borderRadius: theme.shape.borderRadius,
  },
  newsTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  newsDescription: {
    marginBottom: theme.spacing(2),
  },
  readMoreButton: {
    marginTop: theme.spacing(2),
    padding: '8px 16px',
  },
}));

export const NewsNavigatorList: React.FC<NewsNavigatorListProps> = ({
  category,
  keyword,
}) => {
  const classes = useStyles();

  const newsApi = useApi(newsApiRef);

  const { data, isError, isLoading, isRefetching } = useQuery({
    queryKey: category ? ['category-news'] : ['search-news'],
    queryFn: () =>
      category
        ? newsApi.getNewsByCategory(category)
        : newsApi.searchNewsByKeyword(keyword),
    staleTime: 30 * 60 * 1000, // Cache data for 30 minutes
  });

  if (isLoading || isRefetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {!isError &&
        data?.slice(0, MAX_NEWS_ITEMS)?.map((item: NewsItem, index: number) => (
          <div key={index} className={classes.newsItem}>
            <Grid container direction="row">
              <Grid item xs={12} sm={7} md={9} key={index}>
                <div className={classes.newsContent}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    className={classes.newsTitle}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={classes.newsDescription}
                  >
                    {item.description}
                  </Typography>
                  <LinkButton
                    to={item.url}
                    color="primary"
                    variant="contained"
                    endIcon={<OpenInNew />}
                    className={classes.readMoreButton}
                  >
                    Read More
                  </LinkButton>
                </div>
              </Grid>
              <Grid item xs={12} sm={4} md={2} key={index}>
                <CardMedia
                  className={classes.newsImage}
                  image={item.urlToImage}
                  title={item.title}
                />
              </Grid>
            </Grid>
          </div>
        ))}
    </div>
  );
};
