import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Col, Divider, Row, Table } from "antd";

const Invoice = ({ BE_URL }) => {
  const [orderBill, setOrderBill] = useState({});
  const [items, setItems] = useState([]);
  const totalVND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(orderBill.totalPrice);

  const dateValueNormal = (dateCurr) => {
    //"2023-12-04T07:22:30.243+00:00"
    const date = new Date(dateCurr);
    let dateStr = date.toLocaleString();
    return dateStr;
  };

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const orderID = queryParameters.get("orderID");
    console.log(orderID);
    const url = BE_URL + "/api/order/review_invoice/" + orderID;
    axios
      .get(url)
      .then((response) => {
        console.log(response.data);
        let ordItem = [];
        for (let i = 0; i < response.data.orderItem.length; i++) {
          const item = {
            id: Number(i + 1),
            productID: response.data.orderItem[i].productID,
            name: response.data.orderItem[i].productName,
            price: new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(response.data.orderItem[i].price),
            quantity: response.data.orderItem[i].quantity,
            image: response.data.orderItem[i].image,
          };
          ordItem.push(item);
        }
        setOrderBill(response.data);
        setItems(ordItem);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginLeft: "40%", fontSize: "50px" }}>Invoice</h1>
        <Row gutter={24} style={{ marginTop: 32 }}>
          <Col span={8}>
            <h3 style={{ fontSize: "25px" }}>Order Information</h3>
            <div style={{ fontSize: "20px" }}>
              Invoice : {orderBill.orderID}
            </div>
            <div style={{ fontSize: "20px" }}>
              Invoice Date: {dateValueNormal(orderBill.orderDate)}
            </div>

            <div style={{ fontSize: "20px" }}>
              Payment Method :{orderBill.paymentMethod}
            </div>
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
                <img height="50" width="50" alt={dataIndex} src={dataIndex} />
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
                  {totalVND}
                </td>
              </tr>
            </table>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Invoice;
