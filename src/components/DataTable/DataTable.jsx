import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "itemnumber",
    headerName: "Item Number",
    sortable: false,
    width: 120,
  },
  {
    field: "image",
    headerName: "Image",
    width: 100,
    sortable: false,
    renderCell: (params) => (
      <img
        src={params.value}
        height="30"
        width="30"
        style={{ marginLeft: "10px" }}
        alt="product"
      />
    ),
  },
  {
    field: "name",
    headerName: "Product Name",
    sortable: false,
    width: 200,
  },
  { field: "quantity", headerName: "Quantity", sortable: false, width: 130 },
  { field: "price", headerName: "Price", width: 100 },
];

const DataTable = ({ products }) => {
  console.log(products);
  return (
    <div style={{ height: 700, width: "75%" }}>
      <DataGrid
        rows={products}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[]}
        disableColumnMenu
        disableSelectionOnClick
      />
    </div>
  );
};

export default DataTable;
