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
import { ManifestByDigestResponse } from '../../src/types';

export const manifestDigest: ManifestByDigestResponse = {
  digest:
    'sha256:69c96c750aa532d92d9cb56cad59159b7cc26b10e39ff4a895c28345d2cd775c',
  is_manifest_list: false,
  manifest_data:
    '{"schemaVersion":2,"mediaType":"application/vnd.docker.distribution.manifest.v2+json","config":{"mediaType":"application/vnd.docker.container.image.v1+json","size":17365,"digest":"sha256:310424866fd16a57c0482e074e3427c2b43e9609c7c374f93e9892d08fe0eb97"},"layers":[{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":35229925,"digest":"sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":35814161,"digest":"sha256:1a251b642c47a50df3cba23758292a935dbfaaedd06c46d6ec3c7b183366e4e1"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":7890431,"digest":"sha256:764fa784abb1b2acbbf021b07b22456b6325d795aa44221d9f424ffabdd053a3"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":2430760,"digest":"sha256:0e0603c707af046d0e20d0a759ace11ade1810dd01aa01ca093e5641668c1df2"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":375979,"digest":"sha256:e40868e9969dd12619439517eb1e8b3ebc12f20612e935623cc9b333c2fc070a"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":1093,"digest":"sha256:524c37f6b31165295c535f14f2f751b0fb81be16a564d6979c7bc9874a46906d"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":82665917,"digest":"sha256:7a656e9add13433636b14ebc9c091047a18722f348bd69a340d41dff5378199a"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":9917349,"digest":"sha256:3b60bbc3a23cb66e457b35ac37b9736a9f180863721a0bb34f7674c9c546e6d0"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":9920898,"digest":"sha256:33387facf2f525cea440b76a09d3fb59c023d11851e05fa708e5755427a2a4db"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":1821,"digest":"sha256:5cbdfdcc10a05b236a41b432bda61d94376d08b07da82c47ee5b4a84af16a6b1"},{"mediaType":"application/vnd.docker.image.rootfs.diff.tar.gzip","size":91614274,"digest":"sha256:cde684b256843997b1ee8cf3c0a4f38f94325f8ce2a069f22b53c676ec0ebf5b"}]}',
  config_media_type: 'application/vnd.docker.container.image.v1+json',
  layers_compressed_size: 275862608,
  layers: [
    {
      index: 0,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:4be34f167a8d152eb1c269f3acbcc7ef9acca742971e5487e418a12b7dc2ac99 in / ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:14 -0000',
    },
    {
      index: 1,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c mv -f /etc/yum.repos.d/ubi.repo /tmp || :'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 2,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:214c1de395c24e4a86ef9a706069ef30a9e804c63f851c37c35655e16fea3ced in /tmp/tls-ca-bundle.pem ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 3,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD multi:b9f1efa6d4eb264a2ccbb760b4589e8b42e4ef0554a87cf7fab6ba883b0df687 in /etc/yum.repos.d/ ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 4,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) LABEL maintainer="Red Hat, Inc."'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 5,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL com.redhat.component="ubi9-minimal-container"       name="ubi9-minimal"       version="9.2"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 6,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL com.redhat.license_terms="https://www.redhat.com/en/about/red-hat-end-user-license-agreements#UBI"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 7,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL summary="Provides the latest release of the minimal Red Hat Universal Base Image 9."',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 8,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL description="The Universal Base Image Minimal is a stripped down image that uses microdnf as a package manager. This base image is freely redistributable, but Red Hat only supports Red Hat technologies through subscriptions for Red Hat products. This image is maintained by Red Hat and updated regularly."',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 9,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL io.k8s.display-name="Red Hat Universal Base Image 9 Minimal"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 10,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) LABEL io.openshift.expose-services=""'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 11,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) LABEL io.openshift.tags="minimal rhel9"'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 12,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) ENV container oci'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 13,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 14,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) CMD ["/bin/bash"]'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:15 -0000',
    },
    {
      index: 15,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c rm -rf /var/log/*'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:16 -0000',
    },
    {
      index: 16,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) LABEL release=484'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:16 -0000',
    },
    {
      index: 17,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:961390d2717d39a95a230aede6672e618a2f4a42d6008ca0eb6e020beaef23a9 in /root/buildinfo/content_manifests/ubi9-minimal-container-9.2-484.json ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:17 -0000',
    },
    {
      index: 18,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:31cc2312708cc9d767aec9d39192f74d4cd3eacd247b92131f2465f3cc568578 in /root/buildinfo/Dockerfile-ubi9-minimal-9.2-484 ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:17 -0000',
    },
    {
      index: 19,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL "distribution-scope"="public" "vendor"="Red Hat, Inc." "build-date"="2023-05-03T08:55:50" "architecture"="aarch64" "vcs-type"="git" "vcs-ref"="7ef59505f75bf0c11c8d3addefebee5ceaaf4c41" "io.k8s.description"="The Universal Base Image Minimal is a stripped down image that uses microdnf as a package manager. This base image is freely redistributable, but Red Hat only supports Red Hat technologies through subscriptions for Red Hat products. This image is maintained by Red Hat and updated regularly." "url"="https://access.redhat.com/containers/#/registry.access.redhat.com/ubi9-minimal/images/9.2-484"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:17 -0000',
    },
    {
      index: 20,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        "/bin/sh -c rm -f '/etc/yum.repos.d/repo-5b631.repo' '/etc/yum.repos.d/repo-f1088.repo'",
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:18 -0000',
    },
    {
      index: 21,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c rm -f /tmp/tls-ca-bundle.pem'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Wed, 03 May 2023 09:08:19 -0000',
    },
    {
      index: 22,
      compressed_size: 35229925,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c mv -fZ /tmp/ubi.repo /etc/yum.repos.d/ubi.repo || :',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:27844678c499cd28d128544604c99a91d5d692bc905f931297048c44c1764c63',
      created_datetime: 'Wed, 03 May 2023 09:08:20 -0000',
    },
    {
      index: 23,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c mv -f /etc/yum.repos.d/ubi.repo /tmp || :'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 24,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:214c1de395c24e4a86ef9a706069ef30a9e804c63f851c37c35655e16fea3ced in /tmp/tls-ca-bundle.pem ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 25,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD multi:965475b2b6a17f9fc5e6f478c21e5819dc47165ea953c7d1d690fbf83b7b5033 in /etc/yum.repos.d/ ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 26,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) EXPOSE 8080'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 27,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ENV APP_ROOT=/opt/app-root     HOME=/opt/app-root/src     NPM_RUN=start     PLATFORM="el9"     NODEJS_VERSION=18     NPM_RUN=start     NAME=nodejs',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 28,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ENV SUMMARY="Minimal image for running Node.js $NODEJS_VERSION applications"     DESCRIPTION="Node.js $NODEJS_VERSION available as container is a base platform for running various Node.js $NODEJS_VERSION applications and frameworks. Node.js is a platform built on Chrome\'s JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices."     NPM_CONFIG_PREFIX=$HOME/.npm-global     PATH=$HOME/node_modules/.bin/:$HOME/.npm-global/bin/:$PATH',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 29,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL summary="$SUMMARY"       description="$DESCRIPTION"       io.k8s.description="$DESCRIPTION"       io.k8s.display-name="Node.js $NODEJS_VERSION Micro"       io.openshift.expose-services="8080:http"       io.openshift.tags="builder,$NAME,${NAME}${NODEJS_VERSION}"       io.openshift.s2i.scripts-url="image:///usr/libexec/s2i"       io.s2i.scripts-url="image:///usr/libexec/s2i"       com.redhat.dev-mode="DEV_MODE:false"       com.redhat.deployments-dir="${APP_ROOT}/src"       com.redhat.dev-mode.port="DEBUG_PORT:5858"       com.redhat.component="${NAME}-${NODEJS_VERSION}-minimal-container"       name="ubi9/$NAME-$NODEJS_VERSION-minimal"       version="1"       com.redhat.license_terms="https://www.redhat.com/en/about/red-hat-end-user-license-agreements#UBI"       maintainer="SoftwareCollections.org <sclorg@redhat.com>"       help="For more information visit https://github.com/sclorg/s2i-nodejs-container"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:22 -0000',
    },
    {
      index: 30,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c INSTALL_PKGS="nodejs nodejs-nodemon nodejs-full-i18n npm findutils tar" &&     microdnf -y module disable nodejs &&     microdnf -y module enable nodejs:$NODEJS_VERSION &&     microdnf -y --nodocs --setopt=install_weak_deps=0 install $INSTALL_PKGS &&     node -v | grep -qe "^v$NODEJS_VERSION\\." && echo "Found VERSION $NODEJS_VERSION" &&     microdnf clean all &&     rm -rf /mnt/rootfs/var/cache/* /mnt/rootfs/var/log/dnf* /mnt/rootfs/var/log/yum.*',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:34 -0000',
    },
    {
      index: 31,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) COPY dir:b5a1f1317e0040e7a730c0b1d8cf8a9fa419afa1662d666632dac699455512f1 in /usr/libexec/s2i ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:35 -0000',
    },
    {
      index: 32,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) COPY dir:fe4e9034259501521ced258ae36b98bc6cc475e0e34364c8a17e53447c145be1 in / ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:35 -0000',
    },
    {
      index: 33,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c mkdir -p "$HOME" && chown -R 1001:0 "$APP_ROOT" && chmod -R ug+rwx "$APP_ROOT"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:36 -0000',
    },
    {
      index: 34,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) WORKDIR "$HOME"'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:36 -0000',
    },
    {
      index: 35,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) USER 1001'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:36 -0000',
    },
    {
      index: 36,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) LABEL release=51'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:36 -0000',
    },
    {
      index: 37,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:9befe0967d3835f159e544c07f8b96df103c2dcad2d4155d8593b0aa26179415 in /help.1 ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:36 -0000',
    },
    {
      index: 38,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:d268896e452ea694b5bc53c82e4b005f8810f73138a0ab84fcb8b4fe251b875b in /root/buildinfo/content_manifests/nodejs-18-minimal-container-1-51.json ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:37 -0000',
    },
    {
      index: 39,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) ADD file:988016ad8c81a24f569e9d6a9e008d711ad0da77deb3eaab60d0a131b636529a in /root/buildinfo/Dockerfile-ubi9-nodejs-18-minimal-1-51 ',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:37 -0000',
    },
    {
      index: 40,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c #(nop) LABEL "distribution-scope"="public" "vendor"="Red Hat, Inc." "build-date"="2023-05-18T06:26:22" "architecture"="aarch64" "vcs-type"="git" "vcs-ref"="7eb8c3f7b6a1d2c86919c1597e070eef6d16947e" "url"="https://access.redhat.com/containers/#/registry.access.redhat.com/ubi9/nodejs-18-minimal/images/1-51"',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:37 -0000',
    },
    {
      index: 41,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) USER root'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:37 -0000',
    },
    {
      index: 42,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        "/bin/sh -c rm -f '/etc/yum.repos.d/odcs-2027322-e750b.repo' '/etc/yum.repos.d/repo-5b631.repo' '/etc/yum.repos.d/repo-f1088.repo'",
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:39 -0000',
    },
    {
      index: 43,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c rm -f /tmp/tls-ca-bundle.pem'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:40 -0000',
    },
    {
      index: 44,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) USER 1001'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:40 -0000',
    },
    {
      index: 45,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) USER root'],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:40 -0000',
    },
    {
      index: 46,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: [
        '/bin/sh -c mv -fZ /tmp/ubi.repo /etc/yum.repos.d/ubi.repo || :',
      ],
      comment: null,
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Thu, 18 May 2023 06:27:42 -0000',
    },
    {
      index: 47,
      compressed_size: 35814161,
      is_remote: false,
      urls: null,
      command: ['/bin/sh -c #(nop) USER 1001'],
      comment:
        'FROM registry.stage.redhat.io/ubi9/ubi-minimal@sha256:b00f7556d64a698aad6cb63bb75b2692f1538926c6f619d6123cbc20a74239ec',
      author: null,
      blob_digest:
        'sha256:1a251b642c47a50df3cba23758292a935dbfaaedd06c46d6ec3c7b183366e4e1',
      created_datetime: 'Thu, 18 May 2023 06:27:42 -0000',
    },
    {
      index: 48,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['USER 0'],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Mon, 12 Jun 2023 13:41:27 -0000',
    },
    {
      index: 49,
      compressed_size: 7890431,
      is_remote: false,
      urls: null,
      command: [
        'RUN /bin/sh -c curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo &&     microdnf install -y yarn # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:764fa784abb1b2acbbf021b07b22456b6325d795aa44221d9f424ffabdd053a3',
      created_datetime: 'Mon, 12 Jun 2023 13:41:27 -0000',
    },
    {
      index: 50,
      compressed_size: 2430760,
      is_remote: false,
      urls: null,
      command: [
        'RUN /bin/sh -c microdnf install -y gzip && microdnf clean all # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:0e0603c707af046d0e20d0a759ace11ade1810dd01aa01ca093e5641668c1df2',
      created_datetime: 'Mon, 12 Jun 2023 13:41:31 -0000',
    },
    {
      index: 51,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['USER 1001'],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Mon, 12 Jun 2023 13:41:31 -0000',
    },
    {
      index: 52,
      compressed_size: 375979,
      is_remote: false,
      urls: null,
      command: [
        'COPY /opt/app-root/src/yarn.lock /opt/app-root/src/package.json /opt/app-root/src/packages/backend/dist/skeleton.tar.gz ./ # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:e40868e9969dd12619439517eb1e8b3ebc12f20612e935623cc9b333c2fc070a',
      created_datetime: 'Mon, 12 Jun 2023 14:13:05 -0000',
    },
    {
      index: 53,
      compressed_size: 1093,
      is_remote: false,
      urls: null,
      command: [
        'RUN /bin/sh -c tar xzf skeleton.tar.gz && rm skeleton.tar.gz # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:524c37f6b31165295c535f14f2f751b0fb81be16a564d6979c7bc9874a46906d',
      created_datetime: 'Mon, 12 Jun 2023 14:13:05 -0000',
    },
    {
      index: 54,
      compressed_size: 82665917,
      is_remote: false,
      urls: null,
      command: [
        'RUN /bin/sh -c yarn install --frozen-lockfile --production --network-timeout 600000 && yarn cache clean # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:7a656e9add13433636b14ebc9c091047a18722f348bd69a340d41dff5378199a',
      created_datetime: 'Mon, 12 Jun 2023 14:23:02 -0000',
    },
    {
      index: 55,
      compressed_size: 9917349,
      is_remote: false,
      urls: null,
      command: [
        'COPY /opt/app-root/src/packages/backend/dist/bundle.tar.gz . # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:3b60bbc3a23cb66e457b35ac37b9736a9f180863721a0bb34f7674c9c546e6d0',
      created_datetime: 'Mon, 12 Jun 2023 14:23:02 -0000',
    },
    {
      index: 56,
      compressed_size: 9920898,
      is_remote: false,
      urls: null,
      command: [
        'RUN /bin/sh -c tar xzf bundle.tar.gz && rm bundle.tar.gz # buildkit',
      ],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:33387facf2f525cea440b76a09d3fb59c023d11851e05fa708e5755427a2a4db',
      created_datetime: 'Mon, 12 Jun 2023 14:23:04 -0000',
    },
    {
      index: 57,
      compressed_size: 1821,
      is_remote: false,
      urls: null,
      command: ['COPY ./app-config.yaml . # buildkit'],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:5cbdfdcc10a05b236a41b432bda61d94376d08b07da82c47ee5b4a84af16a6b1',
      created_datetime: 'Mon, 12 Jun 2023 14:23:04 -0000',
    },
    {
      index: 58,
      compressed_size: 91614274,
      is_remote: false,
      urls: null,
      command: ['RUN /bin/sh -c fix-permissions ./ # buildkit'],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:cde684b256843997b1ee8cf3c0a4f38f94325f8ce2a069f22b53c676ec0ebf5b',
      created_datetime: 'Mon, 12 Jun 2023 14:23:43 -0000',
    },
    {
      index: 59,
      compressed_size: 32,
      is_remote: false,
      urls: null,
      command: ['CMD ["node" "packages/backend" "--config" "app-config.yaml"]'],
      comment: 'buildkit.dockerfile.v0',
      author: null,
      blob_digest:
        'sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4',
      created_datetime: 'Mon, 12 Jun 2023 14:23:43 -0000',
    },
  ],
};
