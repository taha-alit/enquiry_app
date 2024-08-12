import React, { useRef, useState } from "react";
import Toolbar, { Item } from "devextreme-react/toolbar";
import Button from "devextreme-react/button";
import UserPanel from "../user-panel/UserPanel";
import "./Header.scss";
import { Template } from "devextreme-react/core/template";
import { DropDownButton } from "devextreme-react";
import { useScreenSize } from "../../utils/media-query";
import { exportDataGrid } from "devextreme/excel_exporter";
import { exportDataGrid as exportDataGridPDF } from "devextreme/pdf_exporter";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver-es";
import { camelCase } from "../../utils/common-methods";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const dropDownOptions = {
  width: "85px",
};

export default function Header(props) {
  const { isSmall, isXSmall, isXXSmall, isExSmall } = useScreenSize();
  const [userImage, setUserImage] = useState();

  const DataGridRef = props.dataGridRef;
  const HeaderToolbarRef = useRef(null);

  const dropdownItems = [
    { id: 1, name: "Excel", icon: "exportxlsx" },
    { id: 2, name: "CSV", icon: "xlsfile" },
    { id: 3, name: "PDF", icon: "pdffile" },
  ];

  const onItemClick = (e) => {
    var fileName = camelCase(props.title);
    if (props.exportFileName !== undefined && props.exportFileName !== null) {
      fileName = camelCase(props.exportFileName);
    }

    if (e.itemData.id === 1) {
      var workbook = new Workbook();
      var worksheet = workbook.addWorksheet("SheetName");
      exportDataGrid({
        component: DataGridRef.current?.instance,
        worksheet: worksheet,
      }).then(function () {
        workbook.xlsx.writeBuffer().then(function (buffer) {
          saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            fileName + ".xlsx"
          );
        });
      });
    } else if (e.itemData.id === 2) {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Report");
      exportDataGrid({
        component: DataGridRef.current?.instance,
        worksheet: worksheet,
      }).then(function () {
        workbook.csv.writeBuffer().then(function (buffer) {
          saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            fileName + ".csv"
          );
        });
      });
    } else if (e.itemData.id == 3) {
      const doc = new jsPDF();
      exportDataGridPDF({
        jsPDFDocument: doc,
        component: DataGridRef.current?.instance,
      }).then(() => {
        doc.save(fileName + ".pdf");
      });
    }
  };

  const onAddButtonClick = () => {
    props.handleAdd();
  };

  const onRefreshButtonClick = async () => {
    props.GetRecord && await props.GetRecord();
    HeaderToolbarRef.current?.instance.repaint();
  };

  const onResetButtonClick = () => {
    DataGridRef.current?.instance.state(null);
    DataGridRef.current?.instance.clearFilter();
    HeaderToolbarRef.current?.instance.repaint();
  }

  return (
    <header className={"header-component"} id="Comman-Header">
      <Toolbar className={"header-toolbar"} ref={HeaderToolbarRef}>
        <Item
          location={"before"}
          cssClass={"header-title ps-2"}
          visible={!!props.title}
        >
          <span className={(isExSmall || isXXSmall || isXSmall || isSmall) ? "ps-4 ms-3" : "ps-2"}>{props.title}</span>
        </Item>
        {!props.hideDefaultButtons && (
          <Item location={"before"}>
            <span className="vertical-line px-1">|</span>
          </Item>
        )}
        {!props.hideDefaultButtons && (
          <Item location="before" locateInMenu="auto">
            <Button
              icon="plus"
              className="rounded-5 default-button"
              id="Add"
              onClick={onAddButtonClick}
              stylingMode="outlined"
              type="default"
              hint="Add"
            ></Button>
          </Item>
        )}

        {!props.hideDefaultButtons && (
          <Item location="after" locateInMenu="auto">
            <Button
              icon="refresh"
              className="mx-md-1 rounded-5 default-button"
              id="refresh"
              onClick={onRefreshButtonClick}
              stylingMode="outlined"
              type="default"
              hint="Refresh"
            ></Button>
          </Item>
        )}
        {!props.hideDefaultButtons && (
          <Item location="after" locateInMenu="auto">
            <DropDownButton
              displayExpr={"name"}
              items={dropdownItems}
              id={"export"}
              icon={"export"}
              hint="Export"
              dropDownOptions={dropDownOptions}
              stylingMode="outlined"
              type="default"
              className={"mx-md-1 rounded-5 export-dropdown-btn"}
              elementAttr={{ role: "button" }}
              showArrowIcon={false}
              onItemClick={onItemClick}
            ></DropDownButton>
          </Item>
        )}
        {!props.hideDefaultButtons && (
          <Item location="after" locateInMenu="auto">
            <Button
              icon="pulldown"
              className="mx-md-1 rounded-5 default-button ResetButton"
              id="reset"
              onClick={onResetButtonClick}
              stylingMode="outlined"
              type="default"
              hint="Reset"
            ></Button>
          </Item>
        )}
        {
          !props.hideDefaultButtons && !isExSmall && !isXSmall && !isXXSmall &&
          <Item location={"after"}>
            <span className="vertical-line">|</span>
          </Item>
        }

        <Item
          location={"after"}
          locateInMenu={"auto"}
          menuItemTemplate={"userPanelTemplate"}
        >
          <Button
            className={"user-button authorization"}
            height={"100%"}
            stylingMode={"text"}
          >
            <UserPanel menuMode={"context"} userImage={userImage} setUserImage={setUserImage} setDropDownClick={props.setDropDownClick} />
          </Button>
        </Item>
        <Template name={"userPanelTemplate"}>
          <UserPanel menuMode={"list"} userImage={userImage} setUserImage={setUserImage} setDropDownClick={props.setDropDownClick} />
        </Template>
      </Toolbar>
    </header>
  );
}
