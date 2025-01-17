import React, { useEffect } from 'react';
import { Select, SelectOption, SelectList, MenuToggle, MenuToggleElement, Badge } from '@patternfly/react-core';

export const CheckboxSelectComponent: React.FunctionComponent = ({ setValueOptions, options, dropdownName }) => {
    console.log("options: ", options)
    console.log("dropdownName: ", dropdownName)
    console.log("setValueOptions: ", setValueOptions)

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    // eslint-disable-next-line no-console
    console.log('selected', value);

    if (selectedItems.includes(value as number)) {
      setSelectedItems(selectedItems.filter((id) => id !== value));
    } else {
      setSelectedItems([...selectedItems, value as number]);
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '200px'
        } as React.CSSProperties
      }
    >
    {options.dropdownName}
      {selectedItems.length > 0 && <Badge isRead>{selectedItems.length}</Badge>}
    </MenuToggle>
  );

  useEffect(() => {
    setValueOptions(selectedItems); 
  }, [selectedItems]);

  return (
    <Select
      role="menu"
      id="checkbox-select"
      isOpen={isOpen}
      selected={selectedItems}
      onSelect={onSelect}
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      toggle={toggle}
    >
      <SelectList>
        {options.map((value, index) => (
          <SelectOption hasCheckbox value={value} isSelected={selectedItems.includes(value)}>
            {value}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

