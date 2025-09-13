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
import { makeStyles } from '@material-ui/core/styles';

export const useDefectDojoStyles = makeStyles(theme => ({
  metricCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: theme.shadows[2],
  },
  criticalCard: {
    borderLeft: `6px solid ${theme.palette.error.main}`,
    background: `linear-gradient(135deg, ${theme.palette.error.main}15, ${theme.palette.error.dark}05)`,
  },
  criticalCardWithTrend: {
    borderLeft: `6px solid ${theme.palette.error.main}`,
    background: `linear-gradient(135deg, ${theme.palette.error.main}15, ${theme.palette.error.dark}05)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: `radial-gradient(circle, ${theme.palette.error.main}20, transparent)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    },
  },
  highCard: {
    borderLeft: `6px solid #ff5722`,
    background: `linear-gradient(135deg, #ff572220, #ff572208)`,
  },
  highCardWithTrend: {
    borderLeft: `6px solid #ff5722`,
    background: `linear-gradient(135deg, #ff572220, #ff572208)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: `radial-gradient(circle, #ff572230, transparent)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    },
  },
  mediumCard: {
    borderLeft: `6px solid ${theme.palette.warning.main}`,
    background: `linear-gradient(135deg, ${theme.palette.warning.main}20, ${theme.palette.warning.light}08)`,
  },
  lowCard: {
    borderLeft: `6px solid ${theme.palette.info.main}`,
    background: `linear-gradient(135deg, ${theme.palette.info.main}20, ${theme.palette.info.light}08)`,
  },
  successCard: {
    borderLeft: `6px solid ${theme.palette.success.main}`,
    background: `linear-gradient(135deg, ${theme.palette.success.main}20, ${theme.palette.success.light}08)`,
  },
  metricNumber: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  criticalNumber: {
    color: theme.palette.error.main,
  },
  highNumber: {
    color: '#ff5722',
  },
  mediumNumber: {
    color: theme.palette.warning.main,
  },
  lowNumber: {
    color: theme.palette.info.main,
  },
  successNumber: {
    color: theme.palette.success.main,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: theme.spacing(1),
    background: 'rgba(0,0,0,0.1)',
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  actionButton: {
    marginTop: theme.spacing(2),
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    '&:hover': {
      background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
    },
  },
  totalFindings: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    textShadow: '0 3px 6px rgba(0,0,0,0.15)',
  },
  riskScore: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.spacing(4),
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  filterSection: {
    background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  findingItem: {
    margin: theme.spacing(1, 0),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  severityBadge: {
    fontWeight: 'bold',
    minWidth: '80px',
    textAlign: 'center',
  },
  expandableList: {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: theme.spacing(1),
  },
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  cweChip: {
    margin: theme.spacing(0.5),
    background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
    color: 'white',
    fontWeight: 'bold',
  },
}));
