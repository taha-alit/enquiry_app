import React from 'react';
import './specialities.scss'
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
import { CheckBox } from 'devextreme-react/check-box';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Specialities = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formSpecialityInitData, setFormSpecialityInitData] = React.useState({ ...newSpecialityDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);

    let newSpecialityData = { ...newSpecialityDefaults };

    const dataSource = React.useMemo(() => new DataSource({
        key: 'SpecialityID',
        async load() {
            try {
                const response = await makeRequest('Speciality/GetList', get);
                return response;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }), []);

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormSpecialityInitData({ ...newSpecialityDefaults });
        setPopupVisible(isVisible);
    }, []);

    const changeDeletePopupVisibility = React.useCallback((isVisible) => {
        setDeleteKey(null);
        setDeletePopupVisible(isVisible);
    }, []);

    const onDataChanged = React.useCallback((data) => {
        newSpecialityData = data
    });

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
            doc.save('Specialitys.pdf');
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

    const onAddSpecialityClick = React.useCallback(() => {
        setFormSpecialityInitData({ ...newSpecialityDefaults });
        setPopupVisible(true);
    });

    const onEditSpecialityClick = (evt) => {
        setFormSpecialityInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteSpecialityClick = (evt) => {
        setDeleteKey(evt.row.data.SpecialityID);
        setDeletePopupVisible(true);
    }

    const onSaveClick = async () => {
        try {
            let response;
            if (newSpecialityData.SpecialityID != 0) {
                response = await makeRequest('Speciality/Update', put, newSpecialityData);
            } else {
                response = await makeRequest('Speciality/Insert', post, newSpecialityData);
            }
            notify({
                message: response,
                position: { at: 'bottom center', my: 'bottom center' }
            },
                'success'
            );
            setFormSpecialityInitData({ ...newSpecialityDefaults });
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Speciality/Delete/${deleteKey}`, deleteById);
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
                    dataField={'SpecialityID'}
                    caption={'Spec No'}
                    width={190}
                    hidingPriority={2}
                    allowEditing={false}
                    alignment='left'
                />
                <Column
                    dataField={'SpecialityName'}
                    caption={'Speciality Name'}
                    width={500}
                    hidingPriority={8}
                />
                <Column
                    dataField={'Description'}
                    caption={'Description'}
                    hidingPriority={8}
                />
                <Column
                    dataField={'IsGynac'}
                    caption={'Is Gynac'}
                    hidingPriority={8}
                />
                <Column
                    caption={''}
                    hidingPriority={8}
                    type='buttons'
                    width={'auto'}
                >
                    <GridButton
                        icon='edit'
                        onClick={onEditSpecialityClick}
                    />
                    <GridButton
                        icon='trash'
                        onClick={onDeleteSpecialityClick}
                    />
                </Column>
                <Toolbar>
                    <Item location='before'>
                        <span className='toolbar-header'>Specialities</span>
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
                            hint='Add New Speciality'
                            className='add_btn'
                            onClick={onAddSpecialityClick}
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

            <FormPopup title={'New Speciality'} visible={popupVisible} setVisible={changePopupVisibility} onSave={onSaveClick} height='300'>
                <CreateEditForm
                    onDataChanged={onDataChanged}
                    editing
                    data={formSpecialityInitData}
                />
            </FormPopup>

            <DeletePopup title={'Delete Speciality'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

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
                    <ColCountByScreen xs={1} sm={1} md={2} lg={2} />
                    <SimpleItem>
                        <FormTextbox
                            label='Speciality Name'
                            value={formData.SpecialityName}
                            isEditing={!editing}
                            onValueChange={updateField('SpecialityName')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormTextbox
                            label='Description'
                            value={formData.Description}
                            isEditing={!editing}
                            onValueChange={updateField('Description')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <CheckBox
                            text='Gynac'
                            hint='Is Gynac'
                            iconSize="25"
                            value={formData.IsGynac}
                            isEditing={!editing}
                            onValueChange={updateField('IsGynac')}
                        />
                    </SimpleItem>

                </GroupItem>
            </Form>
        </React.Fragment>
    );
}

const newSpecialityDefaults = {
    SpecialityID: 0,
    SpecialityName: '',
    isGynac: false,
    Description: ''
}

export default Specialities;
