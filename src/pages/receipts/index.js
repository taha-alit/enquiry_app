import React from 'react';
import './receipts.scss'
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Paging,
    FilterRow,
    Lookup,
    Toolbar,
    Item,
    Button as GridButton,
    Editing,
    ValidationRule,
    HeaderFilter,
    Search,
    ColumnChooserSearch,
    ColumnChooser,
    FilterBuilderPopup,
    FilterPanel,
    Scrolling,
    Summary,
    TotalItem
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
import { FormSelectbox } from '../../components/utils/form-selectbox';
import { Button as SelectButton } from 'devextreme-react/select-box';
import TextArea from 'devextreme-react/text-area';
import { TextBox } from 'devextreme-react/text-box';
import { exportDataGrid } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridXSLX } from 'devextreme/excel_exporter';
import Validator, { CustomRule, RequiredRule } from 'devextreme-react/validator';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { newDoctorDefaults, CreateEditPopup as DoctorCreateEditPopup } from '../doctors';
import { newSpecialityDefaults, CreateEditPopup as SpecialityCreateEditPopup } from '../specialities';
import { NumberBox } from 'devextreme-react/number-box';
import { FormNumberbox } from '../../components/utils/form-numberbox';

const phonePattern = /^[6-9]\d{9}$/;

