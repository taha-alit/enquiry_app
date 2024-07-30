import React from 'react';
import './items.scss'
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Paging,
    FilterRow,
    Toolbar,
    Item,
    Button as GridButton
} from 'devextreme-react/data-grid';
import { deleteById, get, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import DataSource from 'devextreme/data/data_source';
import { Button } from 'devextreme-react/button';
import Form, { GroupItem, ColCountByScreen, SimpleItem } from 'devextreme-react/form';
import { getSizeQualifier } from '../../utils/media-query'
import 'devextreme-react/text-area';
import { FormPopup } from '../../components/utils/form-popup';
import { DeletePopup } from '../../components/utils/delete-popup';
import { FormTextbox } from '../../components/utils/form-textbox';
import { TextBox } from 'devextreme-react/text-box';
import { exportDataGrid } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridXSLX } from 'devextreme/excel_exporter';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const phonePattern = /^[6-9]\d{9}$/;

const Items = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formItemInitData, setFormItemInitData] = React.useState({ ...newItemDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);

    const dataSource = React.useMemo(() => new DataSource({
        key: 'ItemID',
        async load() {
            try {
                const response = await makeRequest('Item/GetList', get);
                return response;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }), []);

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormItemInitData({ ...newItemDefaults });
        setPopupVisible(isVisible);
    }, []);

    const changeDeletePopupVisibility = React.useCallback((isVisible) => {
        setDeleteKey(null);
        setDeletePopupVisible(isVisible);
    }, []);

    const refresh = () => {
        gridRef.current.instance().refresh();
    }

    const showColumnChooser = () => {
        gridRef.current?.instance().showColumnChooser();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        exportDataGrid({
            jsPDFDocument: doc,
            component: gridRef.current?.instance(),
        }).then(() => {
            doc.save('Items.pdf');
        });
    };

    const exportToXSLX = () => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Main sheet');

        exportDataGridXSLX({
            component: gridRef.current?.instance(),
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
            });
        });
    };

    const search = (e) => {
        gridRef.current?.instance().searchByText(e.component.option('text') ?? '');
    };

    const onAddItemClick = React.useCallback(() => {
        setFormItemInitData({ ...newItemDefaults });
        setPopupVisible(true);
    });

    const onEditItemClick = (evt) => {
        setFormItemInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteItemClick = (evt) => {
        setDeleteKey(evt.row.data.ItemID);
        setDeletePopupVisible(true);
    }

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Item/Delete/${deleteKey}`, deleteById);
            notify(response, 'success', 2000);
            refresh();
            setDeleteKey(null);
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    }

    return (
        <React.Fragment>

            <DataGrid
                className={'dx-card wide-card'}
                dataSource={dataSource}
                ref={gridRef}
                showBorders
                defaultFocusedRowIndex={0}
                columnAutoWidth
                columnHidingEnabled
                allowColumnReordering
                allowColumnResizing
            >
                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector={true} showInfo={true} />
                <FilterRow visible={true} />
                <Column
                    dataField={'ItemID'}
                    width={190}
                    caption={'Item No'}
                    hidingPriority={2}
                    allowEditing={false}
                    alignment='left'
                />
                <Column
                    dataField={'ItemName'}
                    caption={'Item Name'}
                    hidingPriority={8}
                    allowEditing={false}
                />
                <Column
                    caption={''}
                    hidingPriority={8}
                    type='buttons'
                    width={'auto'}
                >
                    <GridButton
                        icon='edit'
                        onClick={onEditItemClick}
                    />
                    <GridButton
                        icon='trash'
                        onClick={onDeleteItemClick}
                    />
                </Column>
                <Toolbar>
                    <Item location='before'>
                        <span className='toolbar-header'>Items</span>
                    </Item>
                    <Item
                        location='after'
                        widget='dxButton'
                        locateInMenu='auto'
                    >
                        <Button
                            text='Add New'
                            icon='plus'
                            stylingMode='contained'
                            hint='Add New Item'
                            className='add_btn'
                            onClick={onAddItemClick}
                        />
                    </Item>
                    <Item
                        location='after'
                        widget='dxButton'
                        locateInMenu='auto'
                    >
                        <Button
                            text=''
                            icon='refresh'
                            stylingMode='text'
                            showText='inMenu'
                            onClick={refresh}
                        />
                    </Item>
                    <Item
                        location='after'
                        widget='dxButton'
                        showText='inMenu'
                        locateInMenu='auto'
                    >
                        <Button
                            icon='columnchooser'
                            text='Column Chooser'
                            stylingMode='text'
                            onClick={showColumnChooser}
                        />
                    </Item>
                    <Item location='after' locateInMenu='auto'>
                        <div className='separator' />
                    </Item>
                    <Item
                        location='after'
                        widget='dxButton'
                        showText='inMenu'
                        locateInMenu='auto'
                    >
                        <Button
                            icon='exportpdf'
                            text='Export To PDF'
                            stylingMode='text'
                            onClick={exportToPDF}
                        />
                    </Item>
                    <Item
                        location='after'
                        widget='dxButton'
                        showText='inMenu'
                        locateInMenu='auto'
                    >
                        <Button
                            icon='exportxlsx'
                            text='Export To XSLX'
                            stylingMode='text'
                            onClick={exportToXSLX}
                        />
                    </Item>
                    <Item
                        location='after'
                        widget='dxTextBox'
                        locateInMenu='auto'
                    >
                        <TextBox
                            mode='search'
                            placeholder='Search'
                            onInput={search}
                        />
                    </Item>
                </Toolbar>
            </DataGrid>

            {
                popupVisible && (
                    <CreateEditPopup
                        isOpen={popupVisible}
                        onClose={changePopupVisibility}
                        data={formItemInitData}
                        makeRequest={makeRequest}
                        refresh={refresh}
                    />
                )
            }

            <DeletePopup title={'Delete Item'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

export const CreateEditPopup = ({ isOpen, onClose, data, makeRequest, refresh, ...props }) => {
    const [formItemInitData, setFormItemInitData] = React.useState({ ...data });

    let newItemData = { ...newItemDefaults };

    React.useEffect(() => {
        setFormItemInitData({ ...data });
    }, [data]);

    const onDataChanged = React.useCallback((data) => {
        newItemData = data
    });

    const onSaveClick = async () => {
        try {
            let response;
            if (newItemData.ItemID != 0) {
                response = await makeRequest('Item/Update', put, newItemData);
            } else {
                response = await makeRequest('Item/Insert', post, newItemData);
            }
            notify({
                message: response,
                position: { at: 'bottom center', my: 'bottom center' }
            },
                'success'
            );
            setFormItemInitData({ ...newItemDefaults });
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    return (

        <FormPopup title={'New Item'} visible={isOpen} setVisible={onClose} onSave={onSaveClick} height='250'>
            <CreateEditForm
                onDataChanged={onDataChanged}
                editing
                data={formItemInitData}
                {...props}
            />
        </FormPopup>
    )

}

const CreateEditForm = ({ data, onDataChanged, editing }) => {

    const [formData, setFormData] = React.useState({ ...data });

    React.useEffect(() => {
        setFormData({ ...data });
    }, [data]);

    const updateField = (field) => (value) => {
        const newData = { ...formData, [field]: value };
        onDataChanged(newData);
        setFormData(newData);
    }

    return (
        <React.Fragment>
            <Form screenByWidth={getSizeQualifier}>
                <GroupItem>
                    <ColCountByScreen xs={1} />
                    <SimpleItem>
                        <FormTextbox
                            label='Item Name'
                            value={formData.ItemName}
                            isEditing={!editing}
                            onValueChange={updateField('ItemName')}
                        />
                    </SimpleItem>
                </GroupItem>
            </Form>
        </React.Fragment>
    );
}

const newItemDefaults = {
    ItemID: 0,
    ItemName: '',
}

export default Items;

