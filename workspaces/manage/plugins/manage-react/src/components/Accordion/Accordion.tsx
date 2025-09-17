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
import { ComponentProps, PropsWithChildren, useCallback } from 'react';

import { makeStyles } from '@mui/styles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useAccordionKey, useUserSettings } from '../../hooks';

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  summary: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0),
    '&.Mui-expanded': {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(1),
    },
  },
  details: {
    paddingBottom: 0,
  },
}));

/**
 * Props for {@link ManageAccordion}
 *
 * @public
 */
export interface ManageAccordionProps {
  /**
   * Title of the accordion
   */
  title: string;

  /**
   * Name of the accordion. This will be used to create accordion keys to save
   * the open/close state. This is intended to be a feature/plugin name.
   */
  name: string;

  /**
   * Make the accordion default-expanded. Defaults to false.
   */
  defaultExpanded?: boolean;

  /**
   * Saves the expanded state per kind. Defaults to false, meaning the expanded
   * state is shared between all kinds.
   */
  perKind?: boolean;
}

type AccordionOnChange = NonNullable<
  ComponentProps<typeof Accordion>['onChange']
>;

/**
 * Renders a MUI Accordion with a title and content. The open/close state of the
 * accordion is saved in the user settings.
 *
 * @public
 */
export function ManageAccordion(
  props: PropsWithChildren<ManageAccordionProps>,
) {
  const { title, name, defaultExpanded, perKind = false, children } = props;

  const accordionKey = useAccordionKey('manage-accordion', perKind);

  const [expanded, setExpanded] = useUserSettings(name, accordionKey, {
    defaultValue: defaultExpanded ?? false,
  });

  const onChange = useCallback<AccordionOnChange>(
    (_, value) => {
      setExpanded(value);
    },
    [setExpanded],
  );

  const { root, summary, details } = useStyles();

  return (
    <Accordion classes={{ root }} expanded={expanded} onChange={onChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        classes={{ content: summary }}
      >
        <Typography variant="h6" component="span">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails classes={{ root: details }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
