/**
 * scaffolderAction.test.ts
 *
 * Tests for the aws:assumeRole scaffolder action.
 * KmsService, StsService, and CatalogService are all mocked.
 */

import {
  createAwsAssumeRoleAction,
  DEPLOY_ROLE_ANNOTATION,
} from '../scaffolderAction';
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { CatalogService } from '@backstage/plugin-catalog-node';

// region Fixtures

const logger: LoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

const issuer = 'https://backstage.example.com/api/aws-oidc';

const mockKmsService = {
  signJwt: jest.fn().mockResolvedValue('header.payload.signature'),
  getJwks: jest.fn(),
};

const mockStsService = {
  assumeRole: jest.fn().mockResolvedValue({
    accessKeyId: 'ASIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    sessionToken: 'AQoDYXdzEJr//session-token==',
    expiration: '2024-01-01T01:00:00.000Z',
  }),
};

const mockCatalogService: jest.Mocked<Pick<CatalogService, 'getEntityByRef'>> =
  {
    getEntityByRef: jest.fn(),
  };

const mockCredentials = { type: 'none' as const };

function makeCtx(input: Record<string, unknown>) {
  const outputs: Record<string, unknown> = {};
  return {
    input,
    logger,
    workspacePath: '/tmp/workspace',
    output: jest.fn((key: string, value: unknown) => {
      outputs[key] = value;
    }),
    outputs,
    getInitiatorCredentials: jest.fn().mockResolvedValue(mockCredentials),
    checkpoint: jest.fn(),
    createTemporaryDirectory: jest.fn().mockResolvedValue('/tmp/dir'),
    task: { id: 'test-task-id' },
    secrets: {},
  };
}

function makeEntity(roleArn: string) {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'my-service',
      namespace: 'default',
      annotations: {
        [DEPLOY_ROLE_ANNOTATION]: roleArn,
      },
    },
    spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
  };
}

// region Setup
function buildAction() {
  return createAwsAssumeRoleAction({
    kmsService: mockKmsService as any,
    stsService: mockStsService as any,
    catalogService: mockCatalogService as any,
    issuer,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockKmsService.signJwt.mockResolvedValue('header.payload.signature');
  mockStsService.assumeRole.mockResolvedValue({
    accessKeyId: 'ASIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    sessionToken: 'AQoDYXdzEJr//session-token==',
    expiration: '2024-01-01T01:00:00.000Z',
  });
});

// region metadata
describe('action metadata', () => {
  it('has id aws:assumeRole', () => {
    const action = buildAction();
    expect(action.id).toBe('aws:assumeRole');
  });

  it('has a description', () => {
    const action = buildAction();
    expect(action.description).toBeTruthy();
  });
});


describe('roleArn — explicit input', () => {
  it('passes the explicit roleArn to STS', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
    });

    await action.handler(ctx as any);

    expect(mockStsService.assumeRole).toHaveBeenCalledWith(
      expect.objectContaining({
        roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
      }),
    );
  });

  it('does not call the catalog when roleArn is provided', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
    });

    await action.handler(ctx as any);

    expect(mockCatalogService.getEntityByRef).not.toHaveBeenCalled();
  });

  it('sets JWT iss to the configured issuer', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
    });

    await action.handler(ctx as any);

    expect(mockKmsService.signJwt).toHaveBeenCalledWith(
      expect.objectContaining({ iss: issuer }),
    );
  });

  it('sets JWT aud to sts.amazonaws.com', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
    });

    await action.handler(ctx as any);

    expect(mockKmsService.signJwt).toHaveBeenCalledWith(
      expect.objectContaining({ aud: 'sts.amazonaws.com' }),
    );
  });

  it('uses the provided subject as JWT sub', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
      subject: 'scaffolder:my-template',
    });

    await action.handler(ctx as any);

    expect(mockKmsService.signJwt).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'scaffolder:my-template' }),
    );
  });

  it('outputs all four credential fields', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
    });

    await action.handler(ctx as any);

    expect(ctx.output).toHaveBeenCalledWith(
      'accessKeyId',
      'ASIAIOSFODNN7EXAMPLE',
    );
    expect(ctx.output).toHaveBeenCalledWith(
      'secretAccessKey',
      expect.any(String),
    );
    expect(ctx.output).toHaveBeenCalledWith('sessionToken', expect.any(String));
    expect(ctx.output).toHaveBeenCalledWith('expiration', expect.any(String));
  });

  it('sanitises the session name — replaces invalid chars', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit-role',
      sessionName: 'my service/name@v1',
    });

    await action.handler(ctx as any);

    const call = mockStsService.assumeRole.mock.calls[0][0];
    expect(call.sessionName).not.toMatch(/[@/]/);
  });

  it('truncates session name to 64 characters', async () => {
    const action = buildAction();
    const longName = 'a'.repeat(100);
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/r',
      sessionName: longName,
    });

    await action.handler(ctx as any);

    const call = mockStsService.assumeRole.mock.calls[0][0];
    expect(call.sessionName.length).toBeLessThanOrEqual(64);
  });

  it('defaults durationSeconds to 900', async () => {
    const action = buildAction();
    const ctx = makeCtx({ roleArn: 'arn:aws:iam::111111111111:role/r' });

    await action.handler(ctx as any);

    expect(mockStsService.assumeRole).toHaveBeenCalledWith(
      expect.objectContaining({ durationSeconds: 900 }),
    );
  });

  it('uses provided durationSeconds', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/r',
      durationSeconds: 3600,
    });

    await action.handler(ctx as any);

    expect(mockStsService.assumeRole).toHaveBeenCalledWith(
      expect.objectContaining({ durationSeconds: 3600 }),
    );
  });
});


