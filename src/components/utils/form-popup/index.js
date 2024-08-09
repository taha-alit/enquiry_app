import './FormPopup.scss';
import React, { useRef } from 'react';

import { Popup, ToolbarItem } from 'devextreme-react/popup';
import { ValidationGroup } from 'devextreme-react/validation-group';
import { useScreenSize } from '../../../utils/media-query';
import { Button } from 'devextreme-react';

export const FormPopup = ({
  title,
  visible,
  width = 'auto',
  height = '700',
  onSave,
  setVisible,
  wrapperAttr = { class: '' },
  isSaveDisabled = false,
  children
}) => {
  const { isXSmall } = useScreenSize();
  const validationGroup = useRef(null);

  const close = () => {
    validationGroup.current?.instance().reset();
    setVisible(false);
  };

  const onCancelClick = () => {
    close();
  };

  const onSaveClick = () => {
    if (!validationGroup.current?.instance().validate().isValid) return;

    onSave && onSave();
    close();
  };

  return (
    <Popup
      title={title}
      visible={visible}
      fullScreen={isXSmall}
      width={width}
      wrapperAttr={{ ...wrapperAttr, class: `${wrapperAttr?.class} form-popup` }}
      height={height}
      position={'center'}
    >
      <ToolbarItem
        toolbar='bottom'
        location='center'
      >
        <div className={`form-popup-buttons-container ${width <= 360 ? 'flex-buttons' : ''}`}>
          <Button
            text='Cancel'
            stylingMode='outlined'
            type='normal'
            onClick={onCancelClick}
          />
          <Button
            text='Save'
            stylingMode='contained'
            type='default'
            disabled={isSaveDisabled}
            onClick={onSaveClick}
          />
        </div>
      </ToolbarItem>

      <ValidationGroup ref={validationGroup}>
        {children}
      </ValidationGroup>
    </Popup>
  );
};
