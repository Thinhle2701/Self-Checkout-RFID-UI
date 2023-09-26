import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import imageScan from "../../assets/image/placeRFID.jpg";
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3";
import { Button } from "@mui/material";
import Table from "../MobileTable/DataTable";
import { Routes, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "400px",
    width: "310px",
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
    height: "80px",
    width: "100px",
    backgroundColor: "white",
    borderColor: "red",
  },
};

const warningStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "100px",
    width: "120px",
    backgroundColor: "white",
    borderColor: "black",
  },
};

var mqtt = require("mqtt");
const connectUrl = `wss://broker.emqx.io:8084/mqtt`;
const audio = new Audio(soundScanned);
const client = mqtt.connect(connectUrl, {
  clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
  username: "thinh",
  password: "thinhbeo2801",
});
client.setMaxListeners(100);
const Cart = ({ productList, BE_URL }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [mobileCart, setMobileCart] = useState("b2211");
  const [scan, setScan] = useState(false);
  const [productScan, setProductScan] = useState(() => new Set());
  const [productData, setProductData] = useState([]);
  const [total, setTotal] = useState(0);
  const [continueScan, setContinueScan] = useState(true);
  const [scanSound, setScanSound] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalWarningOpen, setModalWarningOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [productModal, setProductModal] = useState({});
  const [transferModal, setTransferModal] = useState(false);
  const [cartID, setCartID] = useState("");
  const [timer, setTimer] = useState(0);
  const [verifyCart, setVerifyCart] = useState(false);
  const [timeAvaiable, setTimeAvaiable] = useState(true);
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

  const notify = () => toast("Successfully Add to Cart");

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeAvaiable == true && transferModal == true) {
        if (verifyCart == false) {
          const url = "http://localhost:8000/api/cart/check_verify/" + cartID;

          axios.get(url).then((response) => {
            if (response.data.success == true) {
              setVerifyCart(true);
            }
            console.log("res: ", response);
          });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [timeAvaiable, transferModal, verifyCart, cartID]);
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

  function RetrieveProduct(uuid) {
    if (productModal.uuid != uuid) {
      console.log(uuid);
      const url = "http://localhost:8000/api/product/" + uuid.split("||")[1];
      axios
        .get(url)
        .then(async (res) => {
          console.log("res ne: ", res);
          if (res.status == 200) {
            var obj = {
              name: res.data.name,
              price: res.data.price,
              image: res.data.image,
              uuid: uuid,
            };
            await setProductModal(obj);
            await setModalOpen(true);
          }
        })
        .catch(async (error) => {
          await delay(200);
          await setModalErrorOpen(true);
          await delay(2000);
          await setModalErrorOpen(false);
        });
    }
  }

  client.on("message", async function (topic, payload, packet) {
    //var obj = JSON.parse(payload.toString())
    var flag = false;
    if (flag === false && modalOpen === false) {
      await RetrieveProduct(payload.toString());
      audio.play();
      flag = true;
    }
    //await addItem(payload.toString());

    //await addToCart(obj)
  });

  const handleTransferToCheckoutCart = () => {
    const url = BE_URL + "/api/cart/add_cart";
    axios
      .post(url, {
        cartItem: productData,
        totalPrice: total,
        RFID: Array.from(productScan),
      })
      .then(async (res) => {
        {
          setCartID(res.data.data.cartID);
          setTransferModal(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const checkVerifyCart = async () => {
    var flag = false;
    if (flag == false) {
      await delay(5000);
      flag = true;
    }

    if (flag == true) {
      console.log("hello");
      flag = false;
    }
  };

  const renderTime = ({ remainingTime }) => {
    if (remainingTime === 0) {
      const url = BE_URL + "/api/cart/delete/" + cartID;
      axios
        .delete(url)
        .then(function (response) {
          console.log(response);
          setCartID("");
          setTransferModal(false);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
      return <div className="timer">Your Cart is expired</div>;
    } else {
      //checkVerifyCart();
    }

    return (
      <div
        style={{
          fontFamily: "Montserrat",
          display: "flex",
          flexDirection: "column",
          alignIitems: "center",
        }}
      >
        <div
          style={{ color: "#aaa", fontFamily: "fontFamily", fontSize: "20px" }}
        >
          Remaining
          {}
        </div>
        <div
          style={{
            fontSize: "60px",
            fontFamily: "Montserrat",
            color: "#000066",
            marginTop: "10px",
            fontWeight: "bold",
            marginLeft: "2px",
          }}
        >
          {remainingTime}
        </div>
        <div
          style={{
            color: "#aaa",
            fontFamily: "fontFamily",
            fontSize: "20px",

            marginLeft: "10px",
          }}
        >
          seconds
        </div>
      </div>
    );
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
          {modalOpen === true ? (
            <>
              {" "}
              <Modal
                isOpen={modalOpen}
                style={customStyles}
                ariaHideApp={false}
              >
                <div>
                  <h1
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      display: "flex",
                    }}
                  >
                    Product Details
                  </h1>

                  <ul>
                    <li style={{}}>
                      <div style={{ display: "flex" }}>
                        <p>Product Name : </p>
                        <p>&nbsp;</p>
                        <p style={{ fontWeight: "bold" }}>
                          {productModal.name}
                        </p>
                      </div>{" "}
                    </li>
                    <li>
                      {" "}
                      <div style={{ display: "flex" }}>
                        <p>Price: </p>
                        <p>&nbsp;</p>
                        <p style={{ fontWeight: "bold" }}>
                          {" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(productModal.price)}
                        </p>
                      </div>{" "}
                    </li>
                  </ul>

                  <img
                    style={{
                      marginLeft: "50px",
                    }}
                    src={productModal.image}
                    width={200}
                    height={180}
                  />
                </div>

                <div
                  style={{
                    display: "block",
                    marginLeft: "5%",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setModalOpen(false);
                      setProductModal({});
                    }}
                    style={{ border: "1px solid black", color: "black" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      marginLeft: "24%",
                    }}
                    onClick={async () => {
                      if (productScan.has(productModal.uuid)) {
                        await delay(200);
                        await setModalWarningOpen(true);
                        await delay(2000);
                        setModalWarningOpen(false);
                        await setModalOpen(false);
                        await setProductModal({});
                      } else {
                        await addItem(productModal.uuid);
                        setModalOpen(false);
                        setProductModal({});
                        await notify();
                      }
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Modal>
            </>
          ) : (
            <></>
          )}

          {modalErrorOpen === true ? (
            <>
              <Modal
                isOpen={modalErrorOpen}
                style={unsuccessStyles}
                ariaHideApp={false}
              >
                <img
                  style={{
                    height: "40px",
                    width: "40px",
                    display: "block",
                    textAlign: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  src="https://icons.veryicon.com/png/System/Small%20%26%20Flat/sign%20error.png"
                ></img>
                <p
                  style={{
                    textAlign: "center",
                    color: "red",
                    fontSize: "16px",
                  }}
                >
                  Invalid Item
                </p>
              </Modal>{" "}
            </>
          ) : (
            <></>
          )}

          {modalWarningOpen === true ? (
            <>
              <Modal
                isOpen={modalWarningOpen}
                style={warningStyles}
                ariaHideApp={false}
              >
                <img
                  style={{
                    height: "60px",
                    width: "60px",
                    display: "block",
                    textAlign: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  src="https://cdn0.iconfinder.com/data/icons/staff-management-4/60/exclamation__error__warning__alert__sign-512.png"
                ></img>
                <p
                  style={{
                    textAlign: "center",
                    color: "black",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Already Existed
                </p>
              </Modal>{" "}
            </>
          ) : (
            <></>
          )}
          <div
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              marginTop: "10%",
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
                      display: "block",
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
                      display: "block",
                      position: "absolute",
                      top: "80%",
                      left: "25%",
                    }}
                  >
                    $Total: {totalVND}
                    <div
                      style={{
                        marginTop: "10%",
                      }}
                    >
                      <Button
                        variant="contained"
                        style={{ fontSize: "14px" }}
                        onClick={handleTransferToCheckoutCart}
                      >
                        Transfer to Checkout
                      </Button>
                    </div>
                    {transferModal === true ? (
                      <>
                        <Modal
                          isOpen={transferModal}
                          style={customStyles}
                          ariaHideApp={false}
                        >
                          <div>
                            <h1
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                display: "flex",
                              }}
                            >
                              Transfer to CheckoutCart
                            </h1>

                            {verifyCart === false ? (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginTop: "20px",
                                  }}
                                >
                                  <CountdownCircleTimer
                                    key={timer}
                                    isPlaying
                                    duration={60}
                                    colors={[
                                      "#004777",
                                      "#F7B801",
                                      "#A30000",
                                      "#A30000",
                                    ]}
                                    colorsTime={[7, 5, 2, 0]}
                                    onComplete={() => [false, 1000]}
                                  >
                                    {renderTime}
                                  </CountdownCircleTimer>
                                </div>
                                <div
                                  style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px",
                                    display: "flex",
                                  }}
                                >
                                  <p>Your CartID 🛒 : {cartID}</p>
                                </div>
                                <div
                                  style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display: "flex",
                                    marginTop: "50px",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    style={{
                                      border: "1px solid black",
                                      color: "black",
                                    }}
                                    onClick={() => {
                                      setCartID("");
                                      setTransferModal(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p>Verified</p>
                              </>
                            )}
                          </div>
                        </Modal>
                      </>
                    ) : (
                      <></>
                    )}
                  </h2>

                  <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
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
