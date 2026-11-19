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
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';
import useDebounce from 'react-use/esm/useDebounce';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import {
  Alert,
  Button,
  ButtonIcon,
  Card,
  CardBody,
  CardHeader,
  Container,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  Grid,
  Skeleton,
  Text,
  TextField,
} from '@backstage/ui';
import { RiFileCopyLine } from '@remixicon/react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';
import type { Entity } from '@backstage/catalog-model';
import {
  DataFetcher,
  MDX_CARD_TEMPLATE_ID_PATTERN,
  mdxCardTemplateCreatePermission,
  mdxCardTemplateDeletePermission,
  mdxCardTemplateUpdatePermission,
} from '@backstage-community/plugin-mdx-card-common';
import { mdxCardApiRef } from '../../api';
import { MdxCardContent } from '../MdxCardContent';
import { DataFetchersEditor } from './DataFetchersEditor';
import { EntityPreviewPicker } from './EntityPreviewPicker';

const DEFAULT_TEMPLATE = `## Hello {props.user.displayName}

Edit this template and the preview updates as you type.
`;

type FormState = {
  id: string;
  title: string;
  template: string;
  dataFetchers: DataFetcher[];
};

const editorExtensions = [
  markdown({ extensions: { remove: ['IndentedCode', 'Link'] } }),
  EditorView.lineWrapping,
];

const snippetExtensions = [EditorView.lineWrapping];

const isComplete = (fetcher: DataFetcher) =>
  Boolean(fetcher.name && fetcher.pluginId && fetcher.apiUrl);

const usesEntity = ({ template, dataFetchers }: FormState) =>
  /\bprops\.entity\b/.test(template) ||
  dataFetchers.some(fetcher => /\bentity\./.test(fetcher.apiUrl));

const usageSnippet = (id: string) => `app:
  extensions:
    - entity-card:mdx-card:
        config:
          templateRef: ${id}`;

const editorTheme = () =>
  document
    .querySelector('[data-theme-mode]')
    ?.getAttribute('data-theme-mode') === 'dark'
    ? 'dark'
    : 'light';

