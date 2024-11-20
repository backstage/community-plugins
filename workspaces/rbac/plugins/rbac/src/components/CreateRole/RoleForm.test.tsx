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
import React from 'react';

import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { MockErrorApi, TestApiProvider } from '@backstage/test-utils';
import { MockTranslationApi } from '@backstage/test-utils/alpha';

import { render, screen } from '@testing-library/react';
import { useFormik } from 'formik';

import { RoleForm } from './RoleForm';

jest.mock('@mui/styles', () => ({
  ...jest.requireActual('@mui/styles'),
  makeStyles: jest.fn().mockReturnValue(() => ({})),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: React.forwardRef<
    HTMLAnchorElement,
    { to: string; children?: React.ReactNode }
  >((props, ref) => (
    <a href={props.to} ref={ref} data-test={props.to}>
      {props.children}
    </a>
  )),
  useNavigate: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormik: jest.fn(),
}));

const useFormikMock = useFormik as jest.Mock;

describe('Create RoleForm', () => {
  it('renders create role form correctly', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: '' },
    });
    render(
      <TestApiProvider
        apis={[
          [translationApiRef, MockTranslationApi.create()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <RoleForm
          membersData={{ members: [], loading: false, error: {} as Error }}
          roleName=""
          initialValues={{
            name: '',
            namespace: 'default',
            kind: 'role',
            description: '',
            selectedMembers: [],
            permissionPoliciesRows: [
              {
                plugin: '',
                permission: '',
                policies: [
                  { policy: 'Create', effect: 'deny' },
                  { policy: 'Read', effect: 'deny' },
                  { policy: 'Update', effect: 'deny' },
                  { policy: 'Delete', effect: 'deny' },
                ],
              },
            ],
          }}
          titles={{
            formTitle: 'Create Role',
            nameAndDescriptionTitle: 'Enter name and description of role ',
            usersAndGroupsTitle: 'Add users and groups',
            permissionPoliciesTitle: 'Add permission policies',
          }}
        />
      </TestApiProvider>,
    );

    expect(
      screen.getByText(/enter name and description of role/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId(/role-name/i)).toBeInTheDocument();
    expect(screen.getByTestId(/role-description/i)).toBeInTheDocument();
    expect(screen.getByText(/add users and groups/i)).toBeInTheDocument();
  });

  it('shows error if there is any error in formik status', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unable to create role. Unexpected error' },
    });
    render(
      <TestApiProvider
        apis={[
          [translationApiRef, MockTranslationApi.create()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <RoleForm
          membersData={{ members: [], loading: false, error: {} as Error }}
          roleName=""
          initialValues={{
            name: '',
            namespace: 'default',
            kind: 'role',
            description: '',
            selectedMembers: [],
            permissionPoliciesRows: [
              {
                plugin: '',
                permission: '',
                policies: [
                  { policy: 'Create', effect: 'deny' },
                  { policy: 'Read', effect: 'deny' },
                  { policy: 'Update', effect: 'deny' },
                  { policy: 'Delete', effect: 'deny' },
                ],
              },
            ],
          }}
          titles={{
            formTitle: 'Create Role',
            nameAndDescriptionTitle: 'Enter name and description of role ',
            usersAndGroupsTitle: 'Add users and groups',
            permissionPoliciesTitle: 'Add permission policies',
          }}
        />
      </TestApiProvider>,
    );

    expect(
      screen.getByText(/Unable to create role. unexpected error/i),
    ).toBeInTheDocument();
  });
});

