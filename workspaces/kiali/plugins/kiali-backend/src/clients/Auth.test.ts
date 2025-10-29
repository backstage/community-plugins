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
import { KialiDetails } from '../service/config';
import {
  AuthStrategy,
  KialiAuthentication,
  MILLISECONDS,
  timeOutforWarningUser,
} from './Auth';

const sessionSeconds = 5000;

const rawCookie =
  'kiali-token-Kubernetes=/Wh8L+RdEocdRxrNH8TKOShJHD3daCA6KKVUk+jKvoinR28yXMI7/33DHMPqcoVL/bOYZ5ylmiyg95Cmmwr/LDuICgfUgnp763IHoOyMEmUI4yzvpKZfqDDtksjqWCRbkxoVT94JxBFsidtAg3pCgX8gDcXt22c65AX43hAa9auxpvF3tP22SP9aZjaJ4UOqvQ70TwhE2LT+/RLQszccnV7E9kUE7zTGaY1uAKz0bNWwXY7KQ6f/uOQob3kNZMqDtyURlEHPBNA1L/QbFIGqHcM8JbglQZWII+2iPmPMHAjNKcy2xrFNUOU5CjDex9i51KUuJ1GU6xnesChShpo+tuhchFFzklslr/2egXRaPFBBCg0F6f2E3wdIt7hdc3CfAfCQWVWka9Jp30FoOWlI+pNqa5vRFKqpuGQ+vDyzb/CdTVnotsoIraUmb3rYe7gOrHUh/DQQ+smVKYGtoq2FlJMx0k0Z29dZwyM7QKdIKoWtrgfa71y1ZpQ+9CXh/9Iu71cU+5cNq7CC+joGs2eWouBKHjgGNTeP3ZNOE63GOQ36uHcxbugbCzWheJLi5fvLfu2/VVf6a/KlV4NYRI6/uEERJwRwtwWlI4dFRQP+T9DNUuomS6uxLCm0w/5zSoNXwbyJ10iqDOQ3URDk8okgwHD/kG2c0RWvslmDztz9V6AqUWMUg95hz8BDagycir1w0th98irAFjwVd9q/jA3c6DzqB8fITqv2h0f51MMs4oe0H7b2yrpCGhHSVDC5OYEe1FgFPfRbxdG8Oa//IBlUdnoLJXh4Mz9q4gA/87kp/QukyepeV7JbaoNSvBtHplvjUl1Hs/2siKTvKySiSvW5fS0TF9PE3RNtInE/hwxkMBQj5rG8zlmR3AaMLSx5q5sjA1oBz4WLLaxprO1+J22G2+W7eiblqfb01yB3ItZfBBm78ZGFAkxZiPaLuZl0B0eEbLZS8xXKkQuIeR5gTnkqoB2haskIZsI4+rEpC6GYpYukfPBzeyR+NlJd8TFbPwjuu3yjS75rrbHL7WQtMm4C6vx7Qfj7LPWQXw60RdBV3Y0CuOOS1e2lLhNF+G2lh0jYOmUeZif8IeuvQyWtMkeTBZq2etiCoicupYrVf/urNEfGIqUld1GSgoRZonaFBhRj6//7KElU9dMVfPeKAcOZmBThnsVFkqDFF04sqPkMYkJA/o+ykxO0c4EDm/EBdmV+6LY/kdDsjEY/7XV+xx16eS5e635XWebRe2Qa0cukjY7vYZtJb7c0A0nKytzL+ptvq8ovEtrEMhNck1zOliba/epgLff4RPEqdHi+CVZvvtY01SVLVjycJVAaHLvZy7waRptRpcsAOWLu/RZ4LxBMrLW1lOk83tzFo+Sya2RGH2N6sKw0YbRQmB3qLEtRGWvIYGWMnImR+H9R7rgf/86pa6k4XvdSK0NpFOnsN5/m/jNYH8p6zQ0ZAr9eG8A3bJCEnRp+yyIzOa0L4rLEt6y74sFRK6ROHAZU8UeTz3DRC5tg+JBxlKY8MmF1jTMshcZMSYeFN5VrvJJe1VJdMuCIh68BwQsPrdaEDNTHgjQkNaKAahJrtGtY1koVZhgjsRMZjTpuDL8bBzS1APM3zsun/qvo5XrU2uQvZtFbHQBBIYNZn9h/Oyp6YPvaMRP/5xkEm8nuNGcAD5sFHzDbMVaJcdoqUuwAjvlt0BvGrzfoB+K7r1U+o6O/FS4HfcjuH1FEdPJGIXkIrc4vJ8vm18zlZWdoE/bvNhCGzBR2c9OB5FcXHXa/ie0vu4gCst1Ch+81q+2j/yy6+J7uTQbODP8kGsitGSlE8zmVahjpoUoSpI48A+8PsTFg/MkElM9wENRPHD/yPDnNMxpl7z0rAqKZpXJ8zB2ij+8SgawaydDHJCtOYaJASvM8ag==; Path=/; Expires=Tue, 23 Jan 2024 09:55:59 GMT; HttpOnly; Secure; SameSite=Strict';
