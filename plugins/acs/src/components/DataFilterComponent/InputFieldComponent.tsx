import React from 'react';
import { SearchInput } from '@patternfly/react-core';

export const InputFieldComponent: React.FunctionComponent = ({setOptionSearch}) => {
  const [value, setValue] = React.useState('');

  const onChange = (value: string) => {
    setOptionSearch(value);
  };

  return (
    <SearchInput
      placeholder="Find by name"
      value={value}
      onChange={(_event, value) => onChange(value)}
      onClear={() => onChange('')}
    />
  );
};