const TemplateEditorForm = ({
  initial,
  isNew,
}: {
  initial: FormState;
  isNew: boolean;
}) => {
  const mdxCardApi = useApi(mdxCardApiRef);
  const alertApi = useApi(alertApiRef);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [preview, setPreview] = useState(initial);
  const [entity, setEntity] = useState<Entity>();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useDebounce(() => setPreview(form), 500, [form]);

  const { allowed: canSave } = usePermission({
    permission: isNew
      ? mdxCardTemplateCreatePermission
      : mdxCardTemplateUpdatePermission,
  });
  const { allowed: canDelete } = usePermission({
    permission: mdxCardTemplateDeletePermission,
  });

  const idError =
    isNew && !MDX_CARD_TEMPLATE_ID_PATTERN.test(form.id)
      ? 'Use lowercase letters, numbers and single dashes'
      : undefined;

  const reportError = (action: string, e: unknown) =>
    alertApi.post({
      message: `Failed to ${action} MDX card: ${
        e instanceof Error ? e.message : String(e)
      }`,
      severity: 'error',
    });

  const save = async () => {
    setSaving(true);
    const input = {
      title: form.title || undefined,
      template: form.template,
      dataFetchers: form.dataFetchers,
    };
    try {
      if (isNew) {
        await mdxCardApi.createTemplate(form.id, input);
        navigate(`../edit/${form.id}`, { replace: true });
      } else {
        await mdxCardApi.updateTemplate(form.id, input);
      }
      alertApi.post({
        message: `Saved MDX card "${form.id}"`,
        severity: 'success',
        display: 'transient',
      });
    } catch (e) {
      reportError('save', e);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    try {
      await mdxCardApi.deleteTemplate(form.id);
      navigate('..');
    } catch (e) {
      reportError('delete', e);
    }
  };

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Text as="h2" variant="title-medium">
            {isNew ? 'New MDX card' : form.id}
          </Text>
          <Flex gap="2">
            <Button variant="tertiary" onPress={() => navigate('..')}>
              Back
            </Button>
            {!isNew && (
              <Button
                variant="secondary"
                destructive
                isDisabled={!canDelete}
                onPress={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
            <Button
              isDisabled={!canSave || Boolean(idError)}
              isPending={saving}
              onPress={save}
            >
              Save
            </Button>
          </Flex>
        </Flex>
        <Grid.Root columns={{ initial: '1', lg: '2' }} gap="6">
          <Grid.Item>
            <Flex direction="column" gap="4">
              {isNew && (
                <TextField
                  label="ID"
                  isRequired
                  value={form.id}
                  onChange={id => setForm({ ...form, id })}
                  isInvalid={Boolean(form.id && idError)}
                  description={
                    (form.id && idError) ||
                    'Cards reference the template by this ID. It cannot be changed later.'
                  }
                />
              )}
              <TextField
                label="Title"
                value={form.title}
                onChange={title => setForm({ ...form, title })}
              />
              <DataFetchersEditor
                value={form.dataFetchers}
                onChange={dataFetchers => setForm({ ...form, dataFetchers })}
              />
              <Flex direction="column" gap="2">
                <Text variant="title-x-small">Template</Text>
                <CodeMirror
                  value={form.template}
                  height="480px"
                  theme={editorTheme()}
                  extensions={editorExtensions}
                  onChange={template => setForm({ ...form, template })}
                />
              </Flex>
            </Flex>
          </Grid.Item>
          <Grid.Item>
            <Flex direction="column" gap="4">
              <EntityPreviewPicker onChange={setEntity} />
              <Card>
                <CardHeader>
                  <Text as="h3" variant="title-small">
                    {preview.title || 'Preview'}
                  </Text>
                </CardHeader>
                <CardBody>
                  {usesEntity(preview) && !entity ? (
                    <Text color="secondary">
                      This template uses an entity. Pick one above to preview
                      it.
                    </Text>
                  ) : (
                    <MdxCardContent
                      template={preview.template}
                      dataFetchers={preview.dataFetchers.filter(isComplete)}
                      entity={entity}
                    />
                  )}
                </CardBody>
              </Card>
              {!isNew && (
                <Flex direction="column" gap="2">
                  <Flex justify="between" align="center">
                    <Text variant="title-x-small">Use this card</Text>
                    <ButtonIcon
                      aria-label="Copy configuration"
                      variant="tertiary"
                      icon={<RiFileCopyLine />}
                      onPress={() =>
                        window.navigator.clipboard.writeText(
                          usageSnippet(form.id),
                        )
                      }
                    />
                  </Flex>
                  <CodeMirror
                    value={usageSnippet(form.id)}
                    editable={false}
                    basicSetup={{ lineNumbers: false, foldGutter: false }}
                    theme={editorTheme()}
                    extensions={snippetExtensions}
                  />
                </Flex>
              )}
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </Flex>
      <Dialog isOpen={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogHeader>Delete MDX card "{form.id}"?</DialogHeader>
        <DialogBody>
          <Text>Cards that reference this template will stop rendering.</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onPress={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button destructive onPress={remove}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </Container>
  );
};

export const TemplateEditor = () => {
  const { id } = useParams();
  const mdxCardApi = useApi(mdxCardApiRef);
  const { value, loading, error } = useAsync(
    async () => (id ? mdxCardApi.getTemplate(id) : undefined),
    [id, mdxCardApi],
  );

  if (loading) {
    return (
      <Container>
        <Skeleton width="100%" height={240} />
      </Container>
    );
  }
  if (error) {
    return (
      <Container>
        <Alert
          status="danger"
          title="Failed to load the MDX card"
          description={error.message}
        />
      </Container>
    );
  }

  const initial: FormState = value
    ? {
        id: value.id,
        title: value.title ?? '',
        template: value.template,
        dataFetchers: value.dataFetchers,
      }
    : { id: '', title: '', template: DEFAULT_TEMPLATE, dataFetchers: [] };

  return (
    <TemplateEditorForm key={id ?? 'new'} initial={initial} isNew={!value} />
  );
};
