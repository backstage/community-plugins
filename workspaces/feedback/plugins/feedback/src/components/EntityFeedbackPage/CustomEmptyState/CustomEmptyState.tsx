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

import { CodeSnippet, EmptyState } from '@backstage/core-components';

import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { styled, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useState } from 'react';

const PREFIX = 'CustomEmptyState';

const classes = {
  code: `${PREFIX}-code`,
  accordionGroup: `${PREFIX}-accordionGroup`,
  heading: `${PREFIX}-heading`,
  subHeading: `${PREFIX}-subHeading`,
  embeddedVideo: `${PREFIX}-embeddedVideo`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }: { theme: Theme }) => ({
  [`& .${classes.code}`]: {
    width: '100%',
    borderRadius: 6,
    margin: theme.spacing(0, 0),
    background: theme.palette.background.paper,
  },

  [`& .${classes.accordionGroup}`]: {
    '& > *': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      background: theme.palette.mode === 'dark' ? '#333' : '#eee',
    },
  },

  [`& .${classes.heading}`]: {
    width: '50%',
    fontSize: '1.2rem',
    fontWeight: 600,
  },

  [`& .${classes.subHeading}`]: {
    color: '#9e9e9e',
  },

  [`& .${classes.embeddedVideo}`]: {
    top: '50%',
    left: '50%',
    zIndex: 2,
    position: 'relative',
    transform: 'translate(-50%, 15%)',
    '& > iframe': {
      [theme.breakpoints.up('sm')]: {
        width: '100%',
        height: '280px',
      },
      [theme.breakpoints.up('xl')]: {
        width: '768px',
        height: '482px',
      },

      border: '0',
      borderRadius: theme.spacing(1),
    },
  },
}));

const EMAIL_YAML = `metadata:
  annotations:    
    # Set to MAIL, if you want to recevie mail
    # on every feedback.
    feedback/type: 'MAIL'

    # Type in your mail here, it will be kept in cc,
    # while sending mail on feedback generation.
    feedback/email-to: 'example@example.com'`;
const JIRA_YAML = `metadata:
  annotations:    
    # Set to JIRA to create ticket on
    # creating feedbacks.
    feedback/type: 'JIRA'

    # Enter your jira project key,
    jira/project-key: '<your-jira-project-key>'

    # Enter the url of you jira server.
    feedback/host: '<your-jira-host-url>'
    
    # (optional) Type in your mail here, 
    # it will be kept in cc,
    # while sending mail on feedback generation.  
    feedback/email-to: 'example@example.com';`;

export const CustomEmptyState = (props: {
  [key: string]: string | undefined;
}) => {
  const [expanded, setExpanded] = useState<string | false>('jira');

  const handleChange =
    (panel: string) => (event: ChangeEvent<{}>, isExpanded: boolean) => {
      event.preventDefault();
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <EmptyState
      title="Missing Annotation"
      description={
        <Typography variant="body1">
          Some annotations out of <code>{Object.keys(props).join(', ')}</code>{' '}
          are missing. You need to add proper annotations to your component if
          you want to enable this tool.
        </Typography>
      }
      action={
        <Root>
          <Typography variant="body1">
            Add the annotation to your component YAML as shown in the
            highlighted example below:
          </Typography>
          <div className={classes.accordionGroup}>
            <Accordion
              expanded={expanded === 'jira'}
              onChange={handleChange('jira')}
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography className={classes.heading}>For JIRA</Typography>
                <Typography className={classes.subHeading}>
                  (An email will be sent if <i>'feedback/email-to'</i> is set)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.code}>
                  <CodeSnippet
                    showLineNumbers
                    customStyle={{
                      background: 'inherit',
                      fontSize: '120%',
                      margin: '0px',
                    }}
                    language="yaml"
                    text={JIRA_YAML}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'email'}
              onChange={handleChange('email')}
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography className={classes.heading}>For E-Mail</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.code}>
                  <CodeSnippet
                    showLineNumbers
                    customStyle={{
                      background: 'inherit',
                      fontSize: '120%',
                    }}
                    language="yaml"
                    text={EMAIL_YAML}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </Root>
      }
      missing={{
        customImage: (
          <iframe
            width="720"
            height="480"
            src="https://www.youtube.com/embed/irtitc4dy2g?si=IfOiu2ae0stL70V-"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ),
      }}
    />
  );
};
