/*
 * Copyright 2026 The Backstage Authors
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
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { PatchesLayout } from './PatchesLayout';
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';

const patches: PatchDefinition[] = [
  {
    name: 'group-details',
    filter: { kind: 'group' },
    title: 'Group Details',
    description: 'Basic metadata for all groups.',
    required: ['description'],
    properties: {
      description: {
        title: 'Description',
        type: 'string',
        description: 'A brief description of this group.',
        'ui:widget': 'textarea',
      },
      contactEmail: {
        title: 'Contact Email',
        type: 'string',
        format: 'email',
        description: 'Primary contact email.',
      },
      slackChannel: {
        title: 'Slack Channel',
        type: 'string',
        description: 'Slack channel name, e.g. #team-platform',
      },
      aliases: {
        title: 'Aliases',
        type: 'array',
        items: { type: 'string' },
        description: 'Other names for this group.',
      },
    },
  },
  {
    name: 'team-ownership',
    filter: { kind: 'group', 'spec.type': 'team' },
    title: 'Team Ownership',
    description: 'Ownership roles — applies only to groups of type "team".',
    properties: {
      owner: {
        title: 'Owner',
        type: 'string',
        description: 'The owner for this team.',
        'ui:field': 'OwnerPicker',
      },
    },
  },
];

describe('PatchesLayout', () => {
  it('should render visible text for each patch title', async () => {
    const testPatches = [
      { name: 'p1', title: 'Step 1', properties: {} },
      { name: 'p2', title: 'Step 2', properties: {} },
    ];

    await renderInTestApp(
      <PatchesLayout patches={testPatches} onChange={() => {}} />,
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('should call onChange with patch-keyed data when a field is changed', async () => {
    const onChange = jest.fn();
    const testPatches = [
      {
        name: 'my-patch',
        title: 'Step 1',
        properties: {
          name: { title: 'name', type: 'string' },
        },
      },
    ];

    const { getByRole } = await renderInTestApp(
      <PatchesLayout patches={testPatches} onChange={onChange} />,
    );

    await act(async () => {
      fireEvent.change(getByRole('textbox', { name: 'name' }), {
        target: { value: 'my-service' },
      });
    });

    expect(onChange).toHaveBeenCalledWith(
      { 'my-patch': { name: 'my-service' } },
      { isValid: true, isDirty: true },
    );
  });

  it('should pre-fill fields from initialData', async () => {
    const { getByRole } = await renderInTestApp(
      <PatchesLayout
        patches={patches}
        initialData={{
          'group-details': { slackChannel: '#team-platform' },
        }}
        onChange={() => {}}
      />,
    );

    expect(getByRole('textbox', { name: 'Slack Channel' })).toHaveValue(
      '#team-platform',
    );
  });

  it('should keep data from other patches when one patch changes', async () => {
    const onChange = jest.fn();
    const twoPatches = [
      {
        name: 'patch-a',
        title: 'Patch A',
        properties: { foo: { title: 'foo', type: 'string' } },
      },
      {
        name: 'patch-b',
        title: 'Patch B',
        properties: { bar: { title: 'bar', type: 'string' } },
      },
    ];

    const { getByRole } = await renderInTestApp(
      <PatchesLayout
        patches={twoPatches}
        initialData={{ 'patch-a': { foo: 'existing' } }}
        onChange={onChange}
      />,
    );

    await act(async () => {
      fireEvent.change(getByRole('textbox', { name: 'bar' }), {
        target: { value: 'new-value' },
      });
    });

    expect(onChange).toHaveBeenCalledWith(
      { 'patch-a': { foo: 'existing' }, 'patch-b': { bar: 'new-value' } },
      { isValid: true, isDirty: true },
    );
  });

  it('should store same-named fields from different patches independently', async () => {
    const onChange = jest.fn();
    const twoPatches = [
      {
        name: 'patch-a',
        title: 'Patch A',
        properties: { name: { title: 'Name A', type: 'string' } },
      },
      {
        name: 'patch-b',
        title: 'Patch B',
        properties: { name: { title: 'Name B', type: 'string' } },
      },
    ];

    const { getAllByRole } = await renderInTestApp(
      <PatchesLayout patches={twoPatches} onChange={onChange} />,
    );

    const [inputA, inputB] = getAllByRole('textbox');

    await act(async () => {
      fireEvent.change(inputA, { target: { value: 'value-from-a' } });
    });

    await act(async () => {
      fireEvent.change(inputB, { target: { value: 'value-from-b' } });
    });

    expect(onChange).toHaveBeenLastCalledWith(
      {
        'patch-a': { name: 'value-from-a' },
        'patch-b': { name: 'value-from-b' },
      },
      { isValid: true, isDirty: true },
    );
  });

  it('should include patches missing from initialData in onChange output when edited', async () => {
    const onChange = jest.fn();
    const twoPatches = [
      {
        name: 'patch-a',
        title: 'Patch A',
        properties: { foo: { title: 'foo', type: 'string' } },
      },
      {
        name: 'patch-b',
        title: 'Patch B',
        properties: { bar: { title: 'bar', type: 'string' } },
      },
    ];

    // Only patch-a has initialData, patch-b is absent
    const { getByRole } = await renderInTestApp(
      <PatchesLayout
        patches={twoPatches}
        initialData={{ 'patch-a': { foo: 'pre-filled' } }}
        onChange={onChange}
      />,
    );

    await act(async () => {
      fireEvent.change(getByRole('textbox', { name: 'bar' }), {
        target: { value: 'new' },
      });
    });

    expect(onChange).toHaveBeenCalledWith(
      { 'patch-a': { foo: 'pre-filled' }, 'patch-b': { bar: 'new' } },
      { isValid: true, isDirty: true },
    );
  });

  it('should render a textarea for fields that declare ui:widget textarea', async () => {
    const { getByRole } = await renderInTestApp(
      <PatchesLayout patches={patches} onChange={() => {}} />,
    );

    // 'description' has 'ui:widget': 'textarea' in the patches fixture
    expect(getByRole('textbox', { name: 'Description' }).tagName).toBe(
      'TEXTAREA',
    );
  });

  it('should show inline validation errors for required fields when the form is submitted empty', async () => {
    const testPatches = [
      {
        name: 'my-patch',
        title: 'My Patch',
        required: ['name'],
        properties: {
          name: { title: 'Name', type: 'string' },
          other: { title: 'Other', type: 'string' },
        },
      },
    ];

    const { container } = await renderInTestApp(
      <PatchesLayout patches={testPatches} onChange={() => {}} />,
    );

    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });

    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
  });

  it('should show schema-defined errorMessage overrides instead of default rjsf error text', async () => {
    const testPatches = [
      {
        name: 'my-patch',
        title: 'My Patch',
        properties: {
          postcode: {
            title: 'Postcode',
            type: 'string',
            pattern: '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]',
          },
        },
        errorMessage: {
          properties: {
            postcode: 'invalid postcode format',
          },
        },
      },
    ];

    const { getByRole, container } = await renderInTestApp(
      <PatchesLayout patches={testPatches} onChange={() => {}} />,
    );

    await act(async () => {
      fireEvent.change(getByRole('textbox', { name: 'Postcode' }), {
        target: { value: 'not-a-postcode' },
      });
      fireEvent.submit(container.querySelector('form')!);
    });

    expect(
      (
        await screen.findAllByText((content: string) =>
          content.includes('invalid postcode format'),
        )
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('should render a custom field extension when provided via the extensions prop', async () => {
    const MockField = () => <span>custom-field-extension</span>;

    const testPatches = [
      {
        name: 'ext-patch',
        title: 'Ext Patch',
        properties: {
          owner: {
            title: 'Owner',
            type: 'string',
            'ui:field': 'MockField',
          },
        },
      },
    ];

    const { getByText } = await renderInTestApp(
      <PatchesLayout
        patches={testPatches}
        extensions={[{ name: 'MockField', component: MockField }]}
        onChange={() => {}}
      />,
    );

    expect(getByText('custom-field-extension')).toBeInTheDocument();
  });

  // The shared schema used across all async-validation tests.
  const asyncValidationPatches = [
    {
      name: 'val-patch',
      title: 'Val Patch',
      properties: {
        owner: { title: 'Owner', type: 'string', 'ui:field': 'MockField' },
      },
    },
  ];

  describe('async validation', () => {
    it('should call onChange with isValid:false (not isValid:true) when a field extension validator returns an error', async () => {
      const onChange = jest.fn();
      const MockField = ({ onChange: onFieldChange }: any) => (
        <button type="button" onClick={() => onFieldChange('bad-value')}>
          set value
        </button>
      );

      await renderInTestApp(
        <PatchesLayout
          patches={asyncValidationPatches}
          onChange={onChange}
          extensions={[
            {
              name: 'MockField',
              component: MockField,
              validation: async (_value: any, validation: any) => {
                validation.addError('owner is invalid');
              },
            },
          ]}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'set value' }));
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(expect.any(Object), {
          isValid: false,
          isDirty: true,
        });
      });
      // Importantly, it should never have been called with isValid:true
      expect(onChange).not.toHaveBeenCalledWith(expect.any(Object), {
        isValid: true,
        isDirty: true,
      });
    });

    it('should call onChange when async validation passes with no errors', async () => {
      const onChange = jest.fn();
      const MockField = ({ onChange: onFieldChange }: any) => (
        <button type="button" onClick={() => onFieldChange('valid-value')}>
          set value
        </button>
      );

      await renderInTestApp(
        <PatchesLayout
          patches={asyncValidationPatches}
          onChange={onChange}
          extensions={[
            {
              name: 'MockField',
              component: MockField,
              validation: async () => {
                // no errors added — validation passes
              },
            },
          ]}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'set value' }));
      });

      expect(onChange).toHaveBeenCalledWith(
        { 'val-patch': { owner: 'valid-value' } },
        { isValid: true, isDirty: true },
      );
    });

    it('should display async validation errors in the form via extraErrors', async () => {
      const MockField = ({ onChange: onFieldChange }: any) => (
        <button type="button" onClick={() => onFieldChange('bad-value')}>
          set value
        </button>
      );

      await renderInTestApp(
        <PatchesLayout
          patches={asyncValidationPatches}
          onChange={() => {}}
          extensions={[
            {
              name: 'MockField',
              component: MockField,
              validation: async (_value: any, validation: any) => {
                validation.addError('owner is invalid');
              },
            },
          ]}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'set value' }));
      });

      expect(await screen.findByText('owner is invalid')).toBeInTheDocument();
    });

    it('should show a progress indicator while async validation is in flight', async () => {
      let resolveValidation!: () => void;
      const MockField = ({ onChange: onFieldChange }: any) => (
        <button type="button" onClick={() => onFieldChange('value')}>
          set value
        </button>
      );

      const { getByRole } = await renderInTestApp(
        <PatchesLayout
          patches={asyncValidationPatches}
          onChange={() => {}}
          extensions={[
            {
              name: 'MockField',
              component: MockField,
              validation: () =>
                new Promise<void>(resolve => {
                  resolveValidation = resolve;
                }),
            },
          ]}
        />,
      );

      fireEvent.click(getByRole('button', { name: 'set value' }));

      await waitFor(() => {
        expect(getByRole('progressbar')).toBeInTheDocument();
      });

      await act(async () => {
        resolveValidation();
      });
    });
  });

  describe('formContext', () => {
    it('should pass current patch formData to field extensions via formContext', async () => {
      const ContextReader = ({ formContext }: any) => (
        <span data-testid="ctx-reader">
          sibling-{String(formContext?.formData?.sib ?? 'none')}
        </span>
      );

      const testPatches = [
        {
          name: 'ctx-patch',
          title: 'Ctx Patch',
          properties: {
            sib: { title: 'Sib', type: 'string' },
            dep: {
              title: 'Dep',
              type: 'string',
              'ui:field': 'ContextReader',
            },
          },
        },
      ];

      const { getByRole, getByTestId } = await renderInTestApp(
        <PatchesLayout
          patches={testPatches}
          onChange={() => {}}
          extensions={[{ name: 'ContextReader', component: ContextReader }]}
        />,
      );

      expect(getByTestId('ctx-reader')).toHaveTextContent('sibling-none');

      await act(async () => {
        fireEvent.change(getByRole('textbox', { name: 'Sib' }), {
          target: { value: 'hello' },
        });
      });

      await waitFor(() => {
        expect(getByTestId('ctx-reader')).toHaveTextContent('sibling-hello');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // onValidityChange merged into onChange
  // ---------------------------------------------------------------------------
  describe('onValidityChange merged into onChange', () => {
    it('should call onChange with isValid:false when a field extension validator returns an error', async () => {
      const onChange = jest.fn();
      const MockField = ({ onChange: onFieldChange }: any) => (
        <button type="button" onClick={() => onFieldChange('bad-value')}>
          set value
        </button>
      );

      await renderInTestApp(
        <PatchesLayout
          patches={asyncValidationPatches}
          onChange={onChange}
          extensions={[
            {
              name: 'MockField',
              component: MockField,
              validation: async (_value: any, validation: any) => {
                validation.addError('owner is invalid');
              },
            },
          ]}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'set value' }));
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(expect.any(Object), {
          isValid: false,
          isDirty: true,
        });
      });
    });

    it('should call onChange with isValid:true when async validation passes', async () => {
      const onChange = jest.fn();
      const MockField = ({ onChange: onFieldChange }: any) => (
        <button type="button" onClick={() => onFieldChange('valid-value')}>
          set value
        </button>
      );

      await renderInTestApp(
        <PatchesLayout
          patches={asyncValidationPatches}
          onChange={onChange}
          extensions={[
            {
              name: 'MockField',
              component: MockField,
              validation: async () => {
                // no errors
              },
            },
          ]}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'set value' }));
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith(
          { 'val-patch': { owner: 'valid-value' } },
          { isValid: true, isDirty: true },
        );
      });
    });
  });

  describe('error summary list', () => {
    it('should render an error summary at the top of the section for invalid fields', async () => {
      const testPatches = [
        {
          name: 'err-patch',
          title: 'Err Patch',
          required: ['name'],
          properties: {
            name: { title: 'Name', type: 'string' },
          },
        },
      ];

      const { container } = await renderInTestApp(
        <PatchesLayout patches={testPatches} onChange={() => {}} />,
      );

      await act(async () => {
        fireEvent.submit(container.querySelector('form')!);
      });

      // With showErrorList="top", RJSF renders the errors in a summary list
      // ABOVE the fields in addition to inline — expect at least 2 occurrences.
      await waitFor(() => {
        const all = screen.getAllByText(/required/i);
        expect(all.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('unknown ui:field warning', () => {
    it('renders a visible warning when a ui:field is not registered', async () => {
      const patchWithUnknownField: PatchDefinition[] = [
        {
          name: 'owner-patch',
          filter: { kind: 'group' },
          title: 'Ownership',
          properties: {
            owner: {
              title: 'Owner',
              type: 'string',
              'ui:field': 'EntityNamePicker',
            },
          },
        },
      ];

      // No extensions provided — EntityNamePicker is unregistered
      const { getAllByTestId } = await renderInTestApp(
        <PatchesLayout patches={patchWithUnknownField} onChange={() => {}} />,
      );

      const warnings = getAllByTestId('unknown-field-warning');
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings[0].textContent).toMatch(/EntityNamePicker/);
    });

    it('does not show a warning when the ui:field is registered', async () => {
      const MockField = () => <span>registered-field</span>;
      const patchWithRegisteredField: PatchDefinition[] = [
        {
          name: 'owner-patch',
          filter: { kind: 'group' },
          title: 'Ownership',
          properties: {
            owner: {
              title: 'Owner',
              type: 'string',
              'ui:field': 'MockField',
            },
          },
        },
      ];

      const { queryByTestId } = await renderInTestApp(
        <PatchesLayout
          patches={patchWithRegisteredField}
          extensions={[{ name: 'MockField', component: MockField }]}
          onChange={() => {}}
        />,
      );

      expect(queryByTestId('unknown-field-warning')).toBeNull();
    });
  });
});
