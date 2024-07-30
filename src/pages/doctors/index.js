import React from 'react';
import './doctors.scss'
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Paging,
    FilterRow,
    Lookup,
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
import { FormDateBox } from '../../components/utils/form-datebox'
import { FormPopup } from '../../components/utils/form-popup';
import { DeletePopup } from '../../components/utils/delete-popup';
import { FormTextbox } from '../../components/utils/form-textbox';
import SelectBox, { Button as SelectButton } from 'devextreme-react/select-box';
import TextArea from 'devextreme-react/text-area';
import { TextBox } from 'devextreme-react/text-box';
import { exportDataGrid } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridXSLX } from 'devextreme/excel_exporter';
import Validator, { RequiredRule } from 'devextreme-react/validator';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Doctors = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [specialities, setSpecialities] = React.useState([]);
    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formDoctorInitData, setFormDoctorInitData] = React.useState({ ...newDoctorDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);

    let newDoctorData = { ...newDoctorDefaults };

    const dataSource = React.useMemo(() => new DataSource({
        key: 'DoctorID',
        async load() {
            try {
                const response = await makeRequest('Doctor/GetList', get);
                return response;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }), []);

    React.useEffect(() => {
        (async function () {
            try {
                resetError();
                const specialitiesData = await makeRequest('Speciality/GetList', get, {});
                setSpecialities(specialitiesData);
            } catch (err) {
                console.log(err.message);
                notify(err.message, 'error', 2000);
            }
        }())
    }, []);

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormDoctorInitData({ ...newDoctorDefaults });
        setPopupVisible(isVisible);
    }, []);

    const changeDeletePopupVisibility = React.useCallback((isVisible) => {
        setDeleteKey(null);
        setDeletePopupVisible(isVisible);
    }, []);

    const onDataChanged = React.useCallback((data) => {
        newDoctorData = data
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
            doc.save('Doctors.pdf');
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

    const onAddDoctorClick = React.useCallback(() => {
        setFormDoctorInitData({ ...newDoctorDefaults });
        setPopupVisible(true);
    });

    const onEditDoctorClick = (evt) => {
        setFormDoctorInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteDoctorClick = (evt) => {
        setDeleteKey(evt.row.data.DoctorID);
        setDeletePopupVisible(true);
    }

    const onSaveClick = async () => {
        try {
            let response;
            if (newDoctorData.DoctorID != 0) {
                response = await makeRequest('Doctor/Update', put, newDoctorData);
            } else {
                response = await makeRequest('Doctor/Insert', post, newDoctorData);
            }
            notify({
                message: response,
                position: { at: 'bottom center', my: 'bottom center' }
            },
                'success'
            );
            setFormDoctorInitData({ ...newDoctorDefaults });
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Doctor/Delete/${deleteKey}`, deleteById);
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
                    dataField={'DoctorID'}
                    width={190}
                    caption={'Doc No'}
                    hidingPriority={2}
                    allowEditing={false}
                    alignment='left'
                />
                <Column
                    dataField={'DoctorName'}
                    caption={'Doctor Name'}
                    hidingPriority={8}
                    allowEditing={false}
                />
                <Column
                    dataField={'SpecialityID'}
                    caption={'Speciality'}
                    hidingPriority={5}
                >
                    <Lookup
                        dataSource={specialities}
                        valueExpr={'SpecialityID'}
                        displayExpr={'SpecialityName'}
                    />
                </Column>
                <Column
                    dataField={'Education'}
                    caption={'Education'}
                    hidingPriority={6}
                />
                <Column
                    caption={''}
                    hidingPriority={8}
                    type='buttons'
                    width={'auto'}
                >
                    <GridButton
                        icon='edit'
                        onClick={onEditDoctorClick}
                    />
                    <GridButton
                        icon='trash'
                        onClick={onDeleteDoctorClick}
                    />
                </Column>
                <Toolbar>
                    <Item location='before'>
                        <span className='toolbar-header'>Doctors</span>
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
                            hint='Add New Doctor'
                            className='add_btn'
                            onClick={onAddDoctorClick}
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

            <FormPopup title={'New Doctor'} visible={popupVisible} setVisible={changePopupVisibility} onSave={onSaveClick} height='340'>
                <CreateEditForm
                    onDataChanged={onDataChanged}
                    editing
                    data={formDoctorInitData}
                    specialities={specialities}
                />
            </FormPopup>

            <DeletePopup title={'Delete Doctor'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

export const CreateEditForm = ({ data, onDataChanged, editing, specialities }) => {

    const selectBoxRef = React.useRef();
    const [formData, setFormData] = React.useState({ ...data });

    const selectboxdropbuttonOption = React.useMemo(() => ({
        icon: "spindown",
        stylingMode: "text",
        onClick: (e) => {
            var selectBoxInstance = selectBoxRef.current?.instance();
            var isOpened = selectBoxInstance.option("opened");
            if (isOpened) {
                selectBoxInstance.close();
            } else {
                selectBoxInstance.open();
                selectBoxInstance.focus();
            }
        },
    }), []);

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
                            label='Doctor Name'
                            value={formData.DoctorName}
                            isEditing={!editing}
                            onValueChange={updateField('DoctorName')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormTextbox
                            label='Education'
                            value={formData.Education}
                            isEditing={!editing}
                            onValueChange={updateField('Education')}
                        />
                    </SimpleItem>
                    
                    <SimpleItem>
                        <SelectBox
                            label='Speciality'
                            value={formData.SpecialityID}
                            dataSource={specialities}
                            displayExpr={'SpecialityName'}
                            valueExpr={'SpecialityID'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('SpecialityID')}
                        >
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </SelectBox>
                    </SimpleItem>
                </GroupItem>
            </Form>
        </React.Fragment>
    );
}

export const newDoctorDefaults = {
    DoctorID: 0,
    DoctorName: '',
    Education: '',
    SpecialityID: null
}

export default Doctors;

