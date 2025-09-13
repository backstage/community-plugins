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
import {
  Typography,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { DefectDojoVulnerability } from '../../client';
import { getSeverityIcon } from '../utils/defectDojoUtils';
import { useDefectDojoStyles } from '../shared/styles';

const getSeverityColor = (severity?: string): string => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#f44336';
    case 'high':
      return '#ff5722';
    case 'medium':
      return '#ff9800';
    case 'low':
      return '#2196f3';
    default:
      return '#757575';
  }
};

interface FindingsListProps {
  findings: DefectDojoVulnerability[];
  expanded: boolean;
  onToggleExpanded: () => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({
  findings,
  expanded,
  onToggleExpanded,
}) => {
  const classes = useDefectDojoStyles();

  if (findings.length === 0) {
    return null;
  }

  return (
    <Accordion expanded={expanded} onChange={onToggleExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" width="100%">
          <VisibilityIcon style={{ marginRight: 8 }} />
          <Typography variant="h6">
            Findings List ({findings.length})
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box width="100%" className={classes.expandableList}>
          <List dense>
            {findings.map(vuln => (
              <ListItem key={vuln.id} className={classes.findingItem}>
                <ListItemIcon>{getSeverityIcon(vuln.severity)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle2" style={{ flex: 1 }}>
                        {vuln.title}
                      </Typography>
                      <Chip
                        label={vuln.severity}
                        size="small"
                        className={classes.severityBadge}
                        style={{
                          backgroundColor: getSeverityColor(vuln.severity),
                          color: 'white',
                          marginLeft: 8,
                        }}
                      />
                      {vuln.cwe > 0 && (
                        <Chip
                          label={`CWE-${vuln.cwe}`}
                          size="small"
                          variant="outlined"
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {vuln.description}
                    </Typography>
                  }
                />
                <IconButton
                  size="small"
                  onClick={() => window.open(vuln.url, '_blank')}
                  style={{ marginLeft: 8 }}
                  data-testid="open-finding-button"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
