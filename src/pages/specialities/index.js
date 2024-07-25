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
} from 'devextreme-react/data-grid';
import { deleteById, get, getById, post, put, useApi } from '../../helpers/useApi';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import DataSource from 'devextreme/data/data_source';
import { CheckBox } from 'devextreme-react';


const Specialities = () => {

    const { makeRequest, loading, error, resetError } = useApi();
    const dataGridRef = React.useRef();

    const [popupTitle, setPopupTitle] = React.useState('Create');

    const [dataSource, setDataSource] = React.useState(new DataSource({
        key: 'SpecialityID',
        async load() {
            try {
                const patientData = await makeRequest('Speciality/GetList', get);
                return patientData;
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async insert(values) {
            values.FullName = `${values.FirstName} ${values.LastName || ''}`;
            try {
                const response = await makeRequest('Speciality/Insert', post, values);
                notify(response, 'success', 2000);
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async update(key, values) {
            try {
                const patientDetail = await makeRequest(`Speciality/GetById/${key}`, getById);
                if (patientDetail) {
                    values = { ...patientDetail, ...values };
                    const response = await makeRequest('Speciality/Update', put, values);
                    notify(response, 'success', 2000);
                }
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        },
        async remove(key) {
            try {
                const response = await makeRequest(`Speciality/Delete/${key}`, deleteById);
                notify(response, 'success', 2000);
            } catch (error) {
                notify(error.message, 'error', 2000);
            }
        }
    }));

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
            <h2 className={'content-block'}>Speciality</h2>

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
                    <Popup title={`${popupTitle} Speciality`} showTitle width={'50%'} height={'auto'} />
                    <Form>
                        <Item dataField='SpecialityName' />
                        <Item dataField='Description' />
                        <Item dataField='IsGynac' />
                    </Form>
                </Editing>
                <Column
                    dataField={'SpecialityID'}
                    caption={'S No'}
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
                >
                    <RequiredRule />
                </Column>
                <Column
                    dataField={'Description'}
                    caption={'Description'}
                    hidingPriority={8}
                />
                <Column
                    dataField="IsGynac"
                    caption="Is Gynac"
                    hidingPriority={8}
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

export default Specialities;

