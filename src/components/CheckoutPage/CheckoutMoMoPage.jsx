import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import greenTick from "../../assets/image/greenTick.png";
import { Col, Divider, Row, Table } from "antd";
import { Button } from "@mui/material";
var ranonce = false;
const CheckoutMoMoPage = ({ BE_URL }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [items, setItems] = useState([]);
  const [orderBill, setOrderBill] = useState({});
  const [invoicePage, setInvoicePage] = useState(false);
  const [succes, setSucces] = useState("1");

  useEffect(() => {
    if (!ranonce) {
      const queryParameters = new URLSearchParams(window.location.search);
      const momoStatus = queryParameters.get("resultCode");
      const ordID = queryParameters.get("orderId");
      const requestID = queryParameters.get("requestId");
      const partnerCode = queryParameters.get("partnerCode");
      setSucces(momoStatus);
      const url = BE_URL + "/api/checkoutmomo/status";
      axios
        .post(url, {
          partnerCode: partnerCode,
          orderId: ordID,
          requestId: requestID,
          lang: "vi",
        })
        .then(
          async (res) => {
            if (res.data.resultCode == 0) {
              const urlAPI = BE_URL + "/api/order/find_transaction";
              axios
                .post(urlAPI, {
                  transactionID: ordID,
                })
                .then(
                  async (response) => {
                    if (response.data.success == true) {
                      let ordItem = [];
                      for (
                        let i = 0;
                        i < response.data.orderData.orderItem.length;
                        i++
                      ) {
                        const item = {
                          id: Number(i + 1),
                          productID:
                            response.data.orderData.orderItem[i].productID,
                          name: response.data.orderData.orderItem[i]
                            .productName,
                          price: new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(response.data.orderData.orderItem[i].price),
                          quantity:
                            response.data.orderData.orderItem[i].quantity,
                          image: response.data.orderData.orderItem[i].image,
                        };
                        ordItem.push(item);
                      }
                      const orderCreated = {
                        orderID: response.data.orderData.orderID,
                        orderItem: ordItem,
                        payment: response.data.orderData.payment,
                        totalPrice: new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(response.data.orderData.totalPrice),
                        transactionID: response.data.orderData.transactionID,
                        bankCode: "Napas",
                        cardNumber: "9704 xxxx xxxx 0018",
                        cardHolder: "NGUYEN VAN A",
                        transDate: response.data.orderData.transDate,
                        paymentMethod: response.data.orderData.paymentMethod,
                      };
                      console.log("order exist", orderCreated);
                      console.log("ammout", response.data.orderData.totalPrice);
                      await setOrderBill(orderCreated);
                      await setItems(ordItem);
                    } else {
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
                          uuid: cartList[i].uuid,
                          image: cartList[i].image,
                        };
                        items.push(entity);
                      }
                      const URL_ADDORDER = BE_URL + "/api/order/add_order";
                      axios
                        .post(URL_ADDORDER, {
                          transactionID: res.data.orderId,
                          transDate: res.data.orderId.split("MOMO")[1],
                          totalPrice: res.data.amount,
                          orderItem: items,
                          payment: true,
                          paymentMethod: "MOMO",
                        })
                        .then(
                          async (resAddOrder) => {
                            let ordItem = [];
                            for (
                              let i = 0;
                              i < resAddOrder.data.data.orderItem.length;
                              i++
                            ) {
                              const item = {
                                id: Number(i + 1),
                                productID:
                                  resAddOrder.data.data.orderItem[i].productID,
                                name: resAddOrder.data.data.orderItem[i]
                                  .productName,
                                price: new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(
                                  resAddOrder.data.data.orderItem[i].price
                                ),
                                quantity:
                                  resAddOrder.data.data.orderItem[i].quantity,
                                image: resAddOrder.data.data.orderItem[i].image,
                              };
                              ordItem.push(item);
                            }
                            const orderCreated = {
                              orderID: resAddOrder.data.data.orderID,
                              orderItem: ordItem,
                              payment: resAddOrder.data.data.payment,
                              totalPrice: new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(resAddOrder.data.data.totalPrice),
                              transactionID:
                                resAddOrder.data.data.transactionID,
                              bankCode: "Napas",
                              cardNumber: "9704 xxxx xxxx 0018",
                              cardHolder: "NGUYEN VAN A",
                              transDate: resAddOrder.data.data.transDate,
                              paymentMethod:
                                resAddOrder.data.data.paymentMethod,
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
                currentUrl.split("checkoutmomo")[0] + "customer";
              window.location.replace(customerURL);
            }
            // console.log(res);
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
      <div>
        {succes == "0" ? (
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
                  <h1 style={{ marginLeft: "40%", fontSize: "70px" }}>
                    Invoice
                  </h1>
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
                    <Col span={8} offset={17}>
                      <table>
                        <tr>
                          <th style={{ fontSize: "25px" }}>Total Amount :</th>
                          <td
                            style={{
                              fontSize: "25px",
                              color: "green",
                              fontWeight: "bold",
                            }}
                          >
                            {orderBill.totalPrice}
                          </td>
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
    </div>
  );
};

export default CheckoutMoMoPage;
