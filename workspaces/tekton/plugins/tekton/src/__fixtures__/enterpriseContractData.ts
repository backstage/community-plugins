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
import { EnterpriseContractResult } from '@aonic-ui/pipelines';

export const enterpriseContractResult: EnterpriseContractResult = {
  success: false,
  components: [
    {
      name: 'Unnamed',
      containerImage:
        'quay-q8tg2.apps.cluster-q8tg2.sandbox1329.opentlc.com/quayadmin/sbtestapp@sha256:bb1fcefb952b9f0b6c0c6fe9e84ea8a20fd828a2744dfbd1a9cb164d85507e12',
      violations: [
        {
          msg:
            'No image attestations found matching the given public key. Verify the correct public key was provided, and one or more attestations were created. Error: no matching attestations: no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY\n' +
            ' no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY',
          metadata: {
            collections: [],
            code: 'builtin.attestation.signature_check',
            description:
              'The attestation signature matches available signing materials.',
            title: 'Attestation signature check passed',
          },
        },

        {
          msg: 'No image signatures found matching the given public key. Verify the correct public key was provided, and a signature was created. Error: no matching signatures: no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY',
          metadata: {
            collections: [],
            code: 'builtin.image.signature_check',
            description:
              'The image signature matches available signing materials.',
            title: 'Image signature check passed',
          },
        },
      ],
      warnings: [
        {
          msg:
            'No image attestations found matching the given public key. Verify the correct public key was provided, and one or more attestations were created. Error: no matching attestations: no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY\n' +
            ' no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY',
          metadata: {
            collections: [],
            code: 'builtin.attestation.signature_check',
            description:
              'The attestation signature matches available signing materials.',
            title: 'Attestation signature check passed',
          },
        },
      ],
      successes: [
        {
          msg:
            'No image attestations found matching the given public key. Verify the correct public key was provided, and one or more attestations were created. Error: no matching attestations: no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY\n' +
            ' no valid tlog entries found rekor log public key not found for payload. Check your TUF root (see cosign initialize) or set a custom key with env var SIGSTORE_REKOR_PUBLIC_KEY',
          metadata: {
            collections: [],
            code: 'builtin.attestation.signature_check',
            description:
              'The attestation signature matches available signing materials.',
            title: 'Attestation signature check passed',
          },
        },
      ],
      success: false,
    },
  ],

  key:
    '-----BEGIN PUBLIC KEY-----\n' +
    'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEufoDqiDhIyBmgFLdbgZugfk0qJSx\n' +
    'mF3EqQuuhU1gMlQiAs2kWVHEc/SKyp4/ktaG3ktLgAhids7RfqDm7iAgGg==\n' +
    '-----END PUBLIC KEY-----\n' +
    '',
  policy: {
    configuration: {
      collections: [],
      exclude: [],
    },
    description:
      'Includes rules for levels 1, 2 & 3 of SLSA v0.1. This is the default config used for new RHTAP applications. Available collections are defined in https://redhat-appstudio.github.io/docs.stonesoup.io/ec-policies/release_policy.html#_available_rule_collections. If a different policy configuration is desired, this resource can serve as a starting point. See the docs on how to include and exclude rules https://redhat-appstudio.github.io/docs.stonesoup.io/ec-policies/policy_configuration.html#_including_and_excluding_rules.',
    sources: [
      {
        name: 'Default',
        policy: [
          'github.com/enterprise-contract/ec-policies//policy/lib',
          'github.com/enterprise-contract/ec-policies//policy/release',
        ],
        data: [
          'oci::quay.io/redhat-appstudio-tekton-catalog/data-acceptable-bundles:latest',
          'github.com/release-engineering/rhtap-ec-policy//data',
        ],
      },
    ],
    publicKey: '/workspace/cosign.pub',
  },
};
