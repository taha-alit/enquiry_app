import React from 'react';
import './doctors.scss'
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Lookup,
    Toolbar,
    Item,
    Button as GridButton,
    ColumnChooserSearch,
    ColumnChooser,
    FilterBuilderPopup,
    FilterPanel,
    Scrolling,
    StateStoring
} from 'devextreme-react/data-grid';
import { deleteById, get, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import DataSource from 'devextreme/data/data_source';
import Form, { GroupItem, ColCountByScreen, SimpleItem } from 'devextreme-react/form';
import 'devextreme-react/text-area';
import { FormPopup } from '../../components/utils/form-popup';
import { DeletePopup } from '../../components/utils/delete-popup';
import { FormTextbox } from '../../components/utils/form-textbox';
import { FormSelectbox } from '../../components/utils/form-selectbox';
import { Button as SelectButton } from 'devextreme-react/select-box';
import { TextBox } from 'devextreme-react/text-box';
import { exportDataGrid as exportDataGridXSLX } from 'devextreme/excel_exporter';
import Validator, { RequiredRule } from 'devextreme-react/validator';
import { newSpecialityDefaults, CreateEditPopup as SpecialityCreateEditPopup } from '../specialities';
import Header from '../../components/header/Header';
import { HideDatagridLoader } from '../../utils/common-methods';

const Doctors = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [specialities, setSpecialities] = React.useState([]);
    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formDoctorInitData, setFormDoctorInitData] = React.useState({ ...newDoctorDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);
    const [doctors, setDoctors] = React.useState([]);
    const [focusedRowKey, setFocusedRowKey] = React.useState(null);

    React.useEffect(() => {
        fetchDoctors();
        fetchSpeciality();
    }, []);
    
    const fetchDoctors = async () => {
        try {
            resetError();
            const doctorsData = await makeRequest('Doctor/GetList', get, {});
            setDoctors(doctorsData);
            if(doctorsData.length > 0) {
                setFocusedRowKey(doctorsData[0].DoctorID);
            }
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
        setFormDoctorInitData({ ...newDoctorDefaults });
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
        setFormDoctorInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteClick = (evt) => {
        setDeleteKey(evt.row.data.DoctorID);
        setDeletePopupVisible(true);
    }

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Doctor/Delete/${deleteKey}`, deleteById);
            notify(response, 'success', 2000);
            fetchDoctors();
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
                title={"Doctors"}
                handleAdd={handleAdd}
                dataGridRef={gridRef}
                GetRecord={fetchDoctors}
            />
            <div className='list-section'>
                <DataGrid
                    className={'List_DataGrid'}
                    dataSource={doctors}
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
                    keyExpr="DoctorID"
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
                    <StateStoring enabled={true} type='localStorage' storageKey='Doctor_Layout' />
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
                        alignment='left'
                    />
                    <Column
                        dataField={'SpecialityID'}
                        caption={'Speciality'}
                        hidingPriority={5}
                        alignment='left'
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
                        data={formDoctorInitData}
                        specialities={specialities}
                        makeRequest={makeRequest}
                        refresh={fetchDoctors}
                        refreshSpeciality={fetchSpeciality}
                    />
                )
            }

            <DeletePopup title={'Delete Doctor'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

export const CreateEditPopup = ({ isOpen, onClose, data, makeRequest, refresh, ...props }) => {

    let newDoctorData = { ...data };

    const onDataChanged = React.useCallback((data) => {
        newDoctorData = data
    });

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
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    return (

        <FormPopup title={'New Doctor'} visible={isOpen} setVisible={onClose} onSave={onSaveClick}>
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

const CreateEditForm = ({ data, onDataChanged, editing, specialities, makeRequest, refreshSpeciality }) => {
    const specialitySelectBoxRef = React.useRef();
    const [formData, setFormData] = React.useState({ ...data });

    const [specialityPopupVisible, setSpecialityPopupVisible] = React.useState(false);
    const specialityDidMountRef = React.useRef(false);

    React.useEffect(() => {
        if (specialities) {
            if (specialityDidMountRef.current) {
                updateField('SpecialityID')(specialities[specialities.length - 1].SpecialityID)
            } else {
                specialityDidMountRef.current = true;
            }
        }
    }, [specialities]);

    const addSpecialityButtonOption = React.useMemo(() => ({
        icon: 'plus',
        stylingMode: 'text',
        onClick: () => {
            setSpecialityPopupVisible(true);
        }
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

    const changeSpecilaityPopupVisibility = React.useCallback((isVisible) => {
        setSpecialityPopupVisible(isVisible);
    }, []);

    return (
        <React.Fragment>
            <Form>
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
                </GroupItem>
            </Form>
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


export const newDoctorDefaults = {
    DoctorID: 0,
    DoctorName: '',
    Education: '',
    SpecialityID: null
}

export default Doctors;

