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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import CancelTwoToneIcon from '@mui/icons-material/Cancel';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { makeStyles, styled } from '@mui/styles';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { MaturityRankAvatar } from '../MaturityRankAvatar';
import { InsightFacts } from '@backstage-community/plugin-tech-insights-common';

interface Props {
  checks: MaturityCheckResult[];
  facts: InsightFacts;
  rank: MaturityRank;
  category: Rank;
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  width: '100%',
  paddingLeft: theme.spacing(2),
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

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
  return (
    <div>
      <Accordion expanded={expanded} onChange={handleChange()}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={3}>
              <Stack direction="row" spacing={2} className={check}>
                <MaturityRankAvatar
                  value={{ rank: checkResult.check.metadata.rank }}
                  size={25}
                />
                <Typography>{checkResult.check.id}</Typography>
              </Stack>
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
          <Grid container spacing={2} sx={{ paddingLeft: 2, paddingRight: 2 }}>
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
                <Stack spacing={1} direction="row">
                  <Tooltip title="Update: Last time the maturity check was updated">
                    <AccessTimeIcon color="primary" />
                  </Tooltip>
                  <Typography variant="subtitle2" className={filters}>
                    {updated ? `Updated ${updated}` : 'Not yet run'}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={1}>
                <Stack spacing={1} direction="row">
                  <Tooltip title="Category: The category for this check">
                    <CategoryIcon color="primary" />
                  </Tooltip>
                  <Typography variant="subtitle1" className={filters}>
                    {checkResult.check.metadata?.category}
                  </Typography>
                </Stack>
                <Stack spacing={1} direction="row">
                  <Tooltip title="Reference: Consult the documentation linked here for more background info.">
                    <MenuBookIcon color="primary" />
                  </Tooltip>
                  <Typography>
                    <Link to={checkResult.check.links?.at(0)?.url ?? ''}>
                      {checkResult.check.links?.at(0)?.title}
                    </Link>
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

export const MaturityCheckTable = ({
  rank,
  category,
  checks,
  facts,
}: Props) => {
  // Expand only the next rank Category needed to level up
  const [expanded, setExpanded] = useState<boolean>(rank.rank + 1 === category);
  const handleChange = () => (_event: SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  if (checks.length === 0) return <></>;

  return (
    <div>
      <Accordion expanded={expanded} onChange={handleChange()}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Grid container justifyContent="flex-end">
            <Grid item>
              <MaturityRankAvatar
                value={{ rank: category, isMaxRank: category <= rank.rank }}
                variant="chip"
              />
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {checks?.map(entry => (
                <MaturityCheckTableRow
                  key={entry.check.id}
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
