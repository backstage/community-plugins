import React , { useEffect }from 'react';
import { SearchInput } from '@patternfly/react-core';
import { Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';

export const InputFieldComponent: React.FunctionComponent = ({ setUserText }) => {
  const inputFieldValue = "";
  /* eslint @typescript-eslint/no-shadow: ["error", { "allow": ["inputFieldValue"] }]*/

  const onChange = (inputFieldValue: string) => {
    setUserText(inputFieldValue);
  };

  const modifyPFStyle = () => {
    const style = document.createElement('style');
    style.id = 'filter-input-override';
    style.innerHTML = `
    [class*="pf-v5-c-text-input-group__text-input"] {
        line-height: 24px !important
    }
  `;
    // Append the style element to the document head
    document.head.appendChild(style);
  };

  const removeCustomStyles = () => {
    const style = document.getElementById('filter-input-override');
    if (style) {
      style.remove();
    }
  };

  useEffect(() => {
    modifyPFStyle()
    return () => {
      removeCustomStyles();
    };
  }, [])

  return (
    <SearchInput
      placeholder="Search"
      value={inputFieldValue}
      onChange={(_event, inputFieldValue) => onChange(inputFieldValue)}
      onClear={() => onChange('')}
    />
  );
};
