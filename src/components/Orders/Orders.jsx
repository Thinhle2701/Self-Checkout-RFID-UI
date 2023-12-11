import React, { useEffect, useState } from "react";
import { Typography, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import OrderItem from "./OrderItem/OrderItem";
const Orders = ({ urlApi }) => {
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dateValueNormal = (dateCurr) => {
    //"2023-12-04T07:22:30.243+00:00"
    const date = new Date(dateCurr);
    let dateStr = date.toLocaleString();
    return dateStr;
  };
  const fetchOrder = () => {
    const url = urlApi + "/api/order";
    axios
      .get(url)
      .then((response) => {
        console.log("res:", response.data);

        const dateValue = dateValueNormal("2023-12-04T07:22:30.243+00:00");
        console.log(dateValue);
        setOrderList(response.data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchOrder();
  }, []);
  console.log(orderList);
  return (
    <>
      <div>
        {orderList.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "20%" }}>
            <p>You do not have any order</p>
          </div>
        ) : (
          <div>
            <Typography
              variant="h6"
              gutterBottom
              style={{
                fontSize: "30px",
                marginTop: "50px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Order History 🏪
            </Typography>

            {orderList.map((ord) => (
              <div key={ord.orderID}>
                <OrderItem
                  detail={ord.orderItem}
                  orderItemValue={ord}
                  setIsLoading={setIsLoading}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
