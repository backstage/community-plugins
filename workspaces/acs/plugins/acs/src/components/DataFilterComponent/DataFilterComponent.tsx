/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useState } from 'react';
import { EntitySelectComponent } from './EntitySelectComponent';
import { AttributeSelectComponent } from './AttributeSelectComponent';
import { InputFieldComponent } from './InputFieldComponent';
import { CheckboxSelectComponent } from './CheckboxSelectComponent';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles((theme: any) =>
  createStyles({
    dropDowns: {
      minWidth: 150,
      maxWidth: 300,
      marginBottom: 20,
    },
    dropDownsMulti: {
      marginLeft: theme.spacing(5),
      minWidth: 150,
      maxWidth: 300,
    },
    textBox: {
      minWidth: 350,
      maxWidth: 400,
    },
  }),
);

interface DataFilterProps {
  setFilters: (value: any) => void;
}

export const DataFilterComponent = ({ setFilters }: DataFilterProps) => {
  const classes = useStyles();
  const entities = {
    Image: ['Name'],
    CVE: ['Name', 'Discovered time', 'CVSS'],
    'Image Component': ['Name'],
    Deployment: ['Name'],
    Namespace: ['Name'],
    Cluster: ['Name'],
  };

  const cveSeverityOptions = ['Critical', 'Important', 'Moderate', 'Low'];
  const cveStatusOptions = ['Fixable', 'Not fixable'];

  const [selectedEntity, setSelectedEntity] = useState('Image');
  const [selectedAttribute, setSelectedAttribute] = useState('Name');

  const [userText, setUserText] = useState('');
  const [selectedCveSeverityOptions, setSelectedCveSeverityOptions] = useState(
    [],
  );
  const [selectedCveStatusOptions, setSelectedCveStatusOptions] = useState([]);

  const getAttributes = () => {
    return entities[selectedEntity as keyof typeof entities];
  };

  useEffect(() => {
    setFilters({
      selectedEntity: selectedEntity,
      selectedAttribute: selectedAttribute,
      userText: userText,
      selectedCveSeverityOptions: selectedCveSeverityOptions,
      selectedCveStatusOptions: selectedCveStatusOptions,
    });
    // eslint-disable-next-line
  }, [
    selectedEntity,
    selectedAttribute,
    userText,
    selectedCveSeverityOptions,
    selectedCveStatusOptions,
  ]);

  return (
    <div>
      <FormControl className={classes.dropDowns}>
        <EntitySelectComponent
          options={entities}
          setSelectedEntity={setSelectedEntity}
        />
      </FormControl>
      <FormControl className={classes.dropDowns}>
        <AttributeSelectComponent
          options={getAttributes()}
          setSelectedAttribute={setSelectedAttribute}
        />
      </FormControl>
      <FormControl className={classes.textBox}>
        <InputFieldComponent setUserText={setUserText} />
      </FormControl>
      <FormControl className={classes.dropDownsMulti}>
        <CheckboxSelectComponent
          options={cveSeverityOptions}
          dropdownName="CVE severity"
          setSelectedOptions={setSelectedCveSeverityOptions}
        />
      </FormControl>
      <FormControl className={classes.dropDownsMulti}>
        <CheckboxSelectComponent
          options={cveStatusOptions}
          dropdownName="CVE status"
          setSelectedOptions={setSelectedCveStatusOptions}
        />
      </FormControl>
    </div>
  );
};

export default DataFilterComponent;
