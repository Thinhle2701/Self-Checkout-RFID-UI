import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import imageScan from "../../assets/image/placeRFID.jpg";
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3";
import { Button } from "@mui/material";
import Table from "../MobileTable/DataTable";
import { Routes, useLocation } from "react-router-dom";
var mqtt = require("mqtt");
const connectUrl = `wss://broker.emqx.io:8084/mqtt`;
const audio = new Audio(soundScanned);
const client = mqtt.connect(connectUrl, {
  clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
  username: "thinh",
  password: "thinhbeo2801",
});
client.setMaxListeners(100);
const Cart = ({ productList }) => {
  const [mobileCart, setMobileCart] = useState("b2211");
  const [scan, setScan] = useState(false);
  const [productScan, setProductScan] = useState(() => new Set());
  const [productData, setProductData] = useState([]);
  const [total, setTotal] = useState(0);
  const [continueScan, setContinueScan] = useState(true);
  const [scanSound, setScanSound] = useState(false);
  const totalVND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(total);
  const handleStartScan = () => {
    setScan(true);
    window.localStorage.setItem("checkScan", JSON.stringify(true));
    let message = "start to scan " + mobileCart;
    console.log(message);
    client.publish("CheckoutRFID", message);
    client.subscribe(mobileCart);
  };

  function updateLocalStorage() {
    const scanList = Array.from(productScan);
    const totalStorage = window.localStorage.getItem("Total");
    if (JSON.parse(totalStorage) === null) {
      window.localStorage.setItem("RFID", JSON.stringify(scanList));
      window.localStorage.setItem("Cart", JSON.stringify(productData));
      window.localStorage.setItem("Total", JSON.stringify(total));
    } else {
      // window.localStorage.setItem("RFID", JSON.stringify(scanList));
      // window.localStorage.setItem("Cart", JSON.stringify(productData));
      // window.localStorage.setItem("Total", JSON.stringify(total));
      const totalStorageValue = JSON.parse(totalStorage);
      if (Number(totalStorageValue) > Number(total)) {
        console.log("update state");
        setContinueScan(false);
        const RFIDList = JSON.parse(window.localStorage.getItem("RFID"));
        for (let i = 0; i < RFIDList.length; i++) {
          addItem(RFIDList[i]);
        }
        //var RFIDset = new Set(RFIDList);
        // console.log("RFID set: ", productScan);
        const cartList = window.localStorage.getItem("Cart");
        setProductData(JSON.parse(cartList));
        const totalStorage = window.localStorage.getItem("Total");
        setTotal(JSON.parse(totalStorage));
      } else {
        console.log("update storage");
        window.localStorage.setItem("RFID", JSON.stringify(scanList));
        window.localStorage.setItem("Cart", JSON.stringify(productData));
        window.localStorage.setItem("Total", total);
      }
    }
  }

  useEffect(() => {
    const checkScanned = window.localStorage.getItem("checkScan");
    if (JSON.parse(checkScanned) !== null) {
      setScan(JSON.parse(checkScanned));
      if (JSON.parse(checkScanned)) {
        handleStartScan();
        console.log("transfer storage to state");
        const RFIDList = JSON.parse(window.localStorage.getItem("RFID"));
        for (let i = 0; i < RFIDList.length; i++) {
          addItem(RFIDList[i]);
        }
        //var RFIDset = new Set(RFIDList);
        // console.log("RFID set: ", productScan);
        const cartList = window.localStorage.getItem("Cart");
        setProductData(JSON.parse(cartList));
        const totalStorage = window.localStorage.getItem("Total");
        setTotal(JSON.parse(totalStorage));
      }
    }
  }, []);

  useEffect(() => {
    const cartIDParam = window.location.pathname;
    setMobileCart(cartIDParam.split("/")[2]);
    updateLocalStorage();
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
                let newTotal = Number(total) + Number(item.price);
                setTotal(newTotal);
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
                Number(retrieveCart[index].price) +
                Number(retrieveCart[index].price);
              let arrayUUID = retrieveCart[index].uuid;
              arrayUUID.push(newItem[i]);
              retrieveCart[index].uuid = arrayUUID;
              setProductData(retrieveCart);
              let newTotal =
                Number(total) +
                Number(retrieveCart[index].price) /
                  Number(retrieveCart[index].quantity);
              setTotal(newTotal);
            } else {
              for (let j = 0; j < productList.length; j++) {
                if (proID == productList[j].id) {
                  const tableID = "item_" + Number(productData.length + 1);
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
                  let newTotal = Number(total) + Number(item.price);
                  setTotal(newTotal);
                }
              }
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [productScan, productData, total]);

  const addItem = async (item) => {
    await setProductScan((prev) => new Set(prev).add(item));
    // const data = await [...productScan];
    // await console.log("test: ", data);
  };
  function handleOnchange(event) {
    setMobileCart(event.target.value);
  }
  function handleTurnOnAudio() {
    setContinueScan(true);
    setScanSound(true);
    audio.play();
  }

  client.on("message", async function (topic, payload, packet) {
    //var obj = JSON.parse(payload.toString())

    await addItem(payload.toString());
    audio.play();

    //await addToCart(obj)
  });

  const handleClickCheckout = () => {
    const body = {
      amount: 10000,
      bankCode: "",
    };
    axios
      .post("http://localhost:8000/api/checkout/create_payment_url", body)
      .then((response) => {
        console.log(response.status, response.data);
        window.location.replace(response.data);
      });
  };

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
          ></div>
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
              marginTop: "1%",
            }}
          >
            <h1>Cart</h1>
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
              {scanSound === false ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "block",
                    }}
                  >
                    <Button
                      style={{ marginTop: "40%" }}
                      onClick={() => handleTurnOnAudio()}
                    >
                      <h2> Turn on Scan Sound</h2>
                      <img
                        style={{ width: "200px", height: "200px" }}
                        src="https://static.vecteezy.com/system/resources/previews/011/893/995/original/neumorphic-speaker-icon-neumorphism-speaker-button-free-png.png"
                        alt="my image"
                      />
                    </Button>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div>
              {continueScan == false ? (
                <div>
                  <h4
                    style={{
                      position: "absolute",
                      top: "40%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    You have scanned some items
                  </h4>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Button
                      variant="contained"
                      style={{
                        fontSize: "17px",
                        backgroundColor: "red",
                        border: "1px solid red",
                        color: "white",
                      }}
                      className="addToCartBttn"
                      onClick={() => handleTurnOnAudio()}
                    >
                      Continue to Scan
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ width: "60%" }}>
                  <div
                    style={{
                      display: "flex",
                      position: "absolute",
                      top: "45%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Table
                      products={productData}
                      setProductValue={setProductData}
                      RFIDList={productScan}
                      setRFIDList={setProductScan}
                      totalValue={total}
                      setTotalValue={setTotal}
                    />{" "}
                    <div></div>
                  </div>
                  <h2
                    style={{
                      display: "flex",
                      position: "absolute",
                      top: "80%",
                      left: "25%",
                    }}
                  >
                    $Total: {totalVND}
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
