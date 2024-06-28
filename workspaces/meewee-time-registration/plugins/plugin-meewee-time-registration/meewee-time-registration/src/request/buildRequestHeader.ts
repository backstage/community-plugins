// TESTO
//import { RootState } from '../../../../../packages/app/src/store';

import { RequestHeader } from '../types/request/requestHeader';

export default function buildRequestHeader(
  authToken?: string,
  contentParamType?: 'application/json' | 'application/transit+json',
  applyMinutesHeader = false,
): RequestHeader {
  const contentType = contentParamType || 'application/json';
  return {
    Accept: '*/*',
    'Content-Type': contentType,
    'X-Auth-Token': authToken,
    'x-registration-unit': applyMinutesHeader ? 'minutes' : undefined,
  };
}