const verifyCookie =
  'kiali-token-Kubernetes=/Wh8L+RdEocdRxrNH8TKOShJHD3daCA6KKVUk+jKvoinR28yXMI7/33DHMPqcoVL/bOYZ5ylmiyg95Cmmwr/LDuICgfUgnp763IHoOyMEmUI4yzvpKZfqDDtksjqWCRbkxoVT94JxBFsidtAg3pCgX8gDcXt22c65AX43hAa9auxpvF3tP22SP9aZjaJ4UOqvQ70TwhE2LT+/RLQszccnV7E9kUE7zTGaY1uAKz0bNWwXY7KQ6f/uOQob3kNZMqDtyURlEHPBNA1L/QbFIGqHcM8JbglQZWII+2iPmPMHAjNKcy2xrFNUOU5CjDex9i51KUuJ1GU6xnesChShpo+tuhchFFzklslr/2egXRaPFBBCg0F6f2E3wdIt7hdc3CfAfCQWVWka9Jp30FoOWlI+pNqa5vRFKqpuGQ+vDyzb/CdTVnotsoIraUmb3rYe7gOrHUh/DQQ+smVKYGtoq2FlJMx0k0Z29dZwyM7QKdIKoWtrgfa71y1ZpQ+9CXh/9Iu71cU+5cNq7CC+joGs2eWouBKHjgGNTeP3ZNOE63GOQ36uHcxbugbCzWheJLi5fvLfu2/VVf6a/KlV4NYRI6/uEERJwRwtwWlI4dFRQP+T9DNUuomS6uxLCm0w/5zSoNXwbyJ10iqDOQ3URDk8okgwHD/kG2c0RWvslmDztz9V6AqUWMUg95hz8BDagycir1w0th98irAFjwVd9q/jA3c6DzqB8fITqv2h0f51MMs4oe0H7b2yrpCGhHSVDC5OYEe1FgFPfRbxdG8Oa//IBlUdnoLJXh4Mz9q4gA/87kp/QukyepeV7JbaoNSvBtHplvjUl1Hs/2siKTvKySiSvW5fS0TF9PE3RNtInE/hwxkMBQj5rG8zlmR3AaMLSx5q5sjA1oBz4WLLaxprO1+J22G2+W7eiblqfb01yB3ItZfBBm78ZGFAkxZiPaLuZl0B0eEbLZS8xXKkQuIeR5gTnkqoB2haskIZsI4+rEpC6GYpYukfPBzeyR+NlJd8TFbPwjuu3yjS75rrbHL7WQtMm4C6vx7Qfj7LPWQXw60RdBV3Y0CuOOS1e2lLhNF+G2lh0jYOmUeZif8IeuvQyWtMkeTBZq2etiCoicupYrVf/urNEfGIqUld1GSgoRZonaFBhRj6//7KElU9dMVfPeKAcOZmBThnsVFkqDFF04sqPkMYkJA/o+ykxO0c4EDm/EBdmV+6LY/kdDsjEY/7XV+xx16eS5e635XWebRe2Qa0cukjY7vYZtJb7c0A0nKytzL+ptvq8ovEtrEMhNck1zOliba/epgLff4RPEqdHi+CVZvvtY01SVLVjycJVAaHLvZy7waRptRpcsAOWLu/RZ4LxBMrLW1lOk83tzFo+Sya2RGH2N6sKw0YbRQmB3qLEtRGWvIYGWMnImR+H9R7rgf/86pa6k4XvdSK0NpFOnsN5/m/jNYH8p6zQ0ZAr9eG8A3bJCEnRp+yyIzOa0L4rLEt6y74sFRK6ROHAZU8UeTz3DRC5tg+JBxlKY8MmF1jTMshcZMSYeFN5VrvJJe1VJdMuCIh68BwQsPrdaEDNTHgjQkNaKAahJrtGtY1koVZhgjsRMZjTpuDL8bBzS1APM3zsun/qvo5XrU2uQvZtFbHQBBIYNZn9h/Oyp6YPvaMRP/5xkEm8nuNGcAD5sFHzDbMVaJcdoqUuwAjvlt0BvGrzfoB+K7r1U+o6O/FS4HfcjuH1FEdPJGIXkIrc4vJ8vm18zlZWdoE/bvNhCGzBR2c9OB5FcXHXa/ie0vu4gCst1Ch+81q+2j/yy6+J7uTQbODP8kGsitGSlE8zmVahjpoUoSpI48A+8PsTFg/MkElM9wENRPHD/yPDnNMxpl7z0rAqKZpXJ8zB2ij+8SgawaydDHJCtOYaJASvM8ag==';

