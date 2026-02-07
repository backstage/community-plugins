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
  Text,
  TooltipTrigger,
  Tooltip,
  TagGroup,
  Tag,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Skeleton,
} from '@backstage/ui';
import Alert from '@material-ui/lab/Alert';
import { DateTime } from 'luxon';
import slugify from 'slugify';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useLanguages } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { linguistTranslationRef } from '../../translation';
import classes from './LinguistCard.module.css';

export const LinguistCard = () => {
  const { t } = useTranslationRef(linguistTranslationRef);
  const { entity } = useEntity();
  const { items, loading, error } = useLanguages(entity);
  let barWidth = 0;

  if (loading) {
    return (
      <Card className={classes.infoCard}>
        <CardHeader>
          <Skeleton width="100%" height={24} />
        </CardHeader>
        <CardBody>
          <Box>
            <Skeleton width="100%" height={64} />
          </Box>
        </CardBody>
      </Card>
    );
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (items && items.languageCount === 0 && items.totalBytes === 0) {
    return (
      <Card className={classes.infoCard}>
        <CardHeader>
          <Text as="h3" variant="body-large" weight="bold">
            {t('entityCard.title')}
          </Text>
        </CardHeader>
        <CardBody>
          <Box>
            <Text>{t('entityCard.noData')}</Text>
          </Box>
        </CardBody>
      </Card>
    );
  }

  const breakdown = items?.breakdown.sort((a, b) =>
    a.percentage < b.percentage ? 1 : -1,
  );
  const processedDate = items?.processedDate;

  return breakdown && processedDate ? (
    <Card className={classes.infoCard}>
      <CardHeader>
        <Text as="h3" variant="body-large" weight="bold">
          {t('entityCard.title')}
        </Text>
      </CardHeader>
      <CardBody>
        <Box className={classes.barContainer}>
          {breakdown.map((language, index: number) => {
            barWidth = barWidth + language.percentage;
            return (
              <TooltipTrigger key={slugify(language.name, { lower: true })}>
                <Box
                  className={classes.bar}
                  style={{
                    marginTop:
                      index === 0 ? '0' : `calc(-1 * var(--bui-space-2))`,
                    zIndex: Object.keys(breakdown).length - index,
                    backgroundColor:
                      language.color?.toString() || 'var(--bui-bg-surface-0)',
                    width: `${barWidth}%`,
                  }}
                />
                <Tooltip placement="top">{language.name}</Tooltip>
              </TooltipTrigger>
            );
          })}
        </Box>

        <Flex direction="row" gap="2" style={{ flexWrap: 'wrap' }}>
          <TagGroup>
            {breakdown.map(languages => (
              <Tag key={slugify(languages.name, { lower: true })}>
                <Box
                  as="span"
                  className={classes.languageDot}
                  style={{
                    backgroundColor:
                      languages?.color?.toString() || 'var(--bui-bg-surface-0)',
                  }}
                />
                {languages.name} - {languages.percentage}%
              </Tag>
            ))}
          </TagGroup>
        </Flex>
      </CardBody>
      <CardHeader>
        <Text as="p" variant="body-small" color="secondary">
          Generated {DateTime.fromISO(processedDate).toRelative()}
        </Text>
      </CardHeader>
    </Card>
  ) : (
    <></>
  );
};
