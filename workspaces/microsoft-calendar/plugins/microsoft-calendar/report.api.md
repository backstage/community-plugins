## API Report File for "@backstage-community/plugin-microsoft-calendar"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { ApiRef } from '@backstage/core-plugin-api';
import { Calendar } from '@microsoft/microsoft-graph-types';
import { Event as Event_2 } from '@microsoft/microsoft-graph-types';
import { FetchApi } from '@backstage/core-plugin-api';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { OAuthApi } from '@backstage/core-plugin-api';

// @public (undocumented)
export class MicrosoftCalendarApiClient {
  constructor(options: { authApi: OAuthApi; fetchApi: FetchApi });
  // (undocumented)
  getCalendars(): Promise<Calendar[]>;
  // (undocumented)
  getEvents(
    calendarId: string,
    params: {
      startDateTime: string;
      endDateTime: string;
    },
    headers: {
      [key in string]: any;
    },
  ): Promise<Event_2[]>;
}

// @public (undocumented)
export const microsoftCalendarApiRef: ApiRef<MicrosoftCalendarApiClient>;

// @public (undocumented)
export const MicrosoftCalendarCard: () => JSX_2.Element;

// (No @packageDocumentation comment for this package)
```
