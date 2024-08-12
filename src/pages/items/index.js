import React from 'react';
import './items.scss'
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
import Header from '../../components/header/Header';
import { HideDatagridLoader } from '../../utils/common-methods';

const Items = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formItemInitData, setFormItemInitData] = React.useState({ ...newItemDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);
    const [items, setItems] = React.useState([]);
    const [focusedRowKey, setFocusedRowKey] = React.useState(null);

    const fetchItems = async () => {
        try {
            resetError();
            const itemsData = await makeRequest('Item/GetList', get, {});
            setItems(itemsData);
            if(itemsData.length > 0) {
                setFocusedRowKey(itemsData[0].ItemID);
            }
        } catch (err) {
            console.log(err.message);
            notify(err.message, 'error', 2000);
        }
    }
    React.useEffect(() => {
        fetchItems();
    }, []);

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormItemInitData({ ...newItemDefaults });
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
        setFormItemInitData({ ...evt.row.data });
        setPopupVisible(true);
    }

    const onDeleteClick = (evt) => {
        setDeleteKey(evt.row.data.ItemID);
        setDeletePopupVisible(true);
    }

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Item/Delete/${deleteKey}`, deleteById);
            notify(response, 'success', 2000);
            fetchItems();
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
                title={"Items"}
                handleAdd={handleAdd}
                dataGridRef={gridRef}
                GetRecord={fetchItems}
            />
            <div className='list-section'>
                <DataGrid
                    className={'List_DataGrid'}
                    dataSource={items}
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
                    keyExpr="ItemID"
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
                    <StateStoring enabled={true} type='localStorage' storageKey='Item_Layout' />
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
                        data={formItemInitData}
                        makeRequest={makeRequest}
                        refresh={fetchItems}
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

    let newItemData = { ...data };

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
            refresh();
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    };

    return (

        <FormPopup title={'New Item'} visible={isOpen} setVisible={onClose} onSave={onSaveClick}>
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

