import React, { useState } from 'react';
import 'devextreme/data/odata/store';
import DataGrid, {
    Column,
    Pager,
    Paging,
    FilterRow,
    ColumnChooser,
    SearchPanel,
    Editing,
    Export,
    Toolbar,
    RequiredRule,
    Popup,
    Form,
    Lookup,
    Item,
    ValidationRule,
    Summary,
    TotalItem,
} from 'devextreme-react/data-grid';
import { Item as FormItem } from 'devextreme-react/form';
import { deleteById, get, getById, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import DataSource from 'devextreme/data/data_source';
import 'devextreme-react/text-area';

let receiptItems = [];

const Receipts = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const dataGridRef = React.useRef();

    const [doctors, setDoctors] = React.useState([]);
    const [items, setItems] = React.useState([]);
    // const [enableItemsDataGrid, setEnableItemsDataGrid] = React.useState(false);
    const [isEdit, setIsEdit] = React.useState(false);
    const [receiptNumber, setReceiptNumber] = React.useState(0);
    const [updatingRow, setUpdatingRow] = React.useState(null);

    const receiptDataSource = React.useMemo(() => (
        new DataSource({
            key: 'ReceiptID',
            async load() {
                try {
                    const receiptNo = await makeRequest('Receipt/GenerateReceiptNo', get);
                    setReceiptNumber(receiptNo);
                    const receiptData = await makeRequest('Receipt/GetList', get);
                    return receiptData;
                } catch (error) {
                    notify(error.message, 'error', 2000);
                }
            },
            async insert(values) {
                const receiptDetail = receiptItems.map(item => ({
                    ...item,
                    ReceiptID: parseInt(values.ReceiptNo),
                }));

                const netAmount = receiptItems.reduce((accum, item) => accum += item.Amount, 0);
                const receiptBody = {
                    ...values,
                    "NetAmount": netAmount,
                    receiptDetail
                }
                try {
                    const response = await makeRequest('Receipt/Insert', post, receiptBody);
                    console.log(response);
                    notify(response, 'success', 2000);
                } catch (error) {
                    notify(error.message, 'error', 2000);
                }
            },
            async update(key, values) {
                try {
                    const receipt = await makeRequest(`Receipt/GetById/${key}`, getById);
                    if (receipt) {
                        values = { ...receipt, ...values };
                        const receiptDetail = receiptItems.map(item => ({
                            ...item,
                            ReceiptID: parseInt(values.ReceiptNo),
                        }));        
                        const netAmount = receiptItems.reduce((accum, item) => accum += item.Amount, 0);
                        const receiptBody = {
                            ...values,
                            "NetAmount": netAmount,
                            receiptDetail
                        }
                        const response = await makeRequest('Receipt/Update', put, receiptBody);
                        notify(response, 'success', 2000);
                    }
                } catch (error) {
                    notify(error.message, 'error', 2000);
                }
            },
            async remove(key) {
                try {
                    const response = await makeRequest(`Receipt/Delete/${key}`, deleteById);
                    notify(response, 'success', 2000);
                } catch (error) {
                    notify(error.message, 'error', 2000);
                }
            }
        })
    ), []);

    const itemsDataSource = React.useMemo(() => new DataSource({
        key: 'ReceiptDetailID',
        async load() {
            if (!isEdit) {
                return receiptItems;
            }
            return receiptItems.map(item => ({
                ...item,
                GrossAmount: item.Rate * item.Quantity,
                DiscountPer: (item.Discount / (item.Rate * item.Quantity)) * 100,
            }));
        },
        async insert(values) {
            receiptItems.push({ ReceiptDetailID: receiptItems.length + 1, ...values });
        },
        async update(key, values) {
            let itemDetail = receiptItems.find(item => item.ReceiptDetailID == key);
            let idx = receiptItems.findIndex(item => item.ReceiptDetailID == key);
            receiptItems[idx] = { ...itemDetail, ...values };
        },
        async remove(key) {
            let idx = receiptItems.findIndex(item => item.ReceiptDetailID == key);
            receiptItems.splice(idx, 1);
        }
    }), [isEdit]);


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
                const itemsData = await makeRequest('Item/GetList', get, {});
                setItems(itemsData);
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

    const amountCellRendered = (cellData) => (
        <>{`$${cellData.data.NetAmount}`}</>
    );

    const updateAmountCalculation = (newData, rowData) => {
        newData.GrossAmount = (rowData.Rate || 0) * (rowData.Quantity || 0);
        newData.Discount = (rowData.DiscountPer / 100) * newData.GrossAmount;
        newData.Amount = newData.GrossAmount - newData.Discount;
    }

    return (
        <React.Fragment>
            <h2 className={'content-block'}>Receipts</h2>

            <DataGrid
                className={'dx-card wide-card'}
                dataSource={receiptDataSource}
                ref={dataGridRef}
                showBorders
                defaultFocusedRowIndex={0}
                columnAutoWidth
                columnHidingEnabled
                allowColumnReordering
                allowColumnResizing
                onExporting={onExporting}
                onEditingStart={async (e) => {
                    setIsEdit(true);
                    // setUpdatingRow(e.data);
                    receiptItems = await makeRequest(`Receipt/GetDetailsByReceiptId/${e.data.ReceiptID}`, get);

                }}
                onInitNewRow={async (e) => {
                    e.data.ReceiptDate = new Date();
                    e.data.ReceiptNo = receiptNumber;
                    setIsEdit(false);
                }}
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
                    <Popup title={`${isEdit ? 'Edit' : 'Create'} Receipt`} showTitle width={'60%'} height={'auto'} />
                    <Form>
                        <FormItem itemType='group' colCount={2} colSpan={2}>
                            <FormItem dataField='ReceiptNo' disabled />
                            <FormItem dataField='ReceiptDate' />
                        </FormItem>
                        <FormItem itemType='group' colCount={1} colSpan={2}>
                            <FormItem dataField='DoctorID' />
                        </FormItem>

                        <FormItem itemType='group' colCount={2} colSpan={2}>
                            <DataGrid
                                className={'dx-card wide-card'}
                                dataSource={itemsDataSource}
                                showBorders
                                defaultFocusedRowIndex={0}
                                columnAutoWidth
                                columnHidingEnabled
                                // allowColumnReordering
                                allowColumnResizing
                                // onExporting={onExporting}
                                // onEditingStart={() => setPopupTitle('Edit')}
                                onInitNewRow={(e) => {
                                    e.data.GrossAmount = 0;
                                    e.data.DiscountPer = 0;
                                    e.data.Discount = 0;
                                    e.data.Amount = 0;
                                }}
                            >
                                <Editing
                                    mode="row"
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
                                />
                                <Column
                                    dataField={'ItemID'}
                                    caption={'Item Name'}
                                    hidingPriority={5}
                                >
                                    <Lookup
                                        dataSource={items}
                                        valueExpr={'ItemID'}
                                        displayExpr={'ItemName'}
                                    />
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
                                >
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
                                >
                                    <RequiredRule />
                                </Column>
                                <Column
                                    dataField={'GrossAmount'}
                                    caption={'GrossAmount'}
                                    hidingPriority={6}
                                    dataType='number'
                                    allowEditing={false}
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
                                />
                                <Column
                                    dataField={'Amount'}
                                    caption={'Net Amount'}
                                    hidingPriority={6}
                                    dataType='number'
                                    allowEditing={false}
                                />
                                <Summary recalculateWhileEditing>
                                    <TotalItem
                                        column="GrossAmount"
                                        summaryType="sum"
                                        showInColumn="Discount"
                                        valueFormat="currency"
                                        displayFormat="Total: {0}"

                                    />
                                    <TotalItem
                                        column="Discount"
                                        summaryType="sum"
                                        showInColumn="Discount"
                                        valueFormat="currency"
                                        displayFormat="Discount: {0}"
                                    />
                                    <TotalItem
                                        column="Amount"
                                        summaryType="sum"
                                        showInColumn="Discount"
                                        valueFormat="currency"
                                        displayFormat="Net Total: {0}"
                                    />
                                </Summary>
                            </DataGrid>
                        </FormItem>

                        <FormItem itemType='group' colCount={3} colSpan={2} >
                            <FormItem dataField='Remarks' editorType='dxTextArea' editorOptions={{ height: 100 }} />
                        </FormItem>
                    </Form>
                </Editing>
                <Column
                    dataField={'ReceiptID'}
                    caption={'S No'}
                    width={190}
                    hidingPriority={2}
                    allowEditing={false}
                    alignment='left'
                />
                <Column
                    dataField={'ReceiptNo'}
                    caption={'Receipt No'}
                    width={190}
                    hidingPriority={2}
                    allowEditing={false}
                    alignment='left'
                />
                <Column
                    dataField={'ReceiptDate'}
                    caption={'Receipt Data'}
                    dataType={'date'}
                    hidingPriority={4}
                >
                    <RequiredRule />
                </Column>
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
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'NetAmount'}
                    caption={'Net Amount'}
                    hidingPriority={6}
                    alignment='left'
                    cellRender={amountCellRendered}
                >
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'Remarks'}
                    caption={'Remarks'}
                    hidingPriority={6}
                >
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

export default Receipts;

