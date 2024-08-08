import { getTimeFromNow } from './dates';

describe('getTimeFromNow', () => {
  const mockDate = (isoDate: string) => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(dateString?: string) {
        super();
        if (dateString) {
          return new RealDate(dateString);
        }
        return new RealDate(isoDate);
      }
    } as typeof Date;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns N/A', () => {
    expect(getTimeFromNow(undefined)).toBe('N/A');
  });

  it('returns correct relative time for weeks', () => {
    mockDate('2024-06-25T00:00:00Z');
    expect(getTimeFromNow('2024-06-17T00:00:00Z')).toBe('1 week ago');
  });

  it('returns correct relative time for days', () => {
    mockDate('2023-01-03T00:00:00Z');
    expect(getTimeFromNow('2023-01-01T00:00:00Z')).toBe('2 days ago');
  });

  it('returns correct relative time for minutes', () => {
    mockDate('2023-01-01T00:10:00Z');
    expect(getTimeFromNow('2023-01-01T00:05:00Z')).toBe('5 minutes ago');
  });

  it('returns correct relative time for seconds', () => {
    mockDate('2023-01-01T00:00:10Z');
    expect(getTimeFromNow('2023-01-01T00:00:00Z')).toBe('10 seconds ago');
  });
});
