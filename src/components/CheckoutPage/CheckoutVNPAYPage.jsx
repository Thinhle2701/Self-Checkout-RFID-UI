import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import greenTick from "../../assets/image/greenTick.png";
import { Col, Divider, Row, Table } from "antd";
import { Button } from "@mui/material";
var ranonce = false;
const CheckoutVNPAYPage = ({ FE_URL, BE_URL }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [items, setItems] = useState([]);
  const [orderBill, setOrderBill] = useState({});
  const [invoicePage, setInvoicePage] = useState(false);
  const [succes, setSucces] = useState("01");
  useEffect(() => {
    if (!ranonce) {
      const queryParameters = new URLSearchParams(window.location.search);
      const vnp_TransactionStatus = queryParameters.get(
        "vnp_TransactionStatus"
      );
      setSucces(vnp_TransactionStatus);
      const vnp_TxnRef = queryParameters.get("vnp_TxnRef");
      const vnp_TransactionDate = queryParameters.get("vnp_PayDate");
      const urlTransaction = BE_URL + "/api/order/find_transaction";
      axios
        .post(urlTransaction, {
          transactionID: vnp_TxnRef,
        })
        .then(
          async (response) => {
            if (response.data.success == true) {
              console.log(response.data.orderData.orderItem);
              let ordItem = [];
              for (
                let i = 0;
                i < response.data.orderData.orderItem.length;
                i++
              ) {
                const item = {
                  id: Number(i + 1),
                  productID: response.data.orderData.orderItem[i].productID,
                  name: response.data.orderData.orderItem[i].productName,
                  price: new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(response.data.orderData.orderItem[i].price),
                  quantity: response.data.orderData.orderItem[i].quantity,
                  image: response.data.orderData.orderItem[i].image,
                };
                ordItem.push(item);
              }
              const urlQuery = BE_URL + "/api/checkoutvnp/querydr";
              axios
                .post(urlQuery, {
                  orderId: response.data.orderData.transactionID,
                  transDate: response.data.orderData.transDate,
                })
                .then(
                  async (res) => {
                    const orderCreated = {
                      orderID: response.data.orderData.orderID,
                      orderItem: ordItem,
                      payment: response.data.orderData.payment,
                      totalPrice: new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(response.data.orderData.totalPrice),
                      transactionID: response.data.orderData.transactionID,
                      bankCode: res.data.vnp_BankCode,
                      cardNumber: res.data.vnp_CardNumber,
                      cardHolder: res.data.vnp_CardHolder,
                      transDate: response.data.orderData.transDate,
                      paymentMethod: response.data.orderData.paymentMethod,
                    };
                    console.log("order exist", orderCreated);
                    await setOrderBill(orderCreated);
                    await setItems(ordItem);
                  },
                  (error) => {
                    console.log(error);
                  }
                );
            } else {
              if (vnp_TransactionStatus == "00") {
                console.log("checkout sucess");
                console.log("orderID: ", vnp_TxnRef);
                console.log("transDate: ", vnp_TransactionDate);
                const url = BE_URL + "/api/checkoutvnp/querydr";
                axios
                  .post(url, {
                    orderId: vnp_TxnRef,
                    transDate: vnp_TransactionDate,
                  })
                  .then(
                    (response) => {
                      if (response.data.vnp_TransactionStatus == "00") {
                        const cartList = JSON.parse(
                          window.localStorage.getItem("Cart")
                        );
                        const totalPrice = JSON.parse(
                          window.localStorage.getItem("Total")
                        );
                        let items = [];
                        for (let i = 0; i < cartList.length; i++) {
                          let entity = {
                            productID: cartList[i].productID,
                            productName: cartList[i].name,
                            quantity: cartList[i].quantity,
                            price: cartList[i].price,
                            image: cartList[i].image,
                            uuid: cartList[i].uuid,
                          };
                          items.push(entity);
                        }
                        const urlAddOrder = BE_URL + "/api/order/add_order";
                        axios
                          .post(urlAddOrder, {
                            transactionID: response.data.vnp_TxnRef,
                            transDate: response.data.vnp_PayDate,
                            totalPrice: totalPrice,
                            orderItem: items,
                            payment: true,
                            paymentMethod: "VNPAY",
                          })
                          .then(
                            async (res) => {
                              let ordItem = [];
                              for (
                                let i = 0;
                                i < res.data.data.orderItem.length;
                                i++
                              ) {
                                const item = {
                                  id: Number(i + 1),
                                  productID:
                                    res.data.data.orderItem[i].productID,
                                  name: res.data.data.orderItem[i].productName,
                                  price: new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(res.data.data.orderItem[i].price),
                                  quantity: res.data.data.orderItem[i].quantity,
                                  image: res.data.data.orderItem[i].image,
                                };
                                ordItem.push(item);
                              }
                              const orderCreated = {
                                orderID: res.data.data.orderID,
                                orderItem: ordItem,
                                payment: res.data.data.payment,
                                totalPrice: new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(res.data.data.totalPrice),
                                transactionID: res.data.data.transactionID,
                                bankCode: response.data.vnp_BankCode,
                                cardNumber: response.data.vnp_CardNumber,
                                cardHolder: response.data.vnp_CardHolder,
                                transDate: res.data.data.transDate,
                                paymentMethod: res.data.data.paymentMethod,
                              };
                              await setOrderBill(orderCreated);
                              await setItems(ordItem);
                              window.localStorage.clear();
                              console.log("order created: ", orderCreated);
                            },
                            (error) => {
                              console.log(error);
                            }
                          );
                      } else {
                        console.log(response.data.vnp_Message);
                      }
                    },
                    (error) => {
                      console.log(error);
                    }
                  );
              } else {
                console.log("checkout fail");
                await delay(2000);
                const currentUrl = window.location.href;
                const customerURL =
                  currentUrl.split("checkoutvnp")[0] + "customer";
                window.location.replace(customerURL);
              }
            }
          },
          (error) => {
            console.log(error);
          }
        );

      ranonce = true;
    }
  }, []);

  const handleClickInvoice = () => {
    setInvoicePage(true);
    console.log("invoice", orderBill);
  };

  return (
    <div>
      {succes == "00" ? (
        <>
          {invoicePage === false ? (
            <>
              <div style={{ textAlign: "center", marginTop: "100px" }}>
                <p style={{ fontWeight: "bold", fontSize: "30px" }}>
                  Thank you for Your Order
                </p>
                <img
                  style={{
                    backgroundColor: "white",
                    height: "200px",
                    width: "300px",
                  }}
                  src={greenTick}
                ></img>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: "bold" }}>
                  We sent an email for your about order details. Please check
                  mail to have fully status about your order{" "}
                </p>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Button
                    style={{ background: "green" }}
                    variant="contained"
                    onClick={() => handleClickInvoice()}
                  >
                    See Your Invoice
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: 20 }}>
                <h1 style={{ marginLeft: "40%", fontSize: "70px" }}>Invoice</h1>
                <Row gutter={24} style={{ marginTop: 32 }}>
                  <Col span={8}>
                    <h3 style={{ fontSize: "25px" }}>Bank Account</h3>
                    <div style={{ fontSize: "20px" }}>
                      Account holder name: {orderBill.cardHolder}
                    </div>
                    <div style={{ fontSize: "20px" }}>
                      Account number: {orderBill.cardNumber}
                    </div>
                    <div style={{ fontSize: "20px" }}>
                      Bank Code: {orderBill.bankCode}
                    </div>
                  </Col>
                  <Col span={8} offset={8}>
                    <table>
                      <tr>
                        <th style={{ fontSize: "20px" }}>Invoice # :</th>
                        <td style={{ fontSize: "20px" }}>
                          {orderBill.orderID}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ fontSize: "20px" }}>Invoice Date :</th>
                        <td style={{ fontSize: "20px" }}>
                          {orderBill.transDate}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ fontSize: "20px" }}>Payment Method:</th>
                        <td style={{ fontSize: "20px" }}>
                          {orderBill.paymentMethod}
                        </td>
                      </tr>
                    </table>
                  </Col>
                </Row>

                <Row style={{ marginTop: 48 }}>
                  <Table
                    style={{ width: "100%" }}
                    dataSource={items}
                    pagination={false}
                  >
                    <Table.Column title="ItemsNumber" dataIndex="id" />
                    <Table.Column
                      title="Image"
                      dataIndex="image"
                      render={(dataIndex) => (
                        <img
                          height="50"
                          width="50"
                          alt={dataIndex}
                          src={dataIndex}
                        />
                      )}
                    ></Table.Column>
                    <Table.Column title="Items" dataIndex="name" />
                    <Table.Column title="Quantity" dataIndex="quantity" />
                    <Table.Column title="Price" dataIndex="price" />
                  </Table>
                </Row>

                <Row style={{ marginTop: 48 }}>
                  <Col span={9} offset={19}>
                    <table>
                      <tr>
                        <th>Total Amount :</th>
                        <td>{orderBill.totalPrice}</td>
                      </tr>
                    </table>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <p style={{ fontWeight: "bold", fontSize: "30px" }}>
              You canceled pay for order bill
            </p>
            <img
              style={{
                backgroundColor: "white",
                height: "200px",
                width: "300px",
              }}
              src="https://icons.veryicon.com/png/o/miscellaneous/jt2/circle-wrong.png"
            ></img>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutVNPAYPage;
