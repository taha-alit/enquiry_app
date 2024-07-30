import './DeletePopup.scss';
import React, { useRef } from 'react';

import { Popup, ToolbarItem } from 'devextreme-react/popup';
import { ValidationGroup } from 'devextreme-react/validation-group';
import { useScreenSize } from '../../../utils/media-query';
import { Button } from 'devextreme-react';

export const DeletePopup = ({
    title,
    visible,
    width = 'auto',
    height = 'auto',
    onDelete,
    setVisible,
    wrapperAttr = { class: '' },
    isDeleteDisabled = false,
    children
}) => {
    const { isXSmall } = useScreenSize();

    const close = () => {
        setVisible(false);
    };

    const onCancelClick = () => {
        close();
    };

    const onDeleteClick = () => {
        onDelete && onDelete();
        close();
    };

    return (
        <Popup
            title={title}
            visible={visible}
            fullScreen={isXSmall}
            width={width}
            wrapperAttr={{ ...wrapperAttr, class: `${wrapperAttr?.class} delete-popup` }}
            height={height}
        >
            <ToolbarItem
                toolbar='bottom'
                location='center'
            >
                <div className={`delete-popup-buttons-container ${width <= 360 ? 'flex-buttons' : ''}`}>
                    <Button
                        text='Cancel'
                        stylingMode='outlined'
                        type='normal'
                        onClick={onCancelClick}
                    />
                    <Button
                        text='Delete'
                        stylingMode='contained'
                        type='default'
                        disabled={isDeleteDisabled}
                        onClick={onDeleteClick}
                    />
                </div>
            </ToolbarItem>

            {children}
        </Popup>
    );
};
