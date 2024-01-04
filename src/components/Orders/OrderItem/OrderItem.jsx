import React, { useState, useEffect } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Button,
} from "@mui/material";
import ButtonBase from "@mui/material/ButtonBase";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import OrderDetailModal from "../OrderDetailModal/OrderDetailModal";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "770px",
    width: "600px",
    backgroundColor: "white",
    borderColor: "black",
  },
};

const OrderItem = ({ detail, orderItemValue }) => {
  const [indexItem, setIndexItem] = useState(0);
  const [orderDetailModal, setOrderDetailModal] = useState(false);

  const dateValueNormal = (dateCurr) => {
    //"2023-12-04T07:22:30.243+00:00"
    const date = new Date(dateCurr);
    let dateStr = date.toLocaleString();
    return dateStr;
  };

  const handleClickArrowRight = () => {
    if (indexItem == detail.length - 1) {
      setIndexItem(0);
    } else {
      var temp = indexItem + 1;
      setIndexItem(temp);
    }
  };
  const handleClickArrowLeft = () => {
    if (indexItem == detail.length - 1) {
      setIndexItem(0);
    } else {
      var temp = indexItem + 1;
      setIndexItem(temp);
    }
  };

  // console.log(detail);
  // console.log(orderItemValue);
  return (
    <div>
      <Card
        style={{
          marginLeft: "20%",
          marginRight: "20%",
          margin: "50px",
          height: "400px",
          border: "1px solid black",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ marginLeft: "2%" }}>
            <p style={{ fontWeight: "bold", fontSize: "20px" }}>
              OrderID : {orderItemValue.orderID}
            </p>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "20px",
                marginTop: "-20px",
              }}
            >
              Checkout Counter: 1
            </p>
          </div>

          <p
            style={{
              marginLeft: "auto",
              marginRight: "30px",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            📅 Order Date : {dateValueNormal(orderItemValue.orderDate)}
          </p>
        </div>
        <div style={{}}>
          <div style={{ alignItems: "center", textAlign: "center" }}>
            <p style={{ fontWeight: "bold", fontSize: "30px" }}>
              {detail[indexItem].productName}
            </p>
          </div>

          <div style={{ display: "flex", marginLeft: "20px" }}>
            <ButtonBase onClick={() => handleClickArrowLeft()}>
              <ArrowLeftIcon style={{ fontSize: "40px" }} />
            </ButtonBase>
            <div
              style={{
                marginLeft: "100px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={detail[indexItem].image}
                style={{
                  height: "150px",
                  width: "200px",
                  marginRight: "10px",
                  marginLeft: "10px",
                }}
              ></img>
              <div style={{ fontSize: "20px", marginLeft: "200px" }}>
                <p>Quantity: {detail[indexItem].quantity}</p>
              </div>
              <div style={{ fontSize: "20px", marginLeft: "200px" }}>
                <p style={{ fontSize: "20px" }}>
                  Price Per unit:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    Number(detail[indexItem].price) /
                      Number(detail[indexItem].quantity)
                  )}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                marginRight: "40px",
              }}
            >
              <ButtonBase onClick={handleClickArrowRight}>
                <ArrowRightIcon style={{ fontSize: "40px" }} />
              </ButtonBase>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                color: "green",
                fontWeight: "bold",
                fontSize: "32px",
                marginLeft: "45%",
                marginTop: "-20px",
              }}
            >
              Total:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(orderItemValue.totalPrice)}
            </p>
            <button
              className="addToCartBttn"
              style={{
                fontSize: "17px",
                marginLeft: "auto",
                marginRight: "10px",
              }}
              onClick={() => {
                setOrderDetailModal(true);
              }}
            >
              View Order Detail
            </button>
          </div>
        </div>
      </Card>

      <div>
        {orderDetailModal === true ? (
          <Modal
            isOpen={orderDetailModal}
            style={customStyles}
            ariaHideApp={false}
          >
            <OrderDetailModal
              setModal={setOrderDetailModal}
              detailOrder={detail}
              orderInfo={orderItemValue}
              paymentType={orderItemValue.paymentMethod}
            />
          </Modal>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default OrderItem;
