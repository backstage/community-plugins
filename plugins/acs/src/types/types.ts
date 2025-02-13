import { SearchCategory } from 'services/SearchService';

// Compound search filter types

export type BaseInputType = 'autocomplete' | 'text' | 'date-picker' | 'condition-number';
export type InputType = BaseInputType | 'select';
export type SelectSearchFilterOptions = {
    options: { label: string; value: string }[];
};
export type SelectSearchFilterGroupedOptions = {
    groupOptions: { name: string; options: { label: string; value: string }[] }[];
};

type BaseSearchFilterAttribute = {
    displayName: string;
    filterChipLabel: string;
    searchTerm: string;
    inputType: BaseInputType;
};

export type SelectSearchFilterAttribute = {
    displayName: string;
    filterChipLabel: string;
    searchTerm: string;
    inputType: 'select';
    inputProps: SelectSearchFilterOptions | SelectSearchFilterGroupedOptions;
};

export type CompoundSearchFilterAttribute = BaseSearchFilterAttribute | SelectSearchFilterAttribute;

export type CompoundSearchFilterEntity = {
    displayName: string;
    searchCategory: SearchCategory;
    attributes: CompoundSearchFilterAttribute[];
};

export type CompoundSearchFilterConfig = CompoundSearchFilterEntity[];

// Misc

export type OnSearchCallback = (payload: OnSearchPayload) => void;

export type OnSearchPayload = {
    action: 'ADD' | 'REMOVE';
    category: string;
    value: string;
};

import { AggregateFunc } from './table';

/*
 * Examples of search filter object properties parsed from search query string:
 * 'Lifecycle Stage': 'BUILD' from 's[Lifecycle Stage]=BUILD
 * 'Lifecycle Stage': ['BUILD', 'DEPLOY'] from 's[Lifecycle Stage]=BUILD&s[Lifecycle State]=DEPLOY'
 */
export type SearchFilter = Partial<Record<string, string | string[]>>;

/*
 * For array values of SearchInput props: searchModifiers and searchOptions.
 *
 * A categoryOption entry whose value and label properties end with a colon
 * corresponds to an option string without a colon.
 * For example 'Lifecycle Stage:' corresponds to 'Lifecycle Stage'
 */
export type SearchEntry = {
    type?: 'categoryOption';
    value: string; // an option ends with a colon
    label: string; // an option ends with a colon
};

export type ApiSortOptionSingle = {
    field: string;
    aggregateBy?: {
        aggregateFunc: AggregateFunc;
        distinct?: boolean;
    };
    reversed: boolean;
};

export type ApiSortOption = ApiSortOptionSingle | ApiSortOptionSingle[];

export type GraphQLSortOption = {
    id: string;
    desc: boolean;
};

export type SearchQueryOptions = {
    searchFilter?: SearchFilter;
    sortOption?: ApiSortOption;
    page: number;
    perPage: number;
};

