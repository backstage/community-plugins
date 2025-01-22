import React from 'react';
import { SearchInput } from '@patternfly/react-core';

export const InputFieldComponent: React.FunctionComponent = ({ setUserText }) => {
  const value = "";

  const onChange = (value: string) => {
    setUserText(value);
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
