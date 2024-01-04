import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import axios from "axios";
const DataTable = ({
  BE_URL,
  products,
  setProductValue,
  RFIDList,
  setRFIDList,
  totalValue,
  setTotalValue,
  cartID,
  setItemScanned,
  setIsLoading,
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
            setIsLoading(true);
            var total = totalValue;
            let newTotal = Number(total) - Number(params.row.price);
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
            // console.log(retrieveCart);

            // var newSet = new Set(newList);
            // console.log(newSet);
            // await setProductValue(retrieveCart);
            // await setRFIDList(newSet);
            const url = BE_URL + "/api/checkoutcart/update_cart";
            axios
              .post(url, {
                cartID: cartID,
                cartItem: retrieveCart,
                RFID: newList,
                totalPrice: newTotal,
              })
              .then(
                async (response) => {
                  console.log(response.data);
                  // await setProductValue(response.data.cartItem);
                  // const setListRFID = new Set(response.data.RFID);
                  await setRFIDList(response.data.RFID);
                  // await setTotalValue(Number(response.data.totalPrice));
                  if (response.data.RFID.length === 0) {
                    console.log("empty");
                    setItemScanned(false);
                  }
                },
                (error) => {
                  console.log("err", error);
                }
              );
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
