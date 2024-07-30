import React from 'react';
import './appointments.scss'
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
import { newDoctorDefaults, CreateEditForm as DoctorCreateEditForm } from '../doctors';

const phonePattern = /^[6-9]\d{9}$/;

const Appointments = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [doctors, setDoctors] = React.useState([]);
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [specialities, setSpecialities] = React.useState([]);
    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formAppointmentInitData, setFormAppointmentInitData] = React.useState({ ...newAppointmentDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);

    let newAppointmentData = { ...newAppointmentDefaults };

    const dataSource = React.useMemo(() => new DataSource({
        key: 'AppointmentID',
        async load() {
            try {
                const response = await makeRequest('Patient/GetList', get);
                return response;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }), [])

    React.useEffect(() => {
        (async function () {
            try {
                resetError();
                const doctorsData = await makeRequest('Doctor/GetList', get, {});
                setDoctors(doctorsData);
            } catch (err) {
                console.log(err.message);
                notify(err.message, 'error', 2000);
            }
        }())
    }, []);

    React.useEffect(() => {
        (async function () {
            try {
                resetError();
                const statesData = await makeRequest('State/GetList', get, {});
                setStates(statesData);
            } catch (err) {
                console.log(err.message);
                notify(err.message, 'error', 2000);
            }
        }())
    }, []);

    React.useEffect(() => {
        (async function () {
            try {
                resetError();
                const citiesData = await makeRequest('City/GetList', get, {});
                setCities(citiesData);
            } catch (err) {
                console.log(err.message);
                notify(err.message, 'error', 2000);
            }
        }())
    }, []);

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
        setFormAppointmentInitData({ ...newAppointmentDefaults });
        setPopupVisible(isVisible);
    }, []);

    const changeDeletePopupVisibility = React.useCallback((isVisible) => {
        setDeleteKey(null);
        setDeletePopupVisible(isVisible);
    }, []);

    const onDataChanged = React.useCallback((data) => {
        newAppointmentData = data
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
            doc.save('Appointments.pdf');
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

    const onAddAppointmentClick = React.useCallback(() => {
        setFormAppointmentInitData({ ...newAppointmentDefaults });
        setPopupVisible(true);
    });

    const onEditAppointmentClick = (evt) => {
        setFormAppointmentInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteAppointmentClick = (evt) => {
        setDeleteKey(evt.row.data.AppointmentID);
        setDeletePopupVisible(true);
    }

    const onSaveClick = async () => {
        newAppointmentData.FullName = `${newAppointmentData.FirstName} ${newAppointmentData.LastName || ''}`;
        try {
            let response;
            if (newAppointmentData.AppointmentID != 0) {
                response = await makeRequest('Patient/Update', put, newAppointmentData);
            } else {
                response = await makeRequest('Patient/Insert', post, newAppointmentData);
            }
            notify({
                message: response,
                position: { at: 'bottom center', my: 'bottom center' }
            },
                'success'
            );
            setFormAppointmentInitData({ ...newAppointmentDefaults });
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Patient/Delete/${deleteKey}`, deleteById);
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
                    dataField={'AppointmentID'}
                    caption={'App No'}
                    hidingPriority={2}
                    allowEditing={false}
                    alignment='left'
                />
                <Column
                    dataField={'AppointmentDateTime'}
                    caption={'Appt Date & Time'}
                    dataType={'datetime'}
                    hidingPriority={3}
                />
                <Column
                    dataField={'FullName'}
                    width={190}
                    caption={'Patient Name'}
                    hidingPriority={8}
                    allowEditing={false}
                />
                <Column
                    dataField={'DOB'}
                    caption={'DOB'}
                    dataType={'date'}
                    hidingPriority={4}
                />
                <Column
                    dataField={'Gender'}
                    caption={'Gender'}
                    hidingPriority={5}
                >
                    <Lookup
                        dataSource={GENDER}
                        valueExpr={'value'}
                        displayExpr={'name'}
                    />
                </Column>
                <Column
                    dataField={'MobileNo'}
                    caption={'Mobile'}
                    hidingPriority={6}
                />
                <Column
                    dataField={'Address'}
                    caption={'Address'}
                    hidingPriority={6}
                />
                <Column
                    dataField={'ReasonForAppointment'}
                    caption={'Reason For Appointment'}
                    hidingPriority={0}
                />
                <Column
                    caption={''}
                    hidingPriority={8}
                    type='buttons'
                    width={'auto'}
                >
                    <GridButton
                        icon='edit'
                        onClick={onEditAppointmentClick}
                    />
                    <GridButton
                        icon='trash'
                        onClick={onDeleteAppointmentClick}
                    />
                </Column>
                <Toolbar>
                    <Item location='before'>
                        <span className='toolbar-header'>Appointments</span>
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
                            hint='Add New Appointment'
                            className='add_btn'
                            onClick={onAddAppointmentClick}
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

            <FormPopup title={'New Appointment'} visible={popupVisible} setVisible={changePopupVisibility} onSave={onSaveClick}>
                <CreateEditForm
                    onDataChanged={onDataChanged}
                    editing
                    data={formAppointmentInitData}
                    states={states}
                    cities={cities}
                    specialities={specialities}
                    doctors={doctors}
                    makeRequest={makeRequest}
                />
            </FormPopup>

            <DeletePopup title={'Delete Appointment'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

const CreateEditForm = ({ data, onDataChanged, editing, states, cities, specialities, doctors, makeRequest }) => {

    const selectBoxRef = React.useRef();
    const [formData, setFormData] = React.useState({ ...data });

    const [doctorPopVisible, setDoctorPopVisible] = React.useState(false);
    const [formDoctorInitData, setFormDoctorInitData] = React.useState({ ...newDoctorDefaults });
    let newDoctorData = { ...newDoctorDefaults };

    const addDoctorButtonOption = React.useMemo(() => ({
        icon: 'plus',
        stylingMode: 'text',
        onClick: () => {
            setDoctorPopVisible(true);
        }
    }), []);

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

    const changeDoctorPopupVisibility = React.useCallback((isVisible) => {
        setFormDoctorInitData({ ...newDoctorDefaults });
        setDoctorPopVisible(isVisible);
    }, []);

    const onDoctorDataChanged = React.useCallback((data) => {
        newDoctorData = data
    });

    const onDoctorSaveClick = async () => {
        try {
            let response = await makeRequest('Doctor/Insert', post, newDoctorData);;
            notify({
                message: response,
                position: { at: 'bottom center', my: 'bottom center' }
            },
                'success'
            );
            setFormDoctorInitData({ ...newDoctorDefaults });
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    return (
        <React.Fragment>
            <Form screenByWidth={getSizeQualifier}>
                <GroupItem>
                    <ColCountByScreen xs={1} sm={1} md={2} lg={2} />
                    <SimpleItem>
                        <FormDateBox
                            type={'datetime'}
                            value={formData.AppointmentDateTime ? new Date(formData.AppointmentDateTime) : null}
                            readOnly={!editing}
                            name='AppointmentDateTime'
                            label='Appointment Date Time'
                            onValueChange={updateField('AppointmentDateTime')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormTextbox
                            label='First Name'
                            value={formData.FirstName}
                            isEditing={!editing}
                            onValueChange={updateField('FirstName')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormTextbox
                            label='Last Name'
                            value={formData.LastName}
                            isEditing={!editing}
                            onValueChange={updateField('LastName')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormDateBox
                            type={'date'}
                            value={formData.DOB ? new Date(formData.DOB) : null}
                            readOnly={!editing}
                            name='DOB'
                            label='DOB'
                            onValueChange={updateField('DOB')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <SelectBox
                            label='Gender'
                            value={formData.Gender}
                            dataSource={GENDER}
                            displayExpr={'name'}
                            valueExpr={'value'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('Gender')}
                        >
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </SelectBox>
                    </SimpleItem>
                    <SimpleItem>
                        <FormTextbox
                            value={formData.MobileNo}
                            isEditing={!editing}
                            onValueChange={updateField('MobileNo')}
                            icon='tel'
                            label='Mobile'
                            mask='+1(000)000-0000'
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <SelectBox
                            label='MaritalStatus'
                            value={formData.MaritalStatus}
                            dataSource={MARTIAL_STATUS}
                            displayExpr={'name'}
                            valueExpr={'value'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('MaritalStatus')}
                        >
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </SelectBox>
                    </SimpleItem>
                    <SimpleItem></SimpleItem>
                    <SimpleItem colSpan={2}>
                        <TextArea
                            label='Address'
                            readOnly={!editing}
                            value={formData.Address}
                            stylingMode='outlined'
                            onValueChange={updateField('Address')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <SelectBox
                            label='State'
                            value={formData.StateID}
                            dataSource={states}
                            displayExpr={'StateName'}
                            valueExpr={'StateID'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('StateID')}
                        >
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </SelectBox>
                    </SimpleItem>
                    <SimpleItem>
                        <SelectBox
                            label='City'
                            value={formData.CityID}
                            dataSource={cities}
                            displayExpr={'CityName'}
                            valueExpr={'CityID'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('CityID')}
                        >
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </SelectBox>
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
                    <SimpleItem>
                        <SelectBox
                            ref={selectBoxRef}
                            label='Doctor'
                            value={formData.DoctorID}
                            dataSource={doctors}
                            displayExpr={'DoctorName'}
                            valueExpr={'DoctorID'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('DoctorID')}
                        >
                            <SelectButton
                                name='add_doctor'
                                location='after'
                                options={addDoctorButtonOption}
                            />
                            <SelectButton
                                name='open_dropdown'
                                location='after'
                                options={selectboxdropbuttonOption}
                            />
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </SelectBox>
                    </SimpleItem>
                    <SimpleItem colSpan={2}>
                        <TextArea
                            label='Reason For Appointment'
                            readOnly={!editing}
                            value={formData.ReasonForAppointment}
                            stylingMode='outlined'
                            onValueChange={updateField('ReasonForAppointment')}
                        />
                    </SimpleItem>
                </GroupItem>
            </Form>

            <FormPopup title={'New Doctor'} visible={doctorPopVisible} setVisible={changeDoctorPopupVisibility} onSave={onDoctorSaveClick} height='340'>
                <DoctorCreateEditForm
                    onDataChanged={onDoctorDataChanged}
                    editing
                    data={formDoctorInitData}
                    specialities={specialities}
                />
            </FormPopup>
        </React.Fragment>
    );
}

const newAppointmentDefaults = {
    AppointmentID: 0,
    AppointmentDateTime: '',
    FirstName: '',
    LastName: '',
    FullName: '',
    DOB: '',
    Gender: 0,
    MobileNo: '',
    MaritalStatus: 0,
    Address: '',
    StateID: null,
    CityID: null,
    ReasonForAppointment: '',
    SpecialityID: null,
    DoctorID: null
}

const GENDER = [
    { name: 'Male', value: 0 },
    { name: 'Female', value: 1 },
    { name: 'Transgender', value: 2 },
    { name: 'DoNotDisclose', value: 3 }
];

const MARTIAL_STATUS = [
    { name: 'Single', value: 0 },
    { name: 'Married', value: 1 },
    { name: 'Widowed', value: 2 },
    { name: 'Divorced', value: 3 },
    { name: 'Separated', value: 4 }
];

export default Appointments;

