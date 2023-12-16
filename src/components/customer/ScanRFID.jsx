import React, { useState, useEffect } from "react";
import axios from "axios";
import imageScan from "../../assets/image/placeRFID.jpg";
import Table from "../DataTable/DataTable";
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3";
import { Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import Modal from "react-modal";
import AodIcon from "@mui/icons-material/Aod";
import SensorsIcon from "@mui/icons-material/Sensors";
import TextField from "@mui/material/TextField";
import CheckoutInstruction from "../Instruction/CheckoutInstruction";

const askStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "300px",
    width: "500px",
    backgroundColor: "white",
    borderColor: "black",
  },
};

const unsuccessStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "100px",
    width: "100px",
    backgroundColor: "white",
    borderColor: "red",
  },
};

const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "300px",
    width: "510px",
    backgroundColor: "white",
    borderColor: "black",
    marginTop: "100px",
  },
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
var mqtt = require("mqtt");

// const connectUrl = `ws://broker.hivemq.com:8000/mqtt`;
// const connectUrl = `ws://test.mosquitto.org:8080/mqtt`;
// const connectUrl = `wss://mqtt.flespi.io:443`
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

const ScanRFID = ({ productList, BE_URL }) => {
  const [checkoutCounter, setCheckoutCounter] = useState("b2211");
  const [scan, setScan] = useState(false);
  const [productScan, setProductScan] = useState(() => new Set());
  const [productData, setProductData] = useState([]);
  const [total, setTotal] = useState(0);
  const [continueScan, setContinueScan] = useState(true);
  const [scanSound, setScanSound] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [clickMomo, setClickMomo] = useState(false);
  const [backButton, setBackButton] = useState(false);
  const [inputCartModal, setInputCartModal] = useState(false);
  const [cartID, setCartID] = useState("");
  const [errorCart, setErrorCart] = useState(false);
  const [errorScan, setErrorScan] = useState(false);

  const handleStartScan = () => {
    setScan(true);
    window.localStorage.setItem("checkScan", JSON.stringify(true));
    let message = "start to scan " + checkoutCounter;
    console.log(message);
    client.publish("ReadRFIDTag", message);
    client.subscribe(checkoutCounter);
  };
  const totalVND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(total);

  const removeItemSet = (foo) => {
    setProductScan((prev) => new Set([...prev].filter((x) => x !== foo)));
  };

  function updateLocalStorage() {
    const scanList = Array.from(productScan);
    const totalStorage = window.localStorage.getItem("Total");
    if (JSON.parse(totalStorage) === null) {
      window.localStorage.setItem("RFID", JSON.stringify(scanList));
      window.localStorage.setItem("Cart", JSON.stringify(productData));
      window.localStorage.setItem("Total", JSON.stringify(total));
    } else {
      const totalStorageValue = JSON.parse(totalStorage);
      if (Number(totalStorageValue) > Number(total)) {
        console.log("update state");
        setContinueScan(false);
        const RFIDList = JSON.parse(window.localStorage.getItem("RFID"));
        for (let i = 0; i < RFIDList.length; i++) {
          addItem(RFIDList[i]);
        }
        const cartList = window.localStorage.getItem("Cart");
        setProductData(JSON.parse(cartList));
        const totalStorage = window.localStorage.getItem("Total");
        setTotal(JSON.parse(totalStorage));
      } else {
        console.log("update storage");
        window.localStorage.setItem("RFID", JSON.stringify(scanList));
        window.localStorage.setItem("Cart", JSON.stringify(productData));
        window.localStorage.setItem("Total", total);
        const checkCartExpire = JSON.parse(
          window.localStorage.getItem("CartExpireTime")
        );
        if (checkCartExpire === null) {
          const cartTime = new Date().getTime();
          window.localStorage.setItem("CartExpireTime", cartTime);
        }
      }
    }
  }

  useEffect(() => {
    const checkScanned = window.localStorage.getItem("checkScan");

    if (JSON.parse(checkScanned) !== null) {
      setScan(JSON.parse(checkScanned));
      if (JSON.parse(checkScanned)) {
        const checkCartExpire = JSON.parse(
          window.localStorage.getItem("CartExpireTime")
        );
        const currentTime = new Date().getTime();

        const timeDifference = Math.abs(currentTime - checkCartExpire);
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );
        console.log("m", minutes);
        console.log("h", hours);
        if (minutes < 30 && hours === 0) {
          handleStartScan();
          console.log("transfer storage to state");
          const RFIDList = JSON.parse(window.localStorage.getItem("RFID"));
          for (let i = 0; i < RFIDList.length; i++) {
            addItem(RFIDList[i]);
          }
          const cartList = window.localStorage.getItem("Cart");
          setProductData(JSON.parse(cartList));
          const totalStorage = window.localStorage.getItem("Total");
          setTotal(JSON.parse(totalStorage));
        } else {
          console.log("expire cart");
          window.localStorage.clear();
          window.location.reload();
        }
      }
    }
  }, []);

  useEffect(() => {
    updateLocalStorage();
    const interval = setInterval(async () => {
      const scanList = Array.from(productScan);
      // console.log("array: ",productData.length)
      // console.log("set: ",scanList.length)
      var uuidList = [];
      for (let i = 0; i < productData.length; i++) {
        uuidList = uuidList.concat(productData[i].uuid);
      }
      var difference = scanList.filter((x) => uuidList.indexOf(x) === -1);
      if (difference.length > 0) {
        if (productData.length === 0) {
          for (let i = 0; i < scanList.length; i++) {
            let proID = scanList[i].split("||")[1];
            let uuid = scanList[i].split("||")[0];
            //verifyRFID tag
            const url = BE_URL + "/api/rfid/verifyTag";
            axios
              .post(url, {
                uuid: uuid,
                productID: proID,
                // uuid: "12323",
                // productID: "212321",
              })
              .then((res) => {
                const tableID = "item_1";
                var uuidArr = [];
                uuidArr.push(scanList[i]);
                var item = {
                  id: tableID,
                  itemnumber: i + 1,
                  productID: res.data.productID,
                  name: res.data.name,
                  image: res.data.image,
                  quantity: 1,
                  price: res.data.price,
                  uuid: uuidArr,
                };
                setProductData((oldArray) => [...oldArray, item]);
                let newTotal = Number(total) + Number(item.price);
                setTotal(newTotal);
                const cartTime = new Date().getTime();
                window.localStorage.setItem("CartExpireTime", cartTime);
              })
              .catch(async (error) => {
                console.log(error.response);
                setErrorScan(true);
                if (error.response.status === 400) {
                  await removeItemSet(scanList[i]);
                  await delay(1000);
                  setErrorScan(false);
                }
              });
          }
        } else {
          var arrUUID = [];
          for (let i = 0; i < productData.length; i++) {
            arrUUID = arrUUID.concat(productData[i].uuid);
          }

          var newItem = [];
          for (let i = 0; i < scanList.length; i++) {
            if (arrUUID.includes(scanList[i]) === false) {
              newItem.push(scanList[i]);
            }
          }

          for (let i = 0; i < newItem.length; i++) {
            let proID = newItem[i].split("||")[1];
            let uuid = newItem[i].split("||")[0];

            //verifyRFID tag
            const url = BE_URL + "/api/rfid/verifyTag";
            axios
              .post(url, {
                uuid: uuid,
                productID: proID,
              })
              .then((res) => {
                const index = productData.findIndex((object) => {
                  return object.productID === proID;
                });
                if (index >= 0) {
                  console.log("add quantity");
                  var retrieveCart = [...productData];

                  retrieveCart[index].price =
                    Number(retrieveCart[index].price) +
                    Number(retrieveCart[index].price) /
                      Number(retrieveCart[index].quantity);
                  retrieveCart[index].quantity =
                    retrieveCart[index].quantity + 1;

                  let arrayUUID = retrieveCart[index].uuid;
                  arrayUUID.push(newItem[i]);
                  retrieveCart[index].uuid = arrayUUID;
                  setProductData(retrieveCart);
                  console.log("price ", Number(retrieveCart[index].price));
                  console.log("qty", Number(retrieveCart[index].quantity));
                  let newTotal =
                    Number(total) +
                    Number(retrieveCart[index].price) /
                      Number(retrieveCart[index].quantity);
                  console.log("new total: ", newTotal);
                  setTotal(newTotal);
                  const cartTime = new Date().getTime();
                  window.localStorage.setItem("CartExpireTime", cartTime);
                } else {
                  const tableID = "item_" + Number(productData.length + 1);
                  const uuidArr = [];
                  uuidArr.push(newItem[i]);
                  var itemObj = {
                    id: tableID,
                    itemnumber: Number(productData.length + 1),
                    productID: res.data.productID,
                    name: res.data.name,
                    image: res.data.image,
                    quantity: 1,
                    price: res.data.price,
                    uuid: uuidArr,
                  };
                  setProductData((oldArray) => [...oldArray, itemObj]);
                  let newTotal = Number(total) + Number(itemObj.price);
                  setTotal(newTotal);
                  const cartTime = new Date().getTime();
                  window.localStorage.setItem("CartExpireTime", cartTime);
                }
              })
              .catch(async (error) => {
                console.log(error.response);
                setErrorScan(true);
                if (error.response.status === 400) {
                  await removeItemSet(scanList[i]);
                  await delay(1000);
                  setErrorScan(false);
                }
              });
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [productScan, productData, total, productList]);

  const addItem = async (item) => {
    if (item === "") {
      console.log("blank RFID tag");
    } else {
      await setProductScan((prev) => new Set(prev).add(item));
    }

    // const data = await [...productScan];
    // await console.log("test: ", data);
  };

  function handleOnchange(event) {
    setCheckoutCounter(event.target.value);
  }
  function handleTurnOnAudio() {
    setScanSound(true);
    setContinueScan(true);
    audio.play();
  }

  client.on("message", async function (topic, payload, packet) {
    //var obj = JSON.parse(payload.toString())

    await addItem(payload.toString());
    audio.play();

    //await addToCart(obj)
  });

  const handleClickCheckout = () => {
    setCheckoutModal(true);
  };

  const handleClickCheckoutVNPAY = () => {
    const body = {
      amount: total,
      bankCode: "",
    };
    const url = BE_URL + "/api/checkoutvnp/create_payment_url";
    axios.post(url, body).then(
      (response) => {
        console.log(response.status, response.data);
        window.location.replace(response.data);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleClickMomo = () => {
    setClickMomo(true);
    setBackButton(true);
  };

  const handleOnClickMomoQRcode = () => {
    const body = {
      amount: total,
    };
    const url = BE_URL + "/api/checkoutmomo/qrcode";
    axios.post(url, body).then(
      async (response) => {
        console.log(response);
        await delay(2000);
        window.location.replace(response.data);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleOnClickMomoATM = () => {
    const body = {
      amount: total,
    };
    const url = BE_URL + "/api/checkoutmomo/atm";
    axios.post(url, body).then(
      async (response) => {
        console.log(response);
        await delay(2000);
        window.location.replace(response.data);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleClickCancleInput = () => {
    setCartID("");
    setInputCartModal(false);
  };

  const handleClickSubmit = () => {
    if (cartID !== "") {
      const url = BE_URL + "/api/cart/verify/" + cartID;
      axios.get(url).then(
        async (response) => {
          setScan(true);
          window.localStorage.setItem("checkScan", JSON.stringify(true));
          let message = "start to scan " + checkoutCounter;
          client.publish("CheckoutRFID", message);
          client.subscribe(checkoutCounter);
          setProductData(response.data.cartItem);
          const setListRFID = new Set(response.data.RFID);
          setProductScan(setListRFID);
          setTotal(Number(response.data.totalPrice));
          console.log(response);
        },
        (error) => {
          console.log("err", error);
        }
      );
    }
  };

  return (
    <div>
      {errorScan === true ? (
        <>
          <Modal isOpen={errorScan} style={unsuccessStyles} ariaHideApp={false}>
            <img
              style={{
                height: "40px",
                width: "50px",
                display: "block",
                textAlign: "center",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Cross_red_circle.svg/1200px-Cross_red_circle.svg.png"
            ></img>
            <p
              style={{
                textAlign: "center",
                color: "red",
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "23px",
              }}
            >
              Invalid Item
            </p>
          </Modal>
        </>
      ) : (
        <></>
      )}
      {scan === false ? (
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
            <button
              className="addToCartBttn"
              style={{ marginRight: "100px" }}
              onClick={() => handleStartScan()}
            >
              <SensorsIcon style={{ fontSize: "50px" }} />
              <p style={{ fontSize: "15px" }}> Click to Start Scanning</p>
            </button>

            <button
              className="addToCartBttn"
              style={{ fontSize: "15px" }}
              onClick={() => {
                setInputCartModal(true);
              }}
            >
              <AodIcon style={{ fontSize: "50px" }} />
              <p> Get Item From Mobile Cart</p>
            </button>
          </div>

          {inputCartModal === true ? (
            <>
              <Modal
                isOpen={inputCartModal}
                style={customStyles}
                ariaHideApp={false}
              >
                <div>
                  {" "}
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
                      setInputCartModal(false);
                    }}
                  >
                    X
                  </button>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "-40px",
                      fontSize: "17px",
                      marginTop: "20px",
                    }}
                  >
                    <h2>Transfer Mobile Cart To Self-Checkout</h2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "-40px",
                      fontSize: "17px",
                      marginTop: "11%",
                    }}
                  >
                    <TextField
                      id="outlined-helperText"
                      label="Input Your CartID"
                      placeholder="CartID"
                      helperText="CartID From Mobile Cart"
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setErrorCart(false);
                        }
                        setCartID(e.target.value);
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "-40px",
                      fontSize: "17px",
                      marginTop: "40px",
                    }}
                  >
                    {errorCart === true ? (
                      <>
                        <p style={{ color: "red", fontWeight: "bold" }}>
                          ❌ Invalid CartID
                        </p>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "-40px",
                      fontSize: "17px",
                      marginTop: "14%",
                    }}
                  >
                    <Button
                      variant="outlined"
                      style={{ border: "1px solid black", color: "black" }}
                      onClick={() => {
                        handleClickCancleInput();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        marginLeft: "30%",
                        width: "100px",
                      }}
                      onClick={() => {
                        handleClickSubmit();
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </Modal>
            </>
          ) : (
            <></>
          )}
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
            <h1>Self Checkout Item List</h1>
          </div>
          {productData.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div>
                <CheckoutInstruction />
              </div>
              {scanSound === false ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "80%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "block",
                    }}
                  >
                    <Button
                      style={{ marginTop: "40%" }}
                      onClick={() => handleTurnOnAudio()}
                    >
                      <img
                        style={{ width: "300px", height: "200px" }}
                        src="https://th.bing.com/th/id/R.d124b43c4d7cb0fc45418947fb58e0cd?rik=AJfpSXpHLICvIw&pid=ImgRaw&r=0"
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
              {continueScan === false ? (
                <div>
                  <h4
                    style={{
                      position: "absolute",
                      top: "40%",
                      left: "52%",
                      transform: "translate(-50%, -50%)",
                      width: "300px",
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
                      width: "200px",
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
                      top: "50%",
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
                  <div
                    style={{
                      display: "block",
                      position: "absolute",
                      top: "85%",
                      left: "50%",
                      marginLeft: "20%",
                    }}
                  >
                    <h2 style={{}}>$Total: {totalVND}</h2>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: "green",
                        width: "200px",
                      }}
                      onClick={() => handleClickCheckout()}
                    >
                      Checkout
                    </Button>

                    <Modal
                      isOpen={checkoutModal}
                      style={askStyles}
                      ariaHideApp={false}
                    >
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
                            setCheckoutModal(false);
                            setClickMomo(false);
                          }}
                        >
                          X
                        </button>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "-40px",
                            fontSize: "20px",
                          }}
                        >
                          <h2>Select Payment Method</h2>
                        </div>

                        <div
                          style={{
                            marginTop: "5%",
                            marginLeft: "15%",
                            display: "flex",
                          }}
                        >
                          {backButton === true ? (
                            <>
                              {" "}
                              <Button
                                style={{
                                  position: "absolute",
                                  left: "-5px",
                                  fontSize: "40px",
                                  marginTop: "100px",
                                }}
                                onClick={() => {
                                  setBackButton(false);
                                  setClickMomo(false);
                                }}
                              >
                                🔙
                              </Button>
                              <Button
                                style={{ display: "block" }}
                                onClick={() => {
                                  handleClickMomo();
                                }}
                              >
                                <h3
                                  style={{
                                    color: "#ff0066",
                                    fontWeight: "bold",
                                    fontSize: "20px",
                                  }}
                                >
                                  Momo
                                </h3>
                                <img
                                  src="https://avatars.githubusercontent.com/u/36770798?s=280&v=4"
                                  width={100}
                                  height={100}
                                  alt="description"
                                ></img>
                              </Button>
                              {clickMomo === true ? (
                                <>
                                  <div
                                    style={{
                                      marginLeft: "20%",
                                      marginTop: "10%",
                                    }}
                                  >
                                    <Button
                                      style={{
                                        display: "flex",
                                        border: "1px solid red",
                                      }}
                                      onClick={() => {
                                        handleOnClickMomoQRcode();
                                      }}
                                    >
                                      <h3
                                        style={{
                                          color: "red",
                                          fontWeight: "bold",
                                          fontSize: "12px",
                                        }}
                                      >
                                        MOMO QRcode
                                      </h3>
                                      <img
                                        src="https://t3.ftcdn.net/jpg/02/23/88/58/360_F_223885881_Zotk7yyvWJDvq6iWq2A9XU60iVJEnrzC.jpg"
                                        width={80}
                                        height={60}
                                        alt="description"
                                      ></img>
                                    </Button>

                                    <Button
                                      style={{
                                        display: "flex",
                                        border: "1px solid blue",
                                        marginTop: "10px",
                                        paddingRight: "15px",
                                      }}
                                      onClick={() => {
                                        handleOnClickMomoATM();
                                      }}
                                    >
                                      <h3
                                        style={{
                                          color: "#6666ff",
                                          fontWeight: "bold",
                                          fontSize: "12px",
                                        }}
                                      >
                                        Momo ATM
                                      </h3>
                                      <img
                                        style={{ marginLeft: "20px" }}
                                        src="https://th.bing.com/th/id/OIP.2KgJVfVl-6IQVRasNvbCyQHaHa?pid=ImgDet&rs=1"
                                        width={80}
                                        height={60}
                                        alt="description"
                                      ></img>
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Button
                                    style={{
                                      display: "block",
                                      marginLeft: "35%",
                                    }}
                                    onClick={() => {
                                      handleClickCheckoutVNPAY();
                                    }}
                                  >
                                    <h3
                                      style={{
                                        color: "#6666ff",
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                      }}
                                    >
                                      VNPAY
                                    </h3>
                                    <img
                                      src="https://play-lh.googleusercontent.com/o-_z132f10zwrco4NXk4sFqmGylqXBjfcwR8-wK0lO1Wk4gzRXi4IZJdhwVlEAtpyQ"
                                      width={100}
                                      height={100}
                                      alt="description"
                                    ></img>
                                  </Button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                style={{ display: "block" }}
                                onClick={() => {
                                  handleClickMomo();
                                }}
                              >
                                <h3
                                  style={{
                                    color: "#ff0066",
                                    fontWeight: "bold",
                                    fontSize: "20px",
                                  }}
                                >
                                  Momo
                                </h3>
                                <img
                                  src="https://avatars.githubusercontent.com/u/36770798?s=280&v=4"
                                  width={100}
                                  height={100}
                                  alt="description"
                                ></img>
                              </Button>

                              {clickMomo === true ? (
                                <>
                                  <div
                                    style={{
                                      marginLeft: "20%",
                                      marginTop: "10%",
                                    }}
                                  >
                                    <Button
                                      style={{
                                        display: "flex",
                                        border: "1px solid red",
                                      }}
                                      onClick={() => {
                                        console.log("QRcode");
                                      }}
                                    >
                                      <h3
                                        style={{
                                          color: "red",
                                          fontWeight: "bold",
                                          fontSize: "12px",
                                        }}
                                      >
                                        MOMO QRcode
                                      </h3>
                                      <img
                                        src="https://t3.ftcdn.net/jpg/02/23/88/58/360_F_223885881_Zotk7yyvWJDvq6iWq2A9XU60iVJEnrzC.jpg"
                                        width={80}
                                        height={60}
                                        alt="description"
                                      ></img>
                                    </Button>

                                    <Button
                                      style={{
                                        display: "flex",
                                        border: "1px solid blue",
                                        marginTop: "10px",
                                        paddingRight: "15px",
                                      }}
                                      onClick={() => {
                                        console.log("QRcode");
                                      }}
                                    >
                                      <h3
                                        style={{
                                          color: "#6666ff",
                                          fontWeight: "bold",
                                          fontSize: "12px",
                                        }}
                                      >
                                        Momo ATM
                                      </h3>
                                      <img
                                        style={{ marginLeft: "20px" }}
                                        src="https://th.bing.com/th/id/OIP.2KgJVfVl-6IQVRasNvbCyQHaHa?pid=ImgDet&rs=1"
                                        width={80}
                                        height={60}
                                        alt="description"
                                      ></img>
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Button
                                    style={{
                                      display: "block",
                                      marginLeft: "30%",
                                    }}
                                    onClick={() => {
                                      handleClickCheckoutVNPAY();
                                    }}
                                  >
                                    <h3
                                      style={{
                                        color: "#6666ff",
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                      }}
                                    >
                                      VNPAY
                                    </h3>
                                    <img
                                      src="https://play-lh.googleusercontent.com/o-_z132f10zwrco4NXk4sFqmGylqXBjfcwR8-wK0lO1Wk4gzRXi4IZJdhwVlEAtpyQ"
                                      width={100}
                                      height={100}
                                      alt="description"
                                    ></img>
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Modal>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanRFID;
