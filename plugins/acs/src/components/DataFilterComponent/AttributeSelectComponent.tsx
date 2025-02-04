import React from 'react';
import {
    Select,
    SelectOption,
    SelectList,
    MenuToggle,
    MenuToggleElement,
} from '@patternfly/react-core';

export const AttributeSelectComponent = ({ options, displayAttributes, setSelectedAttribute }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  /* eslint @typescript-eslint/no-shadow: ["error", { "allow": ["isOpen"] }]*/
  const [selected, setSelected] = React.useState<string>(options[0]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setSelected(value as string);
    setSelectedAttribute(value as string)
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '250px'
        } as React.CSSProperties
      }
    >
      {selected}
    </MenuToggle>
  );

  return (
    <React.Fragment>
      <Select
        id="entity-select"
        isOpen={isOpen}
        selected={selected}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>

        {displayAttributes?.map((value) => (
          <SelectOption value={value}>{value}</SelectOption>
        ))}
        </SelectList>
      </Select>
    </React.Fragment>
  );
}

export default AttributeSelectComponent;
