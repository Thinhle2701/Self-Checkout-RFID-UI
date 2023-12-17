import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";

const DataTable = ({
  products,
  setProductValue,
  RFIDList,
  setRFIDList,
  totalValue,
  setTotalValue,
}) => {
  const columns = [
    {
      field: "itemnumber",
      headerName: "Item",
      sortable: false,
      height: 400,
      width: 0,
    },
    {
      field: "image",
      headerName: "Img",
      width: 0,
      sortable: false,
      renderCell: (params) => (
        <img
          src={params.value}
          height="30"
          width="40"
          style={{}}
          alt="product"
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <p style={{ fontSize: "12px", fontWeight: "bold" }}>{params.value}</p>
      ),
    },
    { field: "quantity", headerName: "Qty", sortable: false, width: 0 },
    {
      field: "price",
      headerName: "Price",
      width: 65,
      renderCell: (params) => (
        <p>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(params.value)}
        </p>
      ),
    },
    {
      field: "option",
      headerName: "Option",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "60px",
              backgroundColor: "red",
            }}
            onClick={async (e) => {
              var total = totalValue;
              let newTotal = Number(total) - Number(params.row.price);
              await window.localStorage.setItem("Total", newTotal);
              await setTotalValue(newTotal);
              var retrieveCart = [...products];
              var newList = [...RFIDList];

              for (let i = 0; i < params.row.uuid.length; i++) {
                for (let k = 0; k < newList.length; k++) {
                  if (params.row.uuid[i] === newList[k]) {
                    newList.splice(k, 1);
                  }
                }
              }

              for (let i = 0; i < retrieveCart.length; i++) {
                if (retrieveCart[i].itemnumber === params.row.itemnumber) {
                  if (i === retrieveCart.length - 1) {
                    retrieveCart.pop();
                  } else {
                    for (let j = i; j < retrieveCart.length - 1; j++) {
                      retrieveCart[j].productID = retrieveCart[j + 1].productID;
                      retrieveCart[j].name = retrieveCart[j + 1].name;
                      retrieveCart[j].image = retrieveCart[j + 1].image;
                      retrieveCart[j].quantity = retrieveCart[j + 1].quantity;
                      retrieveCart[j].price = retrieveCart[j + 1].price;
                      retrieveCart[j].uuid = retrieveCart[j + 1].uuid;
                    }
                    retrieveCart.pop();
                  }
                }
              }
              var newSet = new Set(newList);
              await setProductValue(retrieveCart);
              await setRFIDList(newSet);
            }}
          >
            X
          </Button>
        </>
      ),
    },
  ];
  console.log(products);
  return (
    <div style={{ height: 400, width: 412 }}>
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
