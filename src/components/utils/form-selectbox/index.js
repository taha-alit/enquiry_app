import React from 'react';

import SelectBox from 'devextreme-react/select-box';
import './FormSelectbox.scss';

export const FormSelectbox = ({ value, label, isEditing, dataSource, displayExpr, valueExpr, onValueChange, mask = '', icon, children }) => {
    return (
        <SelectBox
            label={label}
            value={value}
            dataSource={dataSource}
            displayExpr={displayExpr}
            valueExpr={valueExpr}
            readOnly={isEditing}
            stylingMode='outlined'
            onValueChange={onValueChange}
        >
            {children}
        </SelectBox>
    );
};
