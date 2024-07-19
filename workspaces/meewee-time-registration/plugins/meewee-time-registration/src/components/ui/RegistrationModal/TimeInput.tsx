import { useEffect, useState } from 'react';
import { transformHoursMinsStringToMins } from './utils';
import React from 'react';
import InputMask from 'react-input-mask';
import { TextField } from '@material-ui/core';

const TimeInput = ({ cbSetMinutesValue }: any) => {
  const [hoursAndMinsString, setHoursAndMinsString] = useState('');

  const handleChange = (e: any) => {
    const inputValue = e?.target?.value;

    setHoursAndMinsString(inputValue);
  };

  const handleBlur = () => {
    const newValue = hoursAndMinsString.replace(/_/g, '0');
    setHoursAndMinsString(newValue);
  };

  useEffect(() => {
    const minutes = transformHoursMinsStringToMins(hoursAndMinsString);
    cbSetMinutesValue(minutes);
  }, [hoursAndMinsString]);

  return (
    <>
      <InputMask
        mask="99h 99m"
        placeholder="00h 00m"
        value={hoursAndMinsString || ''}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        <TextField
          type="text"
          variant="outlined"
          placeholder="00h 00m"
          style={{ width: '100%' }}
        />
      </InputMask>
    </>
  );
};

export default TimeInput;
