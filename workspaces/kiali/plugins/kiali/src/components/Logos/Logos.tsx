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
import { default as React } from 'react';
import GraphqlIcon from '../../assets/img/api/graphql.svg';
import GrpcIcon from '../../assets/img/api/grpc.svg';
import RestIcon from '../../assets/img/api/rest.svg';
import GoLogo from '../../assets/img/runtime/go.svg';
import JVMLogo from '../../assets/img/runtime/java.svg';
import MicroProfileLogo from '../../assets/img/runtime/microprofile.svg';
import NodejsLogo from '../../assets/img/runtime/nodejs.svg';
import QuarkusLogo from '../../assets/img/runtime/quarkus.svg';
import SpringBootLogo from '../../assets/img/runtime/spring-boot.svg';
import ThorntailLogo from '../../assets/img/runtime/thorntail.svg';
import TomcatLogo from '../../assets/img/runtime/tomcat.svg';
import VertxLogo from '../../assets/img/runtime/vertx.svg';
import { kialiStyle } from '../../styles/StyleUtils';

const iconStyle = kialiStyle({
  height: '1.5rem',
});

const renderLogo = (
  name: string,
  title: string | undefined,
  idx: number,
  logoSet: { [key: string]: any },
  className?: string,
): React.ReactElement => {
  const logo = logoSet[name];

  if (logo) {
    return (
      <img
        key={`logo-${idx}`}
        src={logo}
        alt={name}
        title={title}
        className={className}
      />
    );
  }

  return <span key={`logo-${idx}`}>{name}</span>;
};

// API types
const apiLogos = {
  grpc: GrpcIcon,
  rest: RestIcon,
  graphql: GraphqlIcon,
};

const runtimesLogos = {
  Go: GoLogo,
  JVM: JVMLogo,
  MicroProfile: MicroProfileLogo,
  'Node.js': NodejsLogo,
  Quarkus: QuarkusLogo,
  'Spring Boot': SpringBootLogo,
  Thorntail: ThorntailLogo,
  Tomcat: TomcatLogo,
  'Vert.x': VertxLogo,
};

export const renderRuntimeLogo = (name: string, idx: number): React.ReactNode =>
  renderLogo(name, name, idx, runtimesLogos, iconStyle);

export const renderAPILogo = (
  name: string,
  title: string | undefined,
  idx: number,
): React.ReactNode => renderLogo(name, title, idx, apiLogos, iconStyle);