const Receipts = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const gridRef = React.useRef();

    const [doctors, setDoctors] = React.useState([]);
    const [specialities, setSpecialities] = React.useState([]);
    const [items, setItems] = React.useState([]);
    const [popupVisible, setPopupVisible] = React.useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = React.useState(false);
    const [formReceiptInitData, setFormReceiptInitData] = React.useState({ ...newReceiptDefaults });
    const [deleteKey, setDeleteKey] = React.useState(null);

    const dataSource = React.useMemo(() => new DataSource({
        key: 'ReceiptID',
        async load() {
            try {
                const response = await makeRequest('Receipt/GetList', get);
                return response;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }), [])

    React.useEffect(() => {
        fetchDoctors();
        fetchItems();
        fetchSpeciality();
    }, []);

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
    const fetchItems = async () => {
        try {
            resetError();
            const response = await makeRequest('Item/GetList', get, {});
            setItems(response);
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

    const refreshDoctors = () => fetchDoctors();
    const refreshItems = () => fetchItems();
    const refreshSpeciality = () => fetchSpeciality();

    const changePopupVisibility = React.useCallback((isVisible) => {
        setFormReceiptInitData({ ...newReceiptDefaults });
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
            doc.save('Receipts.pdf');
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

    const onAddReceiptClick = React.useCallback(async () => {
        try {
            receiptDetailItems = [];
            const response = await makeRequest('Receipt/GenerateReceiptNo', get);
            setFormReceiptInitData({ ...newReceiptDefaults, ReceiptNo: parseInt(response), ReceiptDate: new Date() });
            setPopupVisible(true);
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    });

    const onEditReceiptClick = async (evt) => {
        try {
            const response = await makeRequest(`Receipt/GetDetailsByReceiptId/${evt.row.data.ReceiptID}`, get);
            receiptDetailItems = response.map(item => ({
                ...item,
                GrossAmount: item.Rate * item.Quantity,
                DiscountPer: (item.Discount / (item.Rate * item.Quantity)) * 100,
            }));
            const grossAmount = receiptDetailItems.reduce((accum, item) => accum += item.GrossAmount, 0);
            const discount = receiptDetailItems.reduce((accum, item) => accum += item.Discount, 0);
            setFormReceiptInitData({ ...evt.row.data, GrossAmount: grossAmount, Discount: discount });
            setPopupVisible(true);
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    }

    const onDeleteReceiptClick = (evt) => {
        setDeleteKey(evt.row.data.ReceiptID);
        setDeletePopupVisible(true);
    }

    const onDelete = async () => {
        try {
            const response = await makeRequest(`Receipt/Delete/${deleteKey}`, deleteById);
            notify(response, 'success', 2000);
            refresh();
            setDeleteKey(null);
        } catch (error) {
            notify(error.message, 'error', 2000);
        }
    }

    const netAmountCellRendered = (cell) => {
        return `$${cell.value.toFixed(2)}`
    }

    const customizeNetAmountSummary = React.useCallback((e) => {
        return `Total Amount: $${e.value.toFixed(2)}`;
    }, []);

    return (
        <React.Fragment>
            <div className='list-section'>
                <DataGrid
                    className={'dx-card wide-card'}
                    dataSource={dataSource}
                    ref={gridRef}
                    showBorders={true}
                    showColumnLines={false}
                    showRowLines={true}
                    focusedRowEnabled={true}
                    wordWrapEnabled={true}
                    // hoverStateEnabled={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    // autoNavigateToFocusedRow={true}
                    filterSyncEnabled={true}
                    // defaultFocusedRowIndex={0}
                    columnAutoWidth
                    columnHidingEnabled
                    height={'100%'}
                    width={"100%"}
                    noDataText='No Record Found'
                >
                    <FilterBuilderPopup width={'25%'} height={'40%'} title='Apply FIlter' />
                    <FilterPanel visible filterEnabled />
                    <Scrolling mode='infinite' rowRenderingMode='virtual' preloadEnabled={true} useNative={true} />
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
                        dataField={'ReceiptNo'}
                        caption={'Receipt No'}
                        hidingPriority={2}
                        allowEditing={false}
                        alignment='left'
                    />
                    <Column
                        dataField={'ReceiptDate'}
                        caption={'Receipt Data'}
                        dataType={'datetime'}
                        hidingPriority={3}
                    />
                    <Column
                        dataField={'DoctorID'}
                        caption={'Person Name'}
                        hidingPriority={5}
                    >
                        <Lookup
                            dataSource={doctors}
                            valueExpr={'DoctorID'}
                            displayExpr={'DoctorName'}
                        />
                    </Column>
                    <Column
                        dataField={'NetAmount'}
                        width={190}
                        caption={'Net Amount'}
                        hidingPriority={8}
                        cellRender={netAmountCellRendered}
                        alignment='left'
                    />
                    <Column
                        dataField={'Remarks'}
                        caption={'Remarks'}
                        hidingPriority={6}
                        alignment='left'
                    />
                    <Column
                        caption={''}
                        hidingPriority={8}
                        type='buttons'
                        width={'auto'}
                        alignment='left'
                    >
                        <GridButton
                            icon='edit'
                            onClick={onEditReceiptClick}
                            hint='Edit'
                        />
                        <GridButton
                            icon='trash'
                            onClick={onDeleteReceiptClick}
                            hint='Delete'
                        />
                    </Column>
                    <Summary>
                        <TotalItem
                            column='NetAmount'
                            summaryType='sum'
                            showInColumn='NetAmount'
                            alignment='center'
                            // displayFormat='Total Amount: ${0}'
                            customizeText={customizeNetAmountSummary}
                        />
                    </Summary>
                    <HeaderFilter visible={true}>
                        <Search enabled={true} />
                    </HeaderFilter>
                    <ColumnChooser>
                        <ColumnChooserSearch enabled />
                    </ColumnChooser>
                    <Toolbar>
                        <Item location='before'>
                            <span className='toolbar-header'>Receipts</span>
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
                                hint='Add New Receipt'
                                className='add_btn'
                                onClick={onAddReceiptClick}
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
                                hint='Refresh'
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
                                hint='Column Chooser'
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
                                hint='Download PDF'
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
                                hint='Download XL'
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
                                width={300}
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
                        data={formReceiptInitData}
                        makeRequest={makeRequest}
                        refresh={refresh}
                        doctors={doctors}
                        items={items}
                        specialities={specialities}
                        refreshDoctors={refreshDoctors}
                        refreshSpeciality={refreshSpeciality}
                    />
                )
            }

            <DeletePopup title={'Delete Receipt'} visible={deletePopupVisible} setVisible={changeDeletePopupVisibility} onDelete={onDelete}>
                <div className='delete-content'>Are you sure you want to delete this record?</div>
            </DeletePopup>

        </React.Fragment>
    );

}

let receiptDetailItems = [];

export const CreateEditPopup = ({ isOpen, onClose, data, refresh, makeRequest, ...props }) => {

    let newReceiptData = { ...data };

    const onDataChanged = React.useCallback((data) => {
        newReceiptData = data
    });

    const onSaveClick = async () => {
        const receiptDetail = receiptDetailItems.map(item => ({
            ...item,
            ReceiptID: parseInt(newReceiptData.ReceiptNo),
        }));
        const receiptData = {
            ...newReceiptData,
            receiptDetail
        }
        try {
            let response;

            if (newReceiptData.ReceiptID != 0) {
                response = await makeRequest('Receipt/Update', put, receiptData);
            } else {
                response = await makeRequest('Receipt/Insert', post, receiptData);
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

        <FormPopup title={'New Receipt'} visible={isOpen} setVisible={onClose} onSave={onSaveClick} width='70%'>
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

const CreateEditForm = ({ data, onDataChanged, editing, doctors, items, specialities, makeRequest, refreshDoctors, refreshSpeciality }) => {

    const receiptDetailGridRef = React.useRef();
    const doctorSelectBoxRef = React.useRef();
    const [formData, setFormData] = React.useState({ ...data });

    const [doctorPopupVisible, setDoctorPopupVisible] = React.useState(false);
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

    const addDoctorButtonOption = React.useMemo(() => ({
        icon: 'plus',
        stylingMode: 'text',
        onClick: () => {
            setDoctorPopupVisible(true);
        }
    }), []);

    const doctorsSelectboxdropbuttonOption = React.useMemo(() => ({
        icon: "spindown",
        stylingMode: "text",
        onClick: (e) => {
            var selectBoxInstance = doctorSelectBoxRef.current?.instance();
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

    const updateAmountCalculation = (newData, rowData) => {
        newData.GrossAmount = (rowData.Rate || 0) * (rowData.Quantity || 0);
        newData.Discount = (rowData.DiscountPer / 100) * newData.GrossAmount;
        newData.Amount = newData.GrossAmount - newData.Discount;
    }

    const updateReceiptAmount = () => {
        const grossAmount = receiptDetailItems.reduce((accum, item) => accum += item.GrossAmount, 0);
        const netAmount = receiptDetailItems.reduce((accum, item) => accum += item.Amount, 0);
        const discount = receiptDetailItems.reduce((accum, item) => accum += item.Discount, 0);
        const updatedAmount = {
            ...formData,
            GrossAmount: grossAmount,
            Discount: discount,
            NetAmount: netAmount
        };
        onDataChanged(updatedAmount);
        setFormData(updatedAmount);

    }

    const receiptDetailDataSource = React.useMemo(() => new DataSource({
        key: 'ReceiptDetailID',
        async load() {
            return receiptDetailItems;
        },
        async insert(values) {
            receiptDetailItems.push({ ReceiptDetailID: receiptDetailItems.length + 1, ...values });
            updateReceiptAmount();
        },
        async update(key, values) {
            let item = receiptDetailItems.find(item => item.ReceiptDetailID == key);
            let idx = receiptDetailItems.findIndex(item => item.ReceiptDetailID == key);
            receiptDetailItems[idx] = { ...item, ...values };
            updateReceiptAmount();
        },
        async remove(key) {
            let idx = receiptDetailItems.findIndex(item => item.ReceiptDetailID == key);
            receiptDetailItems.splice(idx, 1);
            updateReceiptAmount();
        }
    }), [formData]);

    return (
        <React.Fragment>
            <Form screenByWidth={getSizeQualifier}>
                <GroupItem>
                    <ColCountByScreen xs={1} sm={1} md={2} lg={2} />
                    <SimpleItem>
                        <FormTextbox
                            label='Receipt No'
                            value={formData.ReceiptNo}
                            isEditing={!editing}
                            onValueChange={updateField('ReceiptNo')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormDateBox
                            type={'date'}
                            value={formData.ReceiptDate ? new Date(formData.ReceiptDate) : null}
                            readOnly={!editing}
                            name='ReceiptDate'
                            label='Receipt Date'
                            onValueChange={updateField('ReceiptDate')}
                        />
                    </SimpleItem>
                    <SimpleItem colSpan={2}>
                        <FormSelectbox
                            ref={doctorSelectBoxRef}
                            label='Person'
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
                        <DataGrid
                            ref={receiptDetailGridRef}
                            className={'dx-card wide-card'}
                            dataSource={receiptDetailDataSource}
                            showBorders
                            // defaultFocusedRowIndex={0}
                            columnAutoWidth
                            columnHidingEnabled
                            allowColumnResizing
                            onInitNewRow={(e) => {
                                e.data.GrossAmount = 0;
                                e.data.DiscountPer = 0;
                                e.data.Discount = 0;
                                e.data.Amount = 0;
                            }}
                        >
                            <Editing
                                mode="cell"
                                allowUpdating={true}
                                allowDeleting={true}
                                allowAdding={true}
                            >
                            </Editing>
                            <Column
                                dataField={'ReceiptDetailID'}
                                caption={'S No'}
                                width={100}
                                hidingPriority={2}
                                allowEditing={false}
                                alignment='left'
                                visible={false}
                            />
                            <Column
                                dataField={'ItemID'}
                                caption={'Item Name'}
                                hidingPriority={5}
                                alignment='left'
                            >
                                <Lookup
                                    dataSource={items}
                                    valueExpr={'ItemID'}
                                    displayExpr={'ItemName'}
                                />
                                <RequiredRule />
                            </Column>
                            <Column
                                dataField={'Quantity'}
                                caption={'Qty'}
                                width={80}
                                hidingPriority={6}
                                dataType='number'
                                setCellValue={(newData, value, currentRowData) => {
                                    newData.Quantity = value;
                                    updateAmountCalculation(newData, { ...currentRowData, Quantity: value });
                                }}
                                alignment='left'
                            >
                                <RequiredRule />
                            </Column>
                            <Column
                                dataField={'Rate'}
                                caption={'Rate'}
                                hidingPriority={6}
                                width={100}
                                dataType='number'
                                setCellValue={(newData, value, currentRowData) => {
                                    newData.Rate = value;
                                    updateAmountCalculation(newData, { ...currentRowData, Rate: value });
                                }}
                                format={'$ #,##0.##'}
                                alignment='left'
                            >
                                <RequiredRule />
                            </Column>
                            <Column
                                dataField={'GrossAmount'}
                                caption={'Gross Amount'}
                                hidingPriority={6}
                                dataType='number'
                                allowEditing={false}
                                format={'$ #,##0.##'}
                                alignment='left'
                            />
                            <Column
                                dataField={'DiscountPer'}
                                caption={'Discount %'}
                                hidingPriority={6}
                                dataType='number'
                                setCellValue={(newData, value, currentRowData) => {
                                    if (value >= 0 && value <= 100) {
                                        newData.DiscountPer = value;
                                        updateAmountCalculation(newData, { ...currentRowData, DiscountPer: value });
                                    }
                                }}
                                format={"#0'%'"}
                                alignment='left'
                            >
                                <ValidationRule
                                    type="range"
                                    max={100}
                                    message="Discount percentage cannot be more than 100"
                                />
                            </Column>
                            <Column
                                dataField={'Discount'}
                                caption={'Discount Amount'}
                                hidingPriority={6}
                                dataType='number'
                                allowEditing={false}
                                format={'$ #,##0.##'}
                                alignment='left'
                            />
                            <Column
                                dataField={'Amount'}
                                caption={'Net Amount'}
                                hidingPriority={6}
                                dataType='number'
                                allowEditing={false}
                                format={'$ #,##0.##'}
                                alignment='left'
                            />
                            <Toolbar>
                                <Item
                                    location='after'
                                    widget='dxButton'
                                    locateInMenu='auto'
                                >
                                    <Button
                                        text=''
                                        icon='plus'
                                        stylingMode='contained'
                                        hint='Add Item'
                                        className='add_btn'
                                        onClick={() => {
                                            if (!formData.DoctorID) {
                                                notify('Please select person', 'error', 2000);
                                            } else {
                                                receiptDetailGridRef.current.instance().addRow();
                                            }
                                        }}
                                    />
                                </Item>
                            </Toolbar>
                        </DataGrid>
                    </SimpleItem>
                    <SimpleItem>
                        <TextArea
                            label='Remarks'
                            readOnly={!editing}
                            value={formData.Remarks}
                            stylingMode='outlined'
                            onValueChange={updateField('Remarks')}
                        />
                    </SimpleItem>
                    <SimpleItem>
                        <FormNumberbox
                            label='Total Amount'
                            value={formData.GrossAmount || 0}
                            isEditing={true}
                            onValueChange={updateField('GrossAmount')}
                            format={'$ #,##0.##'}
                        >
                            <CustomRule
                                validationCallback={(e) => e.value > 0}
                                message='Total Amount cannot be zero.'
                            />
                        </FormNumberbox>
                        <FormNumberbox
                            label='Discount'
                            value={formData.Discount || 0}
                            isEditing={true}
                            onValueChange={updateField('Discount')}
                            format={'$ #,##0.##'}
                        >
                        </FormNumberbox>
                        <FormNumberbox
                            label='Net Amount'
                            value={formData.NetAmount}
                            isEditing={true}
                            onValueChange={updateField('NetAmount')}
                            format={'$ #,##0.##'}
                        >
                            <CustomRule
                                validationCallback={(e) => e.value > 0}
                                message='Net Amount cannot be zero.'
                            />
                        </FormNumberbox>
                    </SimpleItem>
                </GroupItem>
            </Form>

            {
                doctorPopupVisible && (
                    <DoctorCreateEditPopup
                        isOpen={doctorPopupVisible}
                        onClose={changeDoctorPopupVisibility}
                        data={newDoctorDefaults}
                        makeRequest={makeRequest}
                        refresh={refreshDoctors}
                        specialities={specialities}
                        refreshSpeciality={refreshSpeciality}
                    />
                )
            }
        </React.Fragment>
    );
}

const newReceiptDefaults = {
    ReceiptID: 0,
    ReceiptNo: 0,
    ReceiptDate: '',
    DoctorID: null,
    NetAmount: 0,
    Remarks: ''
}

export default Receipts;

