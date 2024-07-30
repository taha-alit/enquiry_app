import React from 'react';

import DateBox from 'devextreme-react/date-box';
import Validator, { RequiredRule } from 'devextreme-react/validator';

const dateTimeLabel = { 'aria-label': 'Date Time' };

export const FormDateBox = ({
  type,
  value,
  readOnly,
  name,
  label,
  onValueChange
}) => {

  return (
    <DateBox
      type={type}
      value={value}
      readOnly={readOnly}
      name={name}
      label={label}
      inputAttr={dateTimeLabel}
      stylingMode='outlined'
      onValueChange={onValueChange}
    >
      <Validator>
        <RequiredRule />
      </Validator>
    </DateBox>
  );
};
