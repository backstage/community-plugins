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
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import { createTransport, Transporter } from 'nodemailer';

import { readFileSync } from 'fs';

export class NodeMailer {
  private readonly transportConfig: Transporter;
  private readonly from: string | undefined;

  constructor(config: Config, private logger: LoggerService) {
    const useSecure = config.getOptionalBoolean(
      'feedback.integrations.email.secure',
    );
    const caCertPath = config.getOptionalString(
      'feedback.integrations.email.caCert',
    );
    const customCACert = caCertPath ? readFileSync(caCertPath) : undefined;

    this.from = config.getOptionalString('feedback.integrations.email.from');
    this.transportConfig = createTransport({
      host: config.getOptionalString('feedback.integrations.email.host'),
      port: config.getOptionalNumber('feedback.integrations.email.port') ?? 587,
      auth: {
        user: config.getOptionalString('feedback.integrations.email.auth.user'),
        pass: config.getOptionalString('feedback.integrations.email.auth.pass'),
      },
      secure: useSecure,
      tls: {
        ca: customCACert,
      },
    });
  }

  async sendMail(options: {
    to: string;
    replyTo: string;
    subject: string;
    body: string;
  }): Promise<{}> {
    try {
      const { to, replyTo, subject, body } = options;
      this.logger.info(`Sending mail to ${to}`);
      const resp = await this.transportConfig.sendMail({
        to: to,
        replyTo: replyTo,
        cc: replyTo,
        from: this.from,
        subject: subject,
        html: body,
      });
      return resp;
    } catch (error: any) {
      this.logger.error(`Failed to send mail: ${error.message}`);
      return {};
    }
  }
}
