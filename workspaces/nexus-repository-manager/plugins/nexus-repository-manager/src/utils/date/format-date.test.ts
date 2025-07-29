import { formatDate } from './format-date';

describe('formatDate', () => {
  it('should return N/A if date is not defined', () => {
    expect(formatDate(undefined)).toEqual('N/A');
  });

  it('formatDate should return formatted date', () => {
    const formatDateVal = formatDate('2023-06-30T05:03:17.8253401Z');
    expect(formatDateVal).toEqual('Jun 30, 2023, 5:03 AM');
  });

  it('formatDate should return formatted date for date', () => {
    const formatDateVal = formatDate(new Date('2023-06-30T05:03:17.8253401Z'));
    expect(formatDateVal).toEqual('Jun 30, 2023, 5:03 AM');
  });

  it('formatDate should return N/A for invalid date', () => {
    const formatDateVal = formatDate(-1);
    expect(formatDateVal).toEqual('N/A');
  });

  it('should correctly format a date when its a number', () => {
    const date = formatDate(1678890069).normalize('NFKC');

    expect(date).toBe('Mar 15, 2023, 2:21 PM');
  });

  it('formatDate should return N/A for empty string', () => {
    const formatDateVal = formatDate('');
    expect(formatDateVal).toEqual('N/A');
  });
});
