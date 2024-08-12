import React from 'react';
import './appointments.scss'
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Lookup,
    Toolbar,
    Item,
    Button as GridButton,
    HeaderFilter,
    Search,
    ColumnChooserSearch,
    ColumnChooser,
    FilterBuilderPopup,
    FilterPanel,
    Scrolling,
    StateStoring
} from 'devextreme-react/data-grid';
import { deleteById, get, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import Form, { GroupItem, ColCountByScreen, SimpleItem } from 'devextreme-react/form';
import 'devextreme-react/text-area';
import { FormDateBox } from '../../components/utils/form-datebox'
import { FormPopup } from '../../components/utils/form-popup';
import { DeletePopup } from '../../components/utils/delete-popup';
import { FormTextbox } from '../../components/utils/form-textbox';
import { Button as SelectButton } from 'devextreme-react/select-box';
import TextArea from 'devextreme-react/text-area';
import { TextBox } from 'devextreme-react/text-box';
import Validator, { RequiredRule } from 'devextreme-react/validator';

import { newDoctorDefaults, CreateEditPopup as DoctorCreateEditPopup } from '../doctors';
import { newSpecialityDefaults, CreateEditPopup as SpecialityCreateEditPopup } from '../specialities';
import { FormSelectbox } from '../../components/utils/form-selectbox';
import Header from '../../components/header/Header';
import { HideDatagridLoader } from '../../utils/common-methods';

const Appointments = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [appointments, setAppointments] = React.useState([]);
    const [doctors, setDoctors] = React.useState([]);
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [specialities, setSpecialities] = React.useState([]);
    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formAppointmentInitData, setFormAppointmentInitData] = React.useState({ ...newAppointmentDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);
    const [focusedRowKey, setFocusedRowKey] = React.useState(null);

    // const dataSource = React.useMemo(() => new DataSource({
    //     key: 'AppointmentID',
    //     async load() {
    //         try {
    //             const response = await makeRequest('Patient/GetList', get);
    //             if (response.length) {
    //                 setFocusedRowKey(response[0].AppointmentID)
    //             }
    //             return response;
    //         } catch (error) {
    //             notify(error.message, 'error', 2000);
    //         }
    //     }
    // }), [])

    React.useEffect(() => {
        fetchAppointments();
        fetchDoctors();
        fetchSpeciality();
        fetchStates();
        fetchCities();
    }, []);

    const fetchAppointments = async () => {
        try {
            resetError();
            const appointmentsData = await makeRequest('Patient/GetList', get, {});
            setAppointments(appointmentsData);
            if(appointmentsData.length > 0) {
                setFocusedRowKey(appointmentsData[0].AppointmentID);
            }
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }
    const fetchDoctors = async () => {
        try {
            resetError();
            const doctorsData = await makeRequest('Doctor/GetList', get, {});
            setDoctors(doctorsData);
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }
    const fetchStates = async () => {
        try {
            resetError();
            const statesData = await makeRequest('State/GetList', get, {});
            setStates(statesData);
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }
    const fetchCities = async () => {
        try {
            resetError();
            const citiesData = await makeRequest('City/GetList', get, {});
            setCities(citiesData);
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }
    const fetchSpeciality = async () => {
        try {
            resetError();
            const specialitiesData = await makeRequest('Speciality/GetList', get, {});
            setSpecialities(specialitiesData);
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormAppointmentInitData({ ...newAppointmentDefaults });
        setPopupVisible(isVisible);
    }, []);

    const changeDeletePopupVisibility = React.useCallback((isVisible) => {
        setDeleteKey(null);
        setDeletePopupVisible(isVisible);
    }, []);

    const onFocusedRowChanged = (e) => {
        setFocusedRowKey(e.component.option('focusedRowKey'));
    }

    const search = (e) => {
        gridRef.current?.instance.searchByText(e.component.option('text') ?? '');
    };

    const onEditClick = (evt) => {
        setFormAppointmentInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteClick = (evt) => {
        setDeleteKey(evt.row.data.AppointmentID);
        setDeletePopupVisible(true);
    }

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Patient/Delete/${deleteKey}`, deleteById);
            notify(response, 'success', 2000);
            fetchAppointments();
            setDeleteKey(null);
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    }

    const handleAdd = () => {
        setPopupVisible(true);
    }

    return (
        <React.Fragment>
            <Header
                title={"Appointments"}
                handleAdd={handleAdd}
                dataGridRef={gridRef}
                GetRecord={fetchAppointments}
            />
            <div className='list-section'>
                <DataGrid
                    className={'List_DataGrid'}
                    dataSource={appointments}
                    ref={gridRef}
                    showBorders={true}
                    showColumnLines={false}
                    showRowLines={true}
                    focusedRowEnabled={true}
                    wordWrapEnabled={true}
                    hoverStateEnabled={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    autoNavigateToFocusedRow={true}
                    focusedRowKey={focusedRowKey}
                    onFocusedRowChanged={onFocusedRowChanged}
                    keyExpr="AppointmentID"
                    height={'100%'}
                    width={"100%"}
                    filterSyncEnabled={true}
                    // onOptionChanged={onOptionChange}
                    loadPanel={HideDatagridLoader}
                    // onRowDblClick={onRowDblClick}
                    noDataText='No Record Found'
                >
                    <FilterBuilderPopup width={'25%'} height={'40%'} title='Apply FIlter' />
                    <FilterPanel visible filterEnabled />
                    <Scrolling mode='infinite' rowRenderingMode='virtual' preloadEnabled={true} useNative={true} />
                    <ColumnChooser enabled={true}>
                        <ColumnChooserSearch
                            enabled={true}
                        />
                    </ColumnChooser>
                    <StateStoring enabled={true} type='localStorage' storageKey='Appointment_Layout' />
                    {/* <Paging defaultPageSize={10} /> */}
                    <Pager
                        visible
                        // allowedPageSizes={allowedPageSizes}
                        showInfo
                        // showPageSizeSelector
                        // showNavigationButtons
                        infoText={`{2} Rows`}
                    // displayMode='full'
                    />
                    {/* <FilterRow visible /> */}
                    <Column
                        dataField={'AppointmentID'}
                        caption={'App No'}
                        allowEditing={false}
                        alignment='left'
                    />
                    <Column
                        dataField={'AppointmentDateTime'}
                        caption={'Appt Date & Time'}
                        dataType={'datetime'}
                        format={"EEEE, d of MMM, yyyy HH:mm"}
                        alignment='left'
                    />
                    <Column
                        dataField={'FullName'}
                        width={190}
                        caption={'Patient Name'}
                        allowEditing={false}
                        alignment='left'
                    />
                    <Column
                        dataField={'DOB'}
                        caption={'DOB'}
                        dataType={'date'}
                        alignment='left'
                    />
                    <Column
                        dataField={'Gender'}
                        caption={'Gender'}
                        alignment='left'
                    >
                        <Lookup
                            dataSource={GENDER}
                            valueExpr={'value'}
                            displayExpr={'name'}
                        />
                    </Column>
                    <Column
                        dataField={'MobileNo'}
                        caption={'Mobile No.'}
                        alignment='left'
                    />
                    <Column
                        dataField={'Address'}
                        caption={'Address'}
                        alignment='left'
                    />
                    <Column
                        dataField={'ReasonForAppointment'}
                        caption={'Reason For Appointment'}
                        alignment='left'
                    />
                    <Column
                        caption={''}
                        type='buttons'
                        width={'auto'}
                        alignment='right'
                        fixed
                    >
                        <GridButton
                            name='edit'
                            icon='edit'
                            hint='Edit'
                            visible={true}
                            onClick={onEditClick}
                            cssClass='text-muted'
                        />
                        <GridButton
                            name='delete'
                            icon='trash'
                            hint='Delete'
                            visible={true}
                            onClick={onDeleteClick}
                            cssClass='text-danger'
                        />
                    </Column>
                    <HeaderFilter visible={true}>
                        <Search enabled={true} />
                    </HeaderFilter>
                    <Toolbar>
                        <Item location={'after'} name="columnChooserButton" />
                        <Item
                            location='after'
                            widget='dxTextBox'
                            locateInMenu='auto'
                        >
                            <TextBox
                                mode='search'
                                placeholder='Search'
                                onInput={search}
                                width={500}
                            />
                        </Item>
                    </Toolbar>
                </DataGrid>
            </div>
            {
                popupVisible && (
                    <CreateEditPopup
                        isOpen={popupVisible}
                        onClose={changePopupVisibility}
                        data={formAppointmentInitData}
                        makeRequest={makeRequest}
                        refresh={fetchAppointments}
                        states={states}
                        cities={cities}
                        specialities={specialities}
                        doctors={doctors}
                        refreshDoctors={fetchDoctors}
                        refreshSpeciality={fetchSpeciality}
                    />
                )
            }

            <DeletePopup title={'Delete Appointment'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

export const CreateEditPopup = ({ isOpen, onClose, data, refresh, makeRequest, ...props }) => {

    let newAppointmentData = { ...data };

    const onDataChanged = React.useCallback((data) => {
        newAppointmentData = data
    });

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
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    return (

        <FormPopup title={'New Appointment'} visible={isOpen} setVisible={onClose} onSave={onSaveClick}>
            <CreateEditForm
                onDataChanged={onDataChanged}
                editing
                data={data}
                makeRequest={makeRequest}
                {...props}
            />
        </FormPopup>
    )

}

const CreateEditForm = ({ data, onDataChanged, editing, states, cities, specialities, doctors, makeRequest, refreshDoctors, refreshSpeciality }) => {

    const doctorSelectBoxRef = React.useRef();
    const specialitySelectBoxRef = React.useRef();
    const [formData, setFormData] = React.useState({ ...data });

    const [doctorPopupVisible, setDoctorPopupVisible] = React.useState(false);
    const [specialityPopupVisible, setSpecialityPopupVisible] = React.useState(false);

    const specialityDidMountRef = React.useRef(false);
    const doctorDidMountRef = React.useRef(false);

    React.useEffect(() => {
        if (doctors) {
            if (doctorDidMountRef.current) {
                updateField('DoctorID')(doctors[doctors.length - 1].DoctorID)
            } else {
                doctorDidMountRef.current = true;
            }
        }
    }, [doctors]);

    React.useEffect(() => {
        if (specialities) {
            if (specialityDidMountRef.current) {
                updateField('SpecialityID')(specialities[specialities.length - 1].SpecialityID)
            } else {
                specialityDidMountRef.current = true;
            }
        }
    }, [specialities]);


    const addDoctorButtonOption = React.useMemo(() => ({
        icon: 'plus',
        stylingMode: 'text',
        onClick: () => {
            setDoctorPopupVisible(true);
        }
    }), []);

    const addSpecialityButtonOption = React.useMemo(() => ({
        icon: 'plus',
        stylingMode: 'text',
        onClick: () => {
            setSpecialityPopupVisible(true);
        }
    }), []);

    const doctorsSelectboxdropbuttonOption = React.useMemo(() => ({
        icon: "spindown",
        stylingMode: "text",
        onClick: (e) => {
            var selectBoxInstance = doctorSelectBoxRef.current?.instance;
            var isOpened = selectBoxInstance.option("opened");
            if (isOpened) {
                selectBoxInstance.close();
            } else {
                selectBoxInstance.open();
                selectBoxInstance.focus();
            }
        },
    }), []);

    const specialitySelectboxdropbuttonOption = React.useMemo(() => ({
        icon: "spindown",
        stylingMode: "text",
        onClick: (e) => {
            var selectBoxInstance = specialitySelectBoxRef.current?.instance;
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
        setDoctorPopupVisible(isVisible);
    }, []);

    const changeSpecilaityPopupVisibility = React.useCallback((isVisible) => {
        setSpecialityPopupVisible(isVisible);
    }, []);

    return (
        <React.Fragment>
            <Form>
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
                        <FormSelectbox
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
                        </FormSelectbox>
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
                        <FormSelectbox
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
                        </FormSelectbox>
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
                        <FormSelectbox
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
                        </FormSelectbox>
                    </SimpleItem>
                    <SimpleItem>
                        <FormSelectbox
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
                        </FormSelectbox>
                    </SimpleItem>
                    <SimpleItem>
                        <FormSelectbox
                            ref={specialitySelectBoxRef}
                            label='Speciality'
                            value={formData.SpecialityID}
                            dataSource={specialities}
                            displayExpr={'SpecialityName'}
                            valueExpr={'SpecialityID'}
                            readOnly={!editing}
                            stylingMode='outlined'
                            onValueChange={updateField('SpecialityID')}
                        >
                            <SelectButton
                                name='add_speciality'
                                location='after'
                                options={addSpecialityButtonOption}
                            />
                            <SelectButton
                                name='open_dropdown'
                                location='after'
                                options={specialitySelectboxdropbuttonOption}
                            />
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </FormSelectbox>
                    </SimpleItem>
                    <SimpleItem>
                        <FormSelectbox
                            ref={doctorSelectBoxRef}
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
                                options={doctorsSelectboxdropbuttonOption}
                            />
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        </FormSelectbox>
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

            {
                doctorPopupVisible && (
                    <DoctorCreateEditPopup
                        isOpen={doctorPopupVisible}
                        onClose={changeDoctorPopupVisibility}
                        data={newDoctorDefaults}
                        specialities={specialities}
                        makeRequest={makeRequest}
                        refresh={refreshDoctors}
                    />
                )
            }
            {
                specialityPopupVisible && (
                    <SpecialityCreateEditPopup
                        isOpen={specialityPopupVisible}
                        onClose={changeSpecilaityPopupVisibility}
                        data={newSpecialityDefaults}
                        makeRequest={makeRequest}
                        refresh={refreshSpeciality}
                    />
                )
            }
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