describe('roleArn — from entity annotation', () => {
  const entityRef = 'component:default/my-service';
  const annotationRoleArn = 'arn:aws:iam::222222222222:role/from-annotation';

  beforeEach(() => {
    mockCatalogService.getEntityByRef.mockResolvedValue(
      makeEntity(annotationRoleArn) as any,
    );
  });

  it('looks up the entity by ref', async () => {
    const action = buildAction();
    const ctx = makeCtx({ entityRef });

    await action.handler(ctx as any);

    expect(mockCatalogService.getEntityByRef).toHaveBeenCalledWith(
      entityRef,
      expect.objectContaining({ credentials: mockCredentials }),
    );
  });

  it('uses the annotation ARN for STS', async () => {
    const action = buildAction();
    const ctx = makeCtx({ entityRef });

    await action.handler(ctx as any);

    expect(mockStsService.assumeRole).toHaveBeenCalledWith(
      expect.objectContaining({ roleArn: annotationRoleArn }),
    );
  });

  it('prefers explicit roleArn over entityRef annotation', async () => {
    const action = buildAction();
    const ctx = makeCtx({
      roleArn: 'arn:aws:iam::111111111111:role/explicit',
      entityRef,
    });

    await action.handler(ctx as any);

    expect(mockStsService.assumeRole).toHaveBeenCalledWith(
      expect.objectContaining({
        roleArn: 'arn:aws:iam::111111111111:role/explicit',
      }),
    );
    expect(mockCatalogService.getEntityByRef).not.toHaveBeenCalled();
  });

  it('throws when entity is not found in catalog', async () => {
    mockCatalogService.getEntityByRef.mockResolvedValue(undefined);
    const action = buildAction();
    const ctx = makeCtx({ entityRef });

    await expect(action.handler(ctx as any)).rejects.toThrow(
      'Entity not found in catalog: component:default/my-service',
    );
  });

  it('throws when entity has no deploy-role annotation', async () => {
    const entityWithoutAnnotation = {
      ...makeEntity(annotationRoleArn),
      metadata: { name: 'my-service', namespace: 'default', annotations: {} },
    };
    mockCatalogService.getEntityByRef.mockResolvedValue(
      entityWithoutAnnotation as any,
    );

    const action = buildAction();
    const ctx = makeCtx({ entityRef });

    await expect(action.handler(ctx as any)).rejects.toThrow(
      `does not have the ${DEPLOY_ROLE_ANNOTATION} annotation`,
    );
  });
});

// region input validation
describe('input validation', () => {
  it('throws when neither roleArn nor entityRef is provided', async () => {
    const action = buildAction();
    const ctx = makeCtx({});

    // Zod .refine() throws at validation time — the error surfaces as a thrown error
    await expect(action.handler(ctx as any)).rejects.toThrow();
  });
});
