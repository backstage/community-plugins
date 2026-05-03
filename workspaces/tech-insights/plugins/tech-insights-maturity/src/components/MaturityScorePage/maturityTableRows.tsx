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
import { Link } from '@backstage/core-components';
import {
  MaturityCheckResult,
  MaturityRank,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import Accordion from '@mui/material/Accordion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CancelTwoToneIcon from '@mui/icons-material/Cancel';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import type { SyntheticEvent } from 'react';
import { Fragment, useState } from 'react';
import { InsightFacts } from '@backstage-community/plugin-tech-insights-common';
import { MaturityRankChip } from '../MaturityRankChip';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';

interface BaseProps {
  checks: MaturityCheckResult[];
  facts: InsightFacts;
  rank: MaturityRank;
}

interface RankModeProps extends BaseProps {
  /** Pass for rank-based grouping (default upstream behavior). */
  category: Rank;
  categoryName?: never;
}

interface CategoryModeProps extends BaseProps {
  category?: never;
  /** Pass for category-based grouping (groups by metadata.category). */
  categoryName: string;
}

type Props = RankModeProps | CategoryModeProps;

const MaturityCheckTableRow = ({
  checkResult,
  updated,
}: {
  checkResult: MaturityCheckResult;
  updated: string;
}) => {
  const [expanded, setExpanded] = useState<boolean>(
    checkResult.result === false,
  );

  const handleChange = () => (_event: SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  const useStyles = makeStyles({
    check: {
      marginLeft: '2rem',
    },
    solution: {
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
    },
    filters: {
      fontSize: 15,
    },
  });

  const { check, solution, filters } = useStyles();
  const errorInfo = Object.values(checkResult.facts).filter(
    fact => fact.type !== 'boolean',
  );

  return (
    <div>
      <Accordion
        expanded={expanded}
        onChange={handleChange()}
        elevation={2}
        sx={{ border: '1px solid rgba(173, 172, 172, 0.26)' }}
      >
        <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={3}>
              <Typography>{checkResult.check.name}</Typography>
            </Grid>
            <Grid item xs={7.5}>
              <Typography className={check}>
                {checkResult.check.description}
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              {checkResult.result ? (
                <CheckCircleTwoToneIcon
                  className={check}
                  style={{ color: '#53d44c' }}
                />
              ) : (
                <CancelTwoToneIcon
                  className={check}
                  style={{ color: '#f54040' }}
                />
              )}
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1} sx={{ paddingLeft: 1, paddingRight: 1 }}>
            <Grid item xs={9}>
              <Stack spacing={1}>
                <Stack spacing={1} direction="row">
                  <Tooltip title="Solution: How to pass the check">
                    <EmojiObjectsIcon color="warning" />
                  </Tooltip>
                  <Typography className={solution}>
                    {checkResult.check.metadata?.solution}
                  </Typography>
                </Stack>
                {checkResult.result === false && errorInfo.length > 0 && (
                  <Stack spacing={1} direction="row">
                    <Tooltip title="Error: The fact(s) that caused this check to fail">
                      <ErrorOutlineIcon color="error" />
                    </Tooltip>
                    <Typography
                      variant="subtitle2"
                      className={filters}
                      color="secondary"
                    >
                      {errorInfo.map((fact, index) => (
                        <Fragment key={fact.id}>
                          {index > 0 && <br />}
                          {`${fact.description}: ${fact.value}`}
                        </Fragment>
                      ))}
                    </Typography>
                  </Stack>
                )}
                {checkResult.check.links &&
                  checkResult.check.links.length > 0 && (
                    <Stack spacing={1} direction="row">
                      <Tooltip title="Reference: Consult the documentation linked here for more background info.">
                        <MenuBookIcon color="primary" />
                      </Tooltip>
                      <Typography>
                        {checkResult.check.links?.map((link, index) => (
                          <Fragment key={link.url}>
                            {index > 0 && ', '}
                            <Link to={link.url}>{link.title}</Link>
                          </Fragment>
                        ))}
                      </Typography>
                    </Stack>
                  )}
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={0.2}>
                <Stack spacing={1} direction="row">
                  <Tooltip title="Category: The category for this check">
                    <CategoryIcon color="primary" />
                  </Tooltip>
                  <Typography variant="subtitle1" className={filters}>
                    {checkResult.check.metadata?.category}
                  </Typography>
                </Stack>
                <Stack spacing={1} direction="row">
                  <Tooltip title="Update: Last time the maturity check was updated">
                    <AccessTimeIcon color="primary" />
                  </Tooltip>
                  <Typography variant="subtitle2" className={filters}>
                    {updated ? `${updated.slice(0, 19)}` : 'Not yet run'}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export const MaturityCheckTable = (props: Props) => {
  const { rank, checks, facts } = props;

  const panelId =
    props.categoryName !== undefined
      ? `panel-cat-${props.categoryName.replace(/\s+/g, '-').toLowerCase()}`
      : `panel-rank-${props.category}`;

  // Rank mode: expand the tier the entity needs to reach next
  // Category mode: expand any category with at least one failing check
  const [expanded, setExpanded] = useState<boolean>(
    props.categoryName !== undefined
      ? checks.some(c => !c.result)
      : rank.rank + 1 === props.category,
  );
  if (checks.length === 0) return <></>;

  const handleChange = () => (_event: SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  return (
    <div>
      <Accordion
        expanded={expanded}
        onChange={handleChange()}
        elevation={1}
        sx={{ border: '1.5px solid rgba(173, 172, 172, 0.26)' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${panelId}-content`}
          id={`${panelId}-header`}
        >
          {props.categoryName !== undefined ? (
            <Chip
              label={props.categoryName}
              data-testid={`category-chip-${props.categoryName}`}
              color={checks.every(c => c.result) ? 'success' : 'default'}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.9rem' }}
            />
          ) : (
            <MaturityRankChip
              value={{
                rank: props.category,
                isMaxRank: props.category <= rank.rank,
              }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails id={`${panelId}-content`}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {checks?.map((entry, index) => (
                <MaturityCheckTableRow
                  key={`${entry.check.id}-${index}`}
                  updated={facts[entry.check.factIds[0]]?.timestamp}
                  checkResult={entry}
                />
              ))}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
