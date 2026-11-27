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
import jwt, { JwtPayload } from 'jsonwebtoken';

export const isTokenExpired = (token: string) => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded) {
      console.error('Failed to decode the token.');
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiry = decoded.exp ?? 0;
    return expiry < currentTime;
  } catch (error) {
    console.error('Error decoding token: ', error);
    return true;
  }
};
