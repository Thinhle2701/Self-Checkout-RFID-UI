import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

const DataTable = ({ products, setImportValue, RFIDList, setRFIDList }) => {
  const columns = [
    {
      field: "id",
      headerName: "ProductID",
      sortable: false,
      width: 150,
    },
    {
      field: "image",
      headerName: "Image of Product",
      width: 200,
      height: 500,
      sortable: false,
      renderCell: (params) => (
        <img
          src={params.value}
          height="100"
          width="100"
          style={{}}
          alt="product"
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      width: 100,
    },
    {
      field: "quantity",
      headerName: "Qty",
      sortable: false,
      width: 60,
    },
  ];
  return (
    <div style={{ height: 530, width: "100%", marginTop: "10%" }}>
      <DataGrid
        rows={products}
        columns={columns}
        rowHeight={100}
        pageSize={10}
        rowsPerPageOptions={[]}
        disableColumnMenu
        disableSelectionOnClick
      />
    </div>
  );
};

export default DataTable;
