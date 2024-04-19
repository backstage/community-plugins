/*
 * Copyright 2020 The Backstage Authors
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

export interface Config {
  app: {
    // TODO: Only marked as optional because backstage-cli config:check in the
    // context of the monorepo is too strict. Ideally, this would be marked as
    // required.
    analytics?: {
      ga4: {
        /**
         * Google Analytics measurement ID, e.g. G-000000-0
         * @visibility frontend
         */
        measurementId: string;

        /**
         * Controls how the identityApi is used when sending data to GA:
         *
         * - `disabled`: (Default) Explicitly prevents a user's identity from
         *   being used when capturing events in GA.
         * - `optional`: Pageviews and hits are forwarded to GA as they happen
         *   and only include user identity metadata once known. Guarantees
         *   that hits are captured for all sessions, even if no sign in
         *   occurs, but may result in dropped hits in User ID views.
         * - `required`: All pageviews and hits are deferred until an identity
         *   is known. Guarantees that all data sent to GA correlates to a user
         *   identity, but prevents GA from receiving events for sessions in
         *   which a user does not sign in. An `identityApi` instance must be
         *   passed during instantiation when set to this value.
         *
         * @visibility frontend
         */
        identity?: 'disabled' | 'optional' | 'required';

        /**
         * Whether to log analytics debug statements to the console.
         * Defaults to false.
         *
         * @visibility frontend
         */
        debug?: boolean;

        /**
         * Whether to send default send_page_view event.
         * Defaults to false.
         *
         * @visibility frontend
         */
        enableSendPageView?: boolean;

        /**
         * Prevents events from actually being sent when set to true. Defaults
         * to false.
         *
         * @visibility frontend
         */
        testMode?: boolean;

        /**
         * Content grouping definition
         * Feature available in Google Analytics 4
         * More information https://support.google.com/analytics/answer/11523339?hl=en
         * Data can be grouped by pluginId, routeRef
         * Takes 24 hours before metrics shows up in GA dashboard
         * Specifies the dimension to be used for content grouping
         * Can be one of pluginId, extension or routeRef
         * @visibility frontend
         *
         */
        contentGrouping?: 'pluginId' | 'extension' | 'routeRef';

        /**
         * Configuration informing how Analytics Context and Event Attributes
         * metadata will be captured in Google Analytics.
         * Contexts that will be sent as parameters in the event.
         * context-name will be prefixed by c_, for example, pluginId will be c_pluginId in the event.
         * @visibility frontend
         */
        allowedContexts?: string[] | ['*'];
        /**
         *
         * Attributes that will be sent as parameters in the event
         * attribute-name will be prefixed by a_, for example , testAttribute will be c_testAttribute in the event.
         * @visibility frontend
         */
        allowedAttributes?: string[] | ['*'];
      };
    };
  };
}
