import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

const DataTable = ({ products }) => {
  const columns = [
    {
      field: "id",
      headerName: "ProductID",
      sortable: false,
      width: 150,
    },
    {
      field: "image",
      headerName: "Image",
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
      headerName: "Product Name",
      sortable: false,
      width: 250,
    },
    {
      field: "qty",
      headerName: "Number In Stock",
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <div>
          <p style={{ fontSize: "18px", marginLeft: "20px" }}>{params.value}</p>
        </div>
      ),
    },
  ];
  return (
    <div style={{ height: 730, width: "100%" }}>
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