const kialiDetails = {
  name: 'default',
  url: 'https://localhost:4000',
  sessionTime: sessionSeconds,
  tokenName: 'kiali-token-Kubernetes',
} as KialiDetails;

describe('Let create Auth', () => {
  it('should return session anonymous by default, cookie empty and sessionSeconds to configuration after constructor', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    expect(AuthClient.getSession()).toStrictEqual({
      sessionInfo: { expiresOn: '', username: 'anonymous' },
    });
    expect(AuthClient.getCookie()).toStrictEqual('');
    expect(AuthClient.getSecondsSession()).toBe(sessionSeconds * MILLISECONDS);
  });
  it('should return default sessionSeconds if not sessionTime set', async () => {
    const AuthClient = new KialiAuthentication({
      name: 'default',
      url: 'https://localhost:4000',
    } as KialiDetails);
    expect(AuthClient.getSecondsSession()).toBe(timeOutforWarningUser);
  });

  it('Should set kialiCookie correctly', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    AuthClient.setKialiCookie(rawCookie, 'kiali-token-Kubernetes');
    expect(AuthClient.getCookie()).toBe(verifyCookie);
    AuthClient.setKialiCookie(rawCookie, 'kiali-token-aes');
    expect(AuthClient.getCookie()).toBe('');
    AuthClient.setKialiCookie('', 'kiali-token-Kubernetes');
    expect(AuthClient.getCookie()).toBe('');
  });

  it('Not should relogin when strateDate.now = jest.fn(() => new Date("2020-05-13T12:33:37.000Z"));gy is anonymous', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    AuthClient.setAuthInfo({
      sessionInfo: { expiresOn: '', username: 'anonymous' },
      strategy: AuthStrategy.anonymous,
    });
    expect(AuthClient.shouldRelogin()).toBeFalsy();
  });

  it('Should relogin if strategy is not anonymous and cookie is not set', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    AuthClient.setAuthInfo({
      sessionInfo: { expiresOn: '', username: 'anonymous' },
      strategy: AuthStrategy.token,
    });
    AuthClient.setKialiCookie('', kialiDetails.tokenName!);
    expect(AuthClient.shouldRelogin()).toBeTruthy();
  });

  it('Not should relogin if strategy is not anonymous and not expire', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    Date.now = jest.fn(() => new Date('2024-01-01T00:00:00.000Z').getTime());
    AuthClient.setAuthInfo({
      sessionInfo: {
        expiresOn: '2024-02-01T00:00:00.000Z',
        username: 'anonymous',
      },
      strategy: AuthStrategy.token,
    });
    AuthClient.setKialiCookie(rawCookie, kialiDetails.tokenName!);
    expect(AuthClient.shouldRelogin()).toBeFalsy();
  });

  it('Should relogin if strategy is not anonymous and cokkie was expire', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    Date.now = jest.fn(() => new Date('2024-03-01T00:00:00.000Z').getTime());
    AuthClient.setAuthInfo({
      sessionInfo: {
        expiresOn: '2024-02-01T00:00:00.000Z',
        username: 'anonymous',
      },
      strategy: AuthStrategy.token,
    });
    AuthClient.setKialiCookie(rawCookie, undefined);
    expect(AuthClient.shouldRelogin()).toBeTruthy();
  });

  it('Should extend session if session expired', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    Date.now = jest.fn(() => new Date('2024-02-01T10:00:00.000Z').getTime());
    AuthClient.setAuthInfo({
      sessionInfo: {
        expiresOn: '2024-02-01T08:00:00.000Z',
        username: 'anonymous',
      },
      strategy: AuthStrategy.token,
    });
    AuthClient.setKialiCookie(rawCookie);
    expect(AuthClient.shouldRelogin()).toBeTruthy();
  });

  it('Should extend session if timeLeft is lower than sessionSeconds', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    Date.now = jest.fn(() => new Date('2024-02-01T10:00:00.000Z').getTime());
    AuthClient.setAuthInfo({
      sessionInfo: {
        expiresOn: '2024-02-01T11:00:00.000Z',
        username: 'anonymous',
      },
      strategy: AuthStrategy.token,
    });
    AuthClient.setKialiCookie(rawCookie);
    expect(AuthClient.shouldRelogin()).toBeTruthy();
  });

  it('Should not extend session if timeLeft is greater than sessionSeconds', async () => {
    const AuthClient = new KialiAuthentication(kialiDetails);
    Date.now = jest.fn(() => new Date('2024-02-01T10:00:00.000Z').getTime());
    AuthClient.setAuthInfo({
      sessionInfo: {
        expiresOn: '2024-02-01T12:00:00.000Z',
        username: 'anonymous',
      },
      strategy: AuthStrategy.token,
    });
    AuthClient.setKialiCookie(rawCookie);
    expect(AuthClient.shouldRelogin()).toBeFalsy();
  });
});