describe('Edit RoleForm', () => {
  it('renders edit role form correctly', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unexpected error' },
    });
    render(
      <TestApiProvider
        apis={[
          [translationApiRef, MockTranslationApi.create()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <RoleForm
          membersData={{ members: [], loading: false, error: {} as Error }}
          roleName="role:default/xyz"
          initialValues={{
            name: 'xyz',
            namespace: 'default',
            kind: 'role',
            description: '',
            selectedMembers: [
              {
                ref: 'user:default/janelle.dawe',
                label: 'Janelle Dawe',
                etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
                type: 'User',
                namespace: 'default',
              },
            ],
            permissionPoliciesRows: [
              {
                plugin: '',
                permission: '',
                policies: [
                  { policy: 'Create', effect: 'deny' },
                  { policy: 'Read', effect: 'deny' },
                  { policy: 'Update', effect: 'deny' },
                  { policy: 'Delete', effect: 'deny' },
                ],
              },
            ],
          }}
          titles={{
            formTitle: 'Edit Role',
            nameAndDescriptionTitle: 'Edit name and description of role ',
            usersAndGroupsTitle: 'Edit users and groups',
            permissionPoliciesTitle: 'Edit permission policies',
          }}
        />
      </TestApiProvider>,
    );

    expect(
      screen.getByText(/edit name and description of role/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId(/role-name/i)).toBeInTheDocument();
    expect(screen.getByTestId(/role-description/i)).toBeInTheDocument();
    expect(screen.getByText(/edit users and groups/i)).toBeInTheDocument();
  });

  it('renders edit role form correctly with edit users and groups stepper active', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {
        selectedMembers: [
          {
            ref: 'user:default/janelle.dawe',
            label: 'Janelle Dawe',
            etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
            type: 'User',
            namespace: 'default',
          },
        ],
      },
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unexpected error' },
    });
    render(
      <TestApiProvider
        apis={[
          [translationApiRef, MockTranslationApi.create()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <RoleForm
          step={1}
          membersData={{
            members: [
              {
                metadata: {
                  namespace: 'default',
                  annotations: {},
                  name: '',
                  uid: '',
                  etag: '',
                },
                apiVersion: 'backstage.io/v1alpha1',
                kind: 'User',
                spec: {
                  profile: {
                    displayName: '',
                  },
                  memberOf: [],
                },
                relations: [],
              },
              {
                metadata: {
                  namespace: 'default',
                  annotations: {},
                  name: 'janelle.dawe',
                  uid: '00a6a3c6-329c-4c0e-8ffb-ce2a16782d24',
                  etag: 'fb0eb7d5de1eb7d7bfd92c10ac5508623c7286b8',
                },
                apiVersion: 'backstage.io/v1alpha1',
                kind: 'User',
                spec: {
                  profile: {
                    displayName: 'Janelle Dawe',
                  },
                  memberOf: ['team-d'],
                },
                relations: [],
              },
              {
                metadata: {
                  namespace: 'default',
                  annotations: {},
                  name: 'lucy.sheehan',
                  uid: '00a6a3c6-329c-4c0e-8ffb-ce2a16782d24',
                  etag: 'fb0eb7d5de1eb7d7bfd92c10ac5508623c7286b8',
                },
                apiVersion: 'backstage.io/v1alpha1',
                kind: 'User',
                spec: {
                  profile: {
                    displayName: 'Lucy Sheehan',
                  },
                  memberOf: ['team-d'],
                },
                relations: [],
              },
            ],
            loading: false,
            error: {} as Error,
          }}
          roleName="role:default/xyz"
          initialValues={{
            name: 'xyz',
            namespace: 'default',
            kind: 'role',
            description: '',
            selectedMembers: [
              {
                ref: 'user:default/janelle.dawe',
                label: 'Janelle Dawe',
                etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
                type: 'User',
                namespace: 'default',
              },
            ],
            permissionPoliciesRows: [
              {
                plugin: '',
                permission: '',
                policies: [
                  { policy: 'Create', effect: 'deny' },
                  { policy: 'Read', effect: 'deny' },
                  { policy: 'Update', effect: 'deny' },
                  { policy: 'Delete', effect: 'deny' },
                ],
              },
            ],
          }}
          titles={{
            formTitle: 'Edit Role',
            nameAndDescriptionTitle: 'Edit name and description of role ',
            usersAndGroupsTitle: 'Edit users and groups',
            permissionPoliciesTitle: 'Edit permission policies',
          }}
        />
      </TestApiProvider>,
    );

    expect(screen.getByText(/edit users and groups/i)).toBeInTheDocument();
    expect(screen.getByText(/janelle dawe/i)).toBeInTheDocument();
  });

  it('shows error if there is any error in formik status', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {
        selectedMembers: [
          {
            ref: 'user:default/janelle.dawe',
            label: 'Janelle Dawe',
            etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
            type: 'User',
            namespace: 'default',
          },
        ],
      },
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unable to edit the role. Unexpected error' },
    });
    render(
      <TestApiProvider
        apis={[
          [translationApiRef, MockTranslationApi.create()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <RoleForm
          membersData={{ members: [], loading: false, error: {} as Error }}
          roleName="role:default/xyz"
          initialValues={{
            name: 'xyz',
            namespace: 'default',
            kind: 'role',
            description: '',
            selectedMembers: [],
            permissionPoliciesRows: [
              {
                plugin: '',
                permission: '',
                policies: [
                  { policy: 'Create', effect: 'deny' },
                  { policy: 'Read', effect: 'deny' },
                  { policy: 'Update', effect: 'deny' },
                  { policy: 'Delete', effect: 'deny' },
                ],
              },
            ],
          }}
          titles={{
            formTitle: 'Edit Role',
            nameAndDescriptionTitle: 'Edit name and description of role ',
            usersAndGroupsTitle: 'Edit users and groups',
            permissionPoliciesTitle: 'Edit permission policies',
          }}
        />
      </TestApiProvider>,
    );

    expect(
      screen.getByText(/unable to edit the role. unexpected error/i),
    ).toBeInTheDocument();
  });
});
