import React from 'react';

import DateBox from 'devextreme-react/date-box';
import Validator, { RequiredRule } from 'devextreme-react/validator';

const dateTimeLabel = { 'aria-label': 'Date Time' };
const minDate = new Date(1901, 0, 1);

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
      labelMode='floating'
      inputAttr={dateTimeLabel}
      stylingMode='outlined'
      onValueChange={onValueChange}
      useMaskBehavior
      min={minDate}
      dateOutOfRangeMessage="Invalid Date"
    >
      <Validator>
        <RequiredRule />
      </Validator>
    </DateBox>
  );
};
