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
      headerName: "Item Number",
      sortable: false,
      width: 150,
      height: 400,
    },
    {
      field: "image",
      headerName: "Image",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <img
          src={params.value}
          height="50"
          width="50"
          style={{}}
          alt="product"
        />
      ),
    },
    {
      field: "name",
      headerName: "Product Name",
      sortable: false,
      width: 150,
    },
    { field: "quantity", headerName: "Quantity", sortable: false, width: 150 },
    {
      field: "price",
      headerName: "Price",
      width: 150,
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
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "600px",
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
      ),
    },
  ];
  console.log(products);
  return (
    <div style={{ height: 630, width: "100%" }}>
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
