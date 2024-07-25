import React from 'react';
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Paging,
    FilterRow,
    Lookup,
    ColumnChooser,
    SearchPanel,
    Editing,
    Export,
    Toolbar,
    Item,
    RequiredRule,
    ValidationRule,
    Popup,
    Form
} from 'devextreme-react/data-grid';
import { deleteById, get, getById, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import DataSource from 'devextreme/data/data_source';

const phonePattern = /^[6-9]\d{9}$/;

const Appointments = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const dataGridRef = React.useRef();

    const [doctors, setDoctors] = React.useState([]);
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [specialities, setSpecialities] = React.useState([]);
    const [popupTitle, setPopupTitle] = React.useState('Create');

    const [dataSource, setDataSource] = React.useState(new DataSource({
        key: 'AppointmentID',
        async load() {
            try {
                const patientData = await makeRequest('Patient/GetList', get);
                return patientData;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async insert(values) {
            values.FullName = `${values.FirstName} ${values.LastName || ''}`;
            try {
                const response = await makeRequest('Patient/Insert', post, values);
                notify(response, 'success', 2000);
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async update(key, values) {
            try {
                const patientDetail = await makeRequest(`Patient/GetById/${key}`, getById);
                if (patientDetail) {
                    values = { ...patientDetail, ...values };
                    const response = await makeRequest('Patient/Update', put, values);
                    notify(response, 'success', 2000);
                }
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async remove(key) {
            try {
                const response = await makeRequest(`Patient/Delete/${key}`, deleteById);
                notify(response, 'success', 2000);
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }));

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

    const onExporting = (e) => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Main sheet');
        exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
            });
        });
    };
    
    return (
        <React.Fragment>
            <h2 className={'content-block'}>Appointments</h2>

            <DataGrid
                className={'dx-card wide-card'}
                dataSource={dataSource}
                ref={dataGridRef}
                showBorders
                defaultFocusedRowIndex={0}
                columnAutoWidth
                columnHidingEnabled
                allowColumnReordering
                allowColumnResizing
                onExporting={onExporting}
                onEditingStart={() => setPopupTitle('Edit')}
                onInitNewRow={() => setPopupTitle('Create')}
            >
                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector={true} showInfo={true} />
                <FilterRow visible={true} />
                <SearchPanel visible={true} width={250} />
                <Editing
                    mode="popup"
                    allowUpdating={true}
                    allowDeleting={true}
                    allowAdding={true}
                >
                    <Popup title={`${popupTitle} Patient`} showTitle width={'50%'} height={'auto'} />
                    <Form>
                        <Item dataField='AppointmentDateTime' />
                        <Item dataField='FirstName' />
                        <Item dataField='LastName' />
                        <Item dataField='DOB' />
                        <Item dataField='Gender' />
                        <Item dataField='MobileNo' />
                        <Item dataField='MaritalStatus' />
                        <Item dataField='Address' />
                        <Item dataField='StateID' />
                        <Item dataField='CityID' />
                        <Item dataField='ReasonForAppointment' />
                        <Item dataField='DoctorID' />
                        <Item dataField='SpecialityID' />
                    </Form>
                </Editing>
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
                >
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'FirstName'}
                    width={190}
                    caption={'Patient First Name'}
                    hidingPriority={8}
                    visible={false}
                >
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'LastName'}
                    width={190}
                    caption={'Patient Last Name'}
                    hidingPriority={8}
                    visible={false}
                />
                <Column
                    dataField={'FullName'}
                    width={190}
                    caption={'Patient Name'}
                    hidingPriority={8}
                    allowEditing={false}
                >
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'DOB'}
                    caption={'DOB'}
                    dataType={'date'}
                    hidingPriority={4}
                >
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'Gender'}
                    caption={'Gender'}
                    hidingPriority={5}
                >
                    <Lookup
                        dataSource={gender}
                        valueExpr={'value'}
                        displayExpr={'name'}
                    />
                </Column>
                <Column
                    dataField={'MobileNo'}
                    caption={'Mobile'}
                    hidingPriority={6}
                >
                    <ValidationRule
                        message='The phone must have a correct Indian phone formating'
                        type='pattern'
                        pattern={phonePattern}
                    />
                </Column>
                <Column
                    dataField={'MaritalStatus'}
                    caption={'Marital Status'}
                    hidingPriority={5}
                    visible={false}
                >
                    <Lookup
                        dataSource={maritialStatus}
                        valueExpr={'value'}
                        displayExpr={'name'}
                    />
                </Column>
                <Column
                    dataField={'Address'}
                    caption={'Address'}
                    hidingPriority={6}
                />
                <Column
                    dataField={'StateID'}
                    caption={'State'}
                    hidingPriority={5}
                    visible={false}
                >
                    <Lookup
                        dataSource={states}
                        valueExpr={'StateID'}
                        displayExpr={'StateName'}
                    />
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'CityID'}
                    caption={'City'}
                    hidingPriority={5}
                    visible={false}
                >
                    <Lookup
                        dataSource={cities}
                        valueExpr={'CityID'}
                        displayExpr={'CityName'}
                    />
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'ReasonForAppointment'}
                    caption={'Reason For Appointment'}
                    hidingPriority={0}
                />
                <Column
                    dataField={'DoctorID'}
                    caption={'Doctor'}
                    hidingPriority={5}
                    visible={false}
                >
                    <Lookup
                        dataSource={doctors}
                        valueExpr={'DoctorID'}
                        displayExpr={'DoctorName'}
                    />
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'SpecialityID'}
                    caption={'Speciality'}
                    hidingPriority={5}
                    visible={false}
                >
                    <Lookup
                        dataSource={specialities}
                        valueExpr={'SpecialityID'}
                        displayExpr={'SpecialityName'}
                    />
                    <RequiredRule />
                </Column>

                <ColumnChooser enabled />

                <Export enabled allowExportSelectedData />
                <Toolbar>
                    <Item name="addRowButton" showText="always" />
                    <Item name="exportButton" />
                    <Item name="columnChooserButton" />
                    <Item name="searchPanel" />
                </Toolbar>
            </DataGrid>
        </React.Fragment>
    );

}

const gender = [
    { name: 'Male', value: 0 },
    { name: 'Female', value: 1 },
    { name: 'Transgender', value: 2 },
    { name: 'DoNotDisclose', value: 3 }
];

const maritialStatus = [
    { name: 'Single', value: 0 },
    { name: 'Married', value: 1 },
    { name: 'Widowed', value: 2 },
    { name: 'Divorced', value: 3 },
    { name: 'Separated', value: 4 }
];

export default Appointments;

