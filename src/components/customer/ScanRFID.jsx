import React, { useState, useEffect } from "react";
import axios from "axios";
import imageScan from "../../assets/image/placeRFID.jpg";
import Table from "../DataTable/DataTable";
import { Routes, useLocation } from "react-router-dom";
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3";
import { v1 as uuidv1 } from "uuid";
import { Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
var mqtt = require("mqtt");

const connectUrl = `wss://broker.emqx.io:8084/mqtt`;
const audio = new Audio(soundScanned);
const client = mqtt.connect(connectUrl, {
  clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
  username: "thinh",
  password: "thinhbeo2801",
});
client.setMaxListeners(100);
// client.on('connect', function () {
//   client.subscribe('scanRFID', function (err) {
//     if (err) {
//       console.log(err);
//     }
//   })

// })

const ScanRFID = ({ productList }) => {
  const [checkoutCounter, setCheckoutCounter] = useState("b2211");
  const [scan, setScan] = useState(false);
  const [productScan, setProductScan] = useState(() => new Set());
  const [productData, setProductData] = useState([]);
  const [execute, setExecute] = useState(false);
  const handleStartScan = () => {
    // const topic = "scanRFID";
    // axios.post('http://localhost:8000/api/rfid/start_scan', {
    //   deviceID: 'b2211',
    // })
    // .then((response) => {
    //   console.log(response);
    //   client.subscribe(topic)

    // }, (error) => {
    //   console.log(error);
    // });
    setScan(true);
    let message = "start to scan " + checkoutCounter;
    console.log(message);
    client.publish("CheckoutRFID", message);
    client.subscribe(checkoutCounter);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const scanList = Array.from(productScan);
      // console.log("array: ",productData.length)
      // console.log("set: ",scanList.length)
      var uuidList = [];
      for (let i = 0; i < productData.length; i++) {
        uuidList = uuidList.concat(productData[i].uuid);
      }
      var difference = scanList.filter((x) => uuidList.indexOf(x) === -1);
      if (difference.length > 0) {
        if (productData.length == 0) {
          for (let i = 0; i < scanList.length; i++) {
            let proID = scanList[i].split("||")[1];
            for (let j = 0; j < productList.length; j++) {
              if (proID == productList[j].id) {
                const tableID = "item_1";
                var uuidArr = [];
                uuidArr.push(scanList[i]);
                var item = {
                  id: tableID,
                  itemnumber: i + 1,
                  productID: productList[j].id,
                  name: productList[j].name,
                  image: productList[j].image,
                  quantity: 1,
                  price: productList[j].price,
                  uuid: uuidArr,
                };
                setProductData((oldArray) => [...oldArray, item]);
              }
            }
          }
        } else {
          var arrUUID = [];
          for (let i = 0; i < productData.length; i++) {
            arrUUID = arrUUID.concat(productData[i].uuid);
          }

          var newItem = [];
          for (let i = 0; i < scanList.length; i++) {
            if (arrUUID.includes(scanList[i]) == false) {
              newItem.push(scanList[i]);
            }
          }

          for (let i = 0; i < newItem.length; i++) {
            let proID = newItem[i].split("||")[1];
            const index = productData.findIndex((object) => {
              return object.productID === proID;
            });
            if (index >= 0) {
              console.log("add quantity");
              var retrieveCart = [...productData];
              retrieveCart[index].quantity = retrieveCart[index].quantity + 1;
              retrieveCart[index].price =
                Number(retrieveCart[index].price.split("$")[0]) +
                Number(retrieveCart[index].price.split("$")[0]) +
                "$";
              let arrayUUID = retrieveCart[index].uuid;
              arrayUUID.push(newItem[i]);
              retrieveCart[index].uuid = arrayUUID;
              setProductData(retrieveCart);
            } else {
              for (let j = 0; j < productList.length; j++) {
                if (proID == productList[j].id) {
                  const tableID = "item_" + productData.length + 1;
                  const uuidArr = [];
                  uuidArr.push(newItem[i]);
                  var item = {
                    id: tableID,
                    itemnumber: Number(productData.length + 1),
                    productID: productList[j].id,
                    name: productList[j].name,
                    image: productList[j].image,
                    quantity: 1,
                    price: productList[j].price,
                    uuid: uuidArr,
                  };
                  setProductData((oldArray) => [...oldArray, item]);
                }
              }
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [productScan, productData]);

  const addItem = async (item) => {
    await setProductScan((prev) => new Set(prev).add(item));
  };

  function handleOnchange(event) {
    setCheckoutCounter(event.target.value);
  }

  client.on("message", async function (topic, payload, packet) {
    //var obj = JSON.parse(payload.toString())
    await addItem(payload.toString());
    audio.play();
    //await addToCart(obj)
  });
  console.log(productData);

  return (
    <div>
      {scan == false ? (
        <div>
          <div
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              marginTop: "10%",
            }}
          >
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={checkoutCounter}
              label="Age"
              onChange={(e) => handleOnchange(e)}
            >
              <MenuItem value="b2211">Counter 1</MenuItem>
            </Select>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <button className="addToCartBttn" onClick={() => handleStartScan()}>
              CLick to Start scanning
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <h1>Self Checkout Item List</h1>
          </div>
          {productData.length == 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img height={250} src={imageScan}></img>
            </div>
          ) : (
            <div>
              <div style={{ width: "50%", marginLeft: "30%" }}>
                <Table products={productData} />{" "}
                <Button
                  variant="contained"
                  style={{
                    marginLeft: "80%",
                    backgroundColor: "red",
                    width: "200px",
                    marginTop: "20px",
                  }}
                >
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanRFID;
