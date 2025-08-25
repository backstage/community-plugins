import { Select, SelectedItems, SelectItem } from '@backstage/core-components';

type ProjectFilterComponentProps = {
  projectList: { name: string }[] | null | undefined;
  projectNameFilter: string[];
  setProjectNameFilter: (filter: string[]) => void;
  projectNameOptions: SelectItem[];
  ALL_OPTION: { label: string; value: string };
};

export const ProjectFilterComponent: React.FC<ProjectFilterComponentProps> = ({
  projectList,
  projectNameFilter,
  setProjectNameFilter,
  projectNameOptions,
  ALL_OPTION,
}) => {
  if (!projectList || projectNameOptions.length <= 2) {
    return null;
  }

  const handleProjectNameChange = (selected: SelectedItems) => {
    // SelectedItems can be string or string[]
    const selectedArray = Array.isArray(selected) ? selected : [selected];
    const stringArray = selectedArray.filter(
      (v): v is string => typeof v === 'string',
    );

    // If nothing is selected, set to ALL
    if (stringArray.length === 0) {
      setProjectNameFilter([ALL_OPTION.value]);
      return;
    }

    // If ALL is newly selected (was not in previous selection), set only ALL
    if (
      stringArray.includes(ALL_OPTION.value) &&
      !projectNameFilter.includes(ALL_OPTION.value)
    ) {
      setProjectNameFilter([ALL_OPTION.value]);
      return;
    }

    // If ALL is selected and there are other values, remove ALL and keep the others
    if (stringArray.includes(ALL_OPTION.value) && stringArray.length > 1) {
      setProjectNameFilter(stringArray.filter(v => v !== ALL_OPTION.value));
      return;
    }

    // Otherwise, set selected values
    setProjectNameFilter(stringArray);
  };

  return (
    <Select
      label="Filter by Project Name"
      multiple
      selected={projectNameFilter}
      onChange={handleProjectNameChange}
      items={projectNameOptions}
      margin="none"
    />
  );
};
