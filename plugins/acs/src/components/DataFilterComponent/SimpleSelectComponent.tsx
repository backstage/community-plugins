import React from 'react';
import {
    Select,
    SelectOption,
    SelectList,
    MenuToggle,
    MenuToggleElement,
} from '@patternfly/react-core';

export const SimpleSelect = ({ options, setSelectedOptions }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(options[0]);

  console.log(options)

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setSelected(value as string);
    setSelectedOptions(value as string)
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '375px'
        } as React.CSSProperties
      }
    >
      {selected}
    </MenuToggle>
  );

  return (
    <React.Fragment>
      <Select
        id="single-select"
        isOpen={isOpen}
        selected={selected}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>

        {options.map((value: string) => (
          <SelectOption value={value}>{value}</SelectOption>
        ))}
        </SelectList>
      </Select>
    </React.Fragment>
  );
}

export default SimpleSelect;
