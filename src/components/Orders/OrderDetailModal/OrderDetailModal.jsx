import React, { useState, useEffect } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
const OrderDetailModal = ({
  setModal,
  detailOrder,
  orderInfo,
  paymentType,
}) => {
  const [buttonOne, setButtonOne] = useState("contained");
  const [buttonTwo, setButtonTwo] = useState("outlined");
  const [title, setTitle] = useState("Order Detail");
  const [modalType, setModalType] = useState("item");
  const [bankAccount, setBankAccount] = useState("");
  const [bankCode, setBankCode] = useState("");

  const handleClickItem = () => {
    if (modalType == "payment") {
      setModalType("item");
      setButtonOne("contained");
      setButtonTwo("outlined");
      setTitle("Order Detail");
    }
    console.log(buttonOne);
  };

  const handleClickPayment = () => {
    if (modalType == "item") {
      setModalType("payment");
      setButtonOne("outlined");
      setButtonTwo("contained");
      setTitle("Checkout Information");
    }
    console.log(buttonTwo);
  };
  useEffect(() => {
    if (paymentType === "MOMO") {
      setBankCode("Visa Napas");
      setBankAccount("9704xxxxxxxx0018");
    } else {
      setBankCode("NCB");
      setBankAccount("9704xxxxxxxxxxx2198");
    }
    console.log("p: ", paymentType);
  }, [orderInfo, paymentType]);
  return (
    <div>
      <>
        <div>
          <button
            style={{
              marginLeft: "auto",
              display: "flex",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              marginBottom: "-30px",
            }}
            onClick={() => {
              setModal(false);
              setBankCode("");
            }}
          >
            X
          </button>
        </div>
        <p
          style={{ textAlign: "center", fontWeight: "bold", fontSize: "30px" }}
        >
          {title}
        </p>

        <div>
          <div style={{ textAlign: "center" }}>
            {buttonOne == "outlined" ? (
              <Button
                variant="outlined"
                onClick={() => {
                  handleClickItem();
                }}
              >
                Ordered Item
              </Button>
            ) : (
              <Button
                variant="contained"
                style={{ backgroundColor: "black", color: "white" }}
                onClick={() => {
                  handleClickItem();
                }}
              >
                Ordered Item
              </Button>
            )}

            {buttonTwo == "outlined" ? (
              <Button
                variant="outlined"
                onClick={() => {
                  handleClickPayment();
                }}
              >
                Checkout Info
              </Button>
            ) : (
              <Button
                style={{ backgroundColor: "black", color: "white" }}
                variant="contained"
                onClick={() => {
                  handleClickPayment();
                }}
              >
                Checkout Info
              </Button>
            )}
          </div>
        </div>
        <div>
          {modalType == "item" ? (
            <>
              <List disablePadding>
                {detailOrder.map((item) => (
                  <div>
                    <ListItem key={item.productName}>
                      <img
                        src={item.image}
                        style={{
                          height: "150px",
                          width: "200px",
                          marginRight: "10px",
                          marginLeft: "10px",
                        }}
                      ></img>
                      <ListItemText
                        style={{ fontSize: "30px" }}
                        primary={item.productName}
                        secondary={`quantity : ${item.quantity} `}
                      />
                      <Typography variant="body5" fontSize="20px">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price)}
                      </Typography>
                    </ListItem>
                  </div>
                ))}
                <ListItem>
                  <ListItemText>
                    <p
                      style={{
                        fontSize: "40px",
                        color: "#3F51B5",
                        paddingLeft: "160px",
                        fontWeight: "700",
                      }}
                    >
                      Total:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(orderInfo.totalPrice)}
                    </p>
                  </ListItemText>
                </ListItem>
              </List>
            </>
          ) : (
            <div style={{ marginTop: "30px" }}>
              <div style={{ display: "flex" }}>
                <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                  Checkout Counter :{" "}
                </p>
                <p
                  style={{
                    paddingLeft: "40px",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  Counter 1
                </p>
              </div>
              <hr></hr>
              <div style={{ display: "flex" }}>
                <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                  Device ID :{" "}
                </p>
                <p
                  style={{
                    paddingLeft: "40px",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  b2211
                </p>
              </div>
              <hr></hr>
              <p style={{ fontWeight: "bold", fontSize: "20px" }}>Payment:</p>
              <ul>
                <li>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {" "}
                      Payment Method:{" "}
                    </p>
                    <p style={{ paddingLeft: "40px", fontSize: "20px" }}>
                      {" "}
                      {orderInfo.paymentMethod}
                    </p>
                  </div>
                </li>
                <li>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {" "}
                      Transaction ID:{" "}
                    </p>
                    <p style={{ paddingLeft: "55px", fontSize: "20px" }}>
                      {" "}
                      {orderInfo.transactionID}
                    </p>
                  </div>
                </li>
                <li>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {" "}
                      Transaction Date:{" "}
                    </p>
                    <p style={{ paddingLeft: "40px", fontSize: "20px" }}>
                      {" "}
                      {orderInfo.transDate}
                    </p>
                  </div>
                </li>

                <li>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {" "}
                      Bank Code:{" "}
                    </p>
                    <p style={{ paddingLeft: "70px", fontSize: "20px" }}>
                      {bankCode}
                    </p>
                  </div>
                </li>
                <li>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {" "}
                      Bank Account:{" "}
                    </p>
                    <p style={{ paddingLeft: "70px", fontSize: "20px" }}>
                      {bankAccount}
                    </p>
                  </div>
                </li>

                {/* <li>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontWeight: "bold" }}> City: </p>
                    <p style={{ paddingLeft: "40px" }}>
                      {" "}
                      {orderInfo.shippingData.city}
                    </p>
                  </div>
                </li> */}
              </ul>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default OrderDetailModal;
