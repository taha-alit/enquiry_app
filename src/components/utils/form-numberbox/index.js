import React from 'react';

import NumberBox, { Button as NumberBoxButton } from 'devextreme-react/number-box';
import Validator from 'devextreme-react/validator';
import './FormNumberbox.scss';

export const FormNumberbox = ({ value, label, isEditing, onValueChange, icon, format, children }) => {
  return (
    <NumberBox
      label={label}
      value={value}
      readOnly={isEditing}
      elementAttr={{ class: 'form-editor' }}
      inputAttr={{ class: 'form-editor-input' }}
      stylingMode='outlined'
      onValueChange={onValueChange}
      format={format || ''}
    >
      { icon &&
      <NumberBoxButton
        name='icon'
        location='before'
        options={{
          icon: icon,
          stylingMode: 'text',
          elementAttr: { class: 'form-editor-icon' }
        }} />
      }
      <Validator>
        {children}
      </Validator>
    </NumberBox>
  );
};
