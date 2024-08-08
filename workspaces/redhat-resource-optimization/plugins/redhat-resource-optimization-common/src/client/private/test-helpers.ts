export function makePlotsDataPropertyPathWithTerm(
  term: 'short' | 'medium' | 'long',
  dateString: string,
) {
  return [
    'recommendations',
    'recommendationTerms',
    `${term}Term`,
    'plots',
    'plotsData',
    dateString,
  ];
}
