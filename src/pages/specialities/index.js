import React from 'react';
import './specialities.scss'
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
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
import { FormPopup } from '../../components/utils/form-popup';
import { DeletePopup } from '../../components/utils/delete-popup';
import { FormTextbox } from '../../components/utils/form-textbox';
import { TextBox } from 'devextreme-react/text-box';
import { CheckBox } from 'devextreme-react/check-box';

import Header from '../../components/header/Header';
import { HideDatagridLoader } from '../../utils/common-methods';

const Specialities = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formSpecialityInitData, setFormSpecialityInitData] = React.useState({ ...newSpecialityDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);
    const [specialities, setSpecialities] = React.useState([]);
    const [focusedRowKey, setFocusedRowKey] = React.useState(null);

    const fetchSpecialities = async () => {
        try {
            resetError();
            const specialitiesData = await makeRequest('Speciality/GetList', get, {});
            setSpecialities(specialitiesData);
            if(specialitiesData.length > 0) {
                setFocusedRowKey(specialitiesData[0].SpecialityID);
            }
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }
    React.useEffect(() => {
        fetchSpecialities();
    }, []);

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormSpecialityInitData({ ...newSpecialityDefaults });
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
        setFormSpecialityInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteClick = (evt) => {
        setDeleteKey(evt.row.data.SpecialityID);
        setDeletePopupVisible(true);
    }

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Speciality/Delete/${deleteKey}`, deleteById);
            notify(response, 'success', 2000);
            fetchSpecialities();
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
                title={"Specialities"}
                handleAdd={handleAdd}
                dataGridRef={gridRef}
                GetRecord={fetchSpecialities}
            />
            <div className='list-section'>
                <DataGrid
                    className={'List_DataGrid'}
                    dataSource={specialities}
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
                    keyExpr="SpecialityID"
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
                    <ColumnChooser enabled>
                        <ColumnChooserSearch enabled />
                    </ColumnChooser>
                    <StateStoring enabled={true} type='localStorage' storageKey='Specialities_Layout' />
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
                        alignment='left'
                    />
                    <Column
                        dataField={'Description'}
                        caption={'Description'}
                        hidingPriority={8}
                        alignment='left'
                    />
                    <Column
                        dataField={'IsGynac'}
                        caption={'Is Gynac'}
                        hidingPriority={8}
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
                        data={formSpecialityInitData}
                        makeRequest={makeRequest}
                        refresh={fetchSpecialities}
                    />
                )
            }
            <DeletePopup title={'Delete Speciality'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

export const CreateEditPopup = ({ isOpen, onClose, data, makeRequest, refresh, ...props }) => {

    let newSpecialityData = { ...data };

    const onDataChanged = React.useCallback((data) => {
        newSpecialityData = data
    });

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
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    return (

        <FormPopup title={'New Speciality'} visible={isOpen} setVisible={onClose} onSave={onSaveClick}>
            <CreateEditForm
                onDataChanged={onDataChanged}
                editing
                data={data}
                {...props}
            />
        </FormPopup>
    )

}

const CreateEditForm = ({ data, onDataChanged, editing }) => {

    const [formData, setFormData] = React.useState({ ...data });

    React.useEffect(() => {
        console.log(data)
        setFormData({ ...data });
    }, [data]);

    const updateField = (field) => (value) => {
        const newData = { ...formData, [field]: value };
        onDataChanged(newData);
        setFormData(newData);
    }

    return (
        <React.Fragment>
            <Form>
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
                        // enableThreeStateBehavior
                        />
                    </SimpleItem>

                </GroupItem>
            </Form>
        </React.Fragment>
    );
}

export const newSpecialityDefaults = {
    SpecialityID: 0,
    SpecialityName: '',
    IsGynac: false,
    Description: ''
}

export default Specialities;
