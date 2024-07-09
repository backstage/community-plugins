import React from 'react';

import { Select, SelectedItems } from '@backstage/core-components';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const RootDiv = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
  '& label + div': {
    marginTop: '0px',
  },
});

const SelectDiv = styled('div')({
  width: '10rem',
});

const StyledLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: theme.typography.fontSize,
  paddingRight: '0.5rem',
  fontWeight: 'bold',
}));

const ALL_ITEMS = '___all___';

type BackstageSelectProps = Parameters<typeof Select>[0];
export type SelectorProps = Omit<BackstageSelectProps, 'onChange'> & {
  includeAll?: boolean;
  onChange: (item: string) => void;
};

export const Selector = ({
  includeAll = true,
  ...otherProps
}: SelectorProps) => {
  const selectItems = React.useMemo(
    () =>
      includeAll
        ? [{ label: 'All', value: ALL_ITEMS }, ...otherProps.items]
        : otherProps.items,
    [includeAll, otherProps.items],
  );

  const handleChange = React.useCallback(
    (item: SelectedItems) => otherProps.onChange(item as string),
    [otherProps],
  );

  return (
    <RootDiv>
      <StyledLabel>{otherProps.label}</StyledLabel>
      <SelectDiv>
        <Select
          onChange={handleChange}
          items={selectItems}
          selected={otherProps.selected}
          margin="dense"
          label={otherProps.label}
        />
      </SelectDiv>
    </RootDiv>
  );
};
Selector.displayName = 'Selector';
Selector.AllItems = ALL_ITEMS;
