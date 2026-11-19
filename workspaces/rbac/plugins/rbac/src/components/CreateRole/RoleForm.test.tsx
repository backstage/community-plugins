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
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { mockApis, MockErrorApi, TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFormik } from 'formik';

import { conditionalPolicyRow as conditionalRow } from '../../__fixtures__/mockConditionalPolicyRow';
import { mockUseLanguage } from '../../test-utils/mockTranslations';
import { RoleForm } from './RoleForm';

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: mockUseLanguage,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: forwardRef<
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
  useApi: jest.fn().mockReturnValue({
    searchMembers: jest.fn().mockResolvedValue({ items: [], totalItems: 0 }),
    getMemberNamespaces: jest.fn().mockResolvedValue([]),
  }),
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
          [translationApiRef, mockApis.translation()],
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
            selectedPlugins: [],
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
          [translationApiRef, mockApis.translation()],
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
            selectedPlugins: [],
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

  it('opens confirmation modal on cancel button click', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: '' },
    });
    const { getByRole } = render(
      <TestApiProvider
        apis={[
          [translationApiRef, mockApis.translation()],
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
            selectedPlugins: [],
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
    const cancelButton = getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(
      getByRole('button', {
        name: /discard/i,
      }),
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
          [translationApiRef, mockApis.translation()],
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
            selectedPlugins: [],
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
          [translationApiRef, mockApis.translation()],
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
            selectedPlugins: [],
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
          [translationApiRef, mockApis.translation()],
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
            selectedPlugins: [],
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

  // The submit tests replace the lean member API mock; restore it so the
  // rendering-only tests above keep working whatever the outcome.
  afterEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      searchMembers: jest.fn().mockResolvedValue({ items: [], totalItems: 0 }),
      getMemberNamespaces: jest.fn().mockResolvedValue([]),
    });
  });

  const editInitialValues = {
    kind: 'role',
    namespace: 'default',
    name: 'admins',
    description: 'Admin role',
    selectedMembers: [
      { ref: 'user:default/alice', label: 'Alice', etag: 'e1', type: 'User' },
    ],
    selectedPlugins: [{ label: 'Catalog', value: 'catalog' }],
    permissionPoliciesRows: [
      {
        plugin: 'catalog',
        permission: 'catalog.entity.read',
        policies: [{ policy: 'Read', effect: 'allow' }],
      },
      conditionalRow(1, 'keep'),
      conditionalRow(2, 'remove-me'),
    ],
  };

  /** Renders the edit form, submits `values` and waits for the save to finish. */
  const submitEditedRole = async (values: typeof editInitialValues) => {
    const navigateFn = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateFn);
    const rbacApi = {
      searchMembers: jest.fn().mockResolvedValue({ items: [], totalItems: 0 }),
      getMemberNamespaces: jest.fn().mockResolvedValue([]),
      updateRole: jest.fn().mockResolvedValue({ status: 200 }),
      deletePolicies: jest.fn().mockResolvedValue({ status: 204 }),
      createPolicies: jest.fn().mockResolvedValue({ status: 200 }),
      deleteConditionalPolicies: jest.fn().mockResolvedValue({ status: 200 }),
      updateConditionalPolicies: jest.fn().mockResolvedValue({ status: 200 }),
      createConditionalPermission: jest.fn().mockResolvedValue({ status: 200 }),
    };
    (useApi as jest.Mock).mockReturnValue(rbacApi);
    useFormikMock.mockReturnValue({ errors: {}, values: editInitialValues });

    render(
      <TestApiProvider
        apis={[
          [translationApiRef, mockApis.translation()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <RoleForm
          membersData={{ members: [], loading: false, error: {} as Error }}
          roleName="role:default/admins"
          initialValues={editInitialValues}
          titles={{
            formTitle: 'Edit Role',
            nameAndDescriptionTitle: 'Edit name and description of role ',
            usersAndGroupsTitle: 'Edit users and groups',
            permissionPoliciesTitle: 'Edit permission policies',
          }}
        />
      </TestApiProvider>,
    );

    const { onSubmit } = useFormikMock.mock.calls.at(-1)![0];
    const setStatus = jest.fn();
    await onSubmit(values, { setStatus });

    // onSubmit fires the save without awaiting it, so wait for its last step.
    await waitFor(() => expect(navigateFn).toHaveBeenCalled());
    expect(setStatus).not.toHaveBeenCalled();
    return rbacApi;
  };

  it('saves only the computed changes when submitting an edited role', async () => {
    const rbacApi = await submitEditedRole({
      ...editInitialValues,
      description: 'Updated description',
      permissionPoliciesRows: [
        {
          plugin: 'catalog',
          permission: 'catalog.entity.create',
          policies: [{ policy: 'Create', effect: 'allow' }],
        },
        conditionalRow(1, 'edited'),
        conditionalRow(undefined, 'brand-new'),
      ],
    });

    expect(rbacApi.updateRole).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'role:default/admins',
        metadata: expect.objectContaining({ description: 'Admin role' }),
      }),
      expect.objectContaining({
        name: 'role:default/admins',
        metadata: expect.objectContaining({
          description: 'Updated description',
        }),
      }),
    );
    expect(rbacApi.deletePolicies).toHaveBeenCalledWith('role:default/admins', [
      expect.objectContaining({ permission: 'catalog.entity.read' }),
    ]);
    expect(rbacApi.createPolicies).toHaveBeenCalledWith([
      expect.objectContaining({ permission: 'catalog.entity.create' }),
    ]);
    expect(rbacApi.deleteConditionalPolicies).toHaveBeenCalledWith(2);
    expect(rbacApi.updateConditionalPolicies).toHaveBeenCalledTimes(1);
    expect(rbacApi.updateConditionalPolicies).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        conditions: expect.objectContaining({ params: { label: 'edited' } }),
      }),
    );
    expect(rbacApi.createConditionalPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: expect.objectContaining({ params: { label: 'brand-new' } }),
      }),
    );
  });

  it('leaves unchanged policies alone when the role is only renamed', async () => {
    const rbacApi = await submitEditedRole({
      ...editInitialValues,
      name: 'platform-admins',
    });

    expect(rbacApi.updateRole).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'role:default/admins' }),
      expect.objectContaining({ name: 'role:default/platform-admins' }),
    );
    expect(rbacApi.deletePolicies).not.toHaveBeenCalled();
    expect(rbacApi.createPolicies).not.toHaveBeenCalled();
    expect(rbacApi.deleteConditionalPolicies).not.toHaveBeenCalled();
    expect(rbacApi.createConditionalPermission).not.toHaveBeenCalled();
    // The backend moves every policy to the new ref during the role update,
    // so a pure rename does not re-send the conditional policies either.
    expect(rbacApi.updateConditionalPolicies).not.toHaveBeenCalled();
  });
});
