import React from 'react';
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
    Item,
    RequiredRule,
    Popup,
    Form,
    Lookup,
} from 'devextreme-react/data-grid';
import { deleteById, get, getById, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import DataSource from 'devextreme/data/data_source';
import { CheckBox } from 'devextreme-react';


const Receipts = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const dataGridRef = React.useRef();

    const [popupTitle, setPopupTitle] = React.useState('Create');
    const [doctors, setDoctors] = React.useState([]);

    const [dataSource, setDataSource] = React.useState(new DataSource({
        key: 'ReceiptID',
        async load() {
            try {
                const patientData = await makeRequest('Receipt/GetList', get);
                return patientData;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async insert(values) {
            values.FullName = `${values.FirstName} ${values.LastName || ''}`;
            try {
                const response = await makeRequest('Receipt/Insert', post, values);
                notify(response, 'success', 2000);
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async update(key, values) {
            try {
                const patientDetail = await makeRequest(`Receipt/GetById/${key}`, getById);
                if (patientDetail) {
                    values = { ...patientDetail, ...values };
                    const response = await makeRequest('Receipt/Update', put, values);
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

    return (
        <React.Fragment>
            <h2 className={'content-block'}>Receipts</h2>

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
                    <Popup title={`${popupTitle} Receipt`} showTitle width={'50%'} height={'auto'} />
                    <Form>
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
                {/* <Column
                    dataField={'Total Qty'}
                    caption={'TotalQty'}
                    hidingPriority={6}
                /> */}
                <Column
                    dataField={'NetAmount'}
                    caption={'NetAmount'}
                    hidingPriority={6}
                    alignment='left'
                    cellRender={amountCellRendered}
                />
                <Column
                    dataField={'Remarks'}
                    caption={'Remarks'}
                    hidingPriority={6}
                />

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

