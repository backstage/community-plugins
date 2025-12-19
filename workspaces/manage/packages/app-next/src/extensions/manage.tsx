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

import { Entity } from '@backstage/catalog-model';
import { HeaderLabel } from '@backstage/core-components';
import {
  ManageEntityCardWidgetBlueprint,
  ManageEntityColumnBlueprint,
  ManageHeaderLabelBlueprint,
  ManageSettingsBlueprint,
  ManageTabBlueprint,
  useOwners,
} from '@backstage-community/plugin-manage-react';
import { ManageTechInsightsBlueprint } from '@backstage-community/plugin-manage-module-tech-insights';

import { useTheme } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

function Foo({
  name,
  fullHeight = false,
}: {
  name: string;
  fullHeight?: boolean;
}) {
  const theme = useTheme();
  const owners = useOwners();

  const style = fullHeight
    ? {
        borderRadius: '24px',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
      }
    : {};

  return (
    <div style={style}>
      <div>This is example tab {name}</div>
      <div>Ownership groups: {owners.ownerEntityRefs.join(', ')}</div>
      {fullHeight && (
        <>
          <div>&nbsp;</div>
          <div>
            This is a full height tab, and the round cornered container is the
            component provided by this extension, adapting to window resizes.
          </div>
        </>
      )}
    </div>
  );
}

// Create a custom tab
const testTab1 = ManageTabBlueprint.make({
  name: 'foo-tab1',
  params: defineParams =>
    defineParams({
      loader: async () => <Foo name="1" />,
      path: 'my-tab-1',
      title: 'My tab 1',
      condition: ({ owners }) =>
        owners.ownerEntityRefs.some(x => x.includes('guest')),
    }),
});

// Create a second tab
const testTab2 = ManageTabBlueprint.make({
  name: 'foo-tab2',
  params: defineParams =>
    defineParams({
      loader: async () => <Foo name="2 with delayed loading" fullHeight />,
      path: 'my-tab-2',
      title: 'My tab 2',
      fullHeight: { resizeChild: true },
      condition: async ({ owners }) =>
        new Promise(res => setTimeout(res, 3000)).then(() =>
          owners.ownerEntityRefs.includes('user:default/guest'),
        ),
    }),
});

// Create a set of one or multiple columns, configurable per entity kind
const testColumn1 = ManageEntityColumnBlueprint.make({
  name: 'foo-column',
  params: defineParams =>
    defineParams({
      attachTo: ['component', '$entities'],
      loaderSingle: async () => _entities => ({
        id: 'the-title',
        title: 'The single title',
        render: (props: { entity: Entity }) => (
          <div>yada {props.entity.metadata.name}</div>
        ),
      }),
      loaderMulti: async () => _entities =>
        [
          {
            id: 'the-title2',
            title: 'The title 1',
            render: (props: { entity: Entity }) => (
              <div>First column for {props.entity.metadata.name}</div>
            ),
          },
          {
            id: 'the-title3',
            title: 'The title 2',
            render: () => <div>Second column</div>,
          },
        ],
    }),
});

// Create a card widget
const testWidget1 = ManageEntityCardWidgetBlueprint.make({
  name: 'foo-widget1',
  params: defineParams =>
    defineParams({
      attachTo: ['component', '$entities'],
      loader: async () => (
        <Card style={{ height: '100%', maxWidth: 200 }}>
          <CardHeader title="Some widget" />
          <CardContent>Example widget for the Manage page</CardContent>
        </Card>
      ),
    }),
});

// Create another card widgets
const testWidget2 = ManageEntityCardWidgetBlueprint.make({
  name: 'foo-widget2',
  params: defineParams =>
    defineParams({
      attachTo: ['$all', '$starred', '$entities'],
      loader: async () => (
        <Card style={{ height: '100%', maxWidth: 200 }}>
          <CardContent>Another card widget</CardContent>
        </Card>
      ),
    }),
});

// Create a header label that shows up in the right side of the page header
const label = ManageHeaderLabelBlueprint.make({
  name: 'foo',
  params: defineParams =>
    defineParams({
      loader: async () => (
        <HeaderLabel
          label="Example toggle"
          value={
            <FormGroup row>
              <FormControlLabel
                control={<Switch name="manage-page-combined" color="primary" />}
                label={
                  <Typography sx={{ userSelect: 'none' }}>
                    This does nothing
                  </Typography>
                }
              />
            </FormGroup>
          }
        />
      ),
    }),
});

// Create a settings card that shows up in the "Settings" tab
const setting = ManageSettingsBlueprint.make({
  name: 'foo',
  params: defineParams =>
    defineParams({
      title: 'Example settings',
      loader: async () => <div>Settings go here</div>,
    }),
});

// Override tech-insights to remove the ending " Check" from the check names,
// and to remove the "descriptionCheck" from the columns view, specifically for
// Systems, as an example.
const techInsights = ManageTechInsightsBlueprint.make({
  params: defineParams =>
    defineParams({
      mapTitle: check => ({
        title: check.name.toLocaleLowerCase('en-US').endsWith(' check')
          ? check.name.replace(/ check$/i, '')
          : check.name,
        tooltip: check.description,
      }),
      showEmpty: true,
      columnsCheckFilter: {
        system: check => {
          return check.id !== 'descriptionCheck';
        },
      },
    }),
});

export default [
  testTab1,
  testTab2,
  testColumn1,
  testWidget1,
  testWidget2,
  label,
  setting,
  techInsights,
];
