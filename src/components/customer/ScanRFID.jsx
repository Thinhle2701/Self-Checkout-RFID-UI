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
  const [itemScanned, setItemScanned] = useState(false);
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
  const [mobileCart, setMobileCart] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartScan = () => {
    const url = BE_URL + "/api/checkoutcart/add_cart";
    axios.post(url, { deivceID: checkoutCounter }).then(
      async (response) => {
        setCartID(response.data.data.cartID);
        console.log(response);
        let message =
          "start to scan " +
          checkoutCounter +
          " " +
          "with cartID " +
          response.data.data.cartID;
        console.log(message);
        await client.publish("CheckoutReadRFIDTag", message);
        setScan(true);
        window.localStorage.setItem("checkScan", true);
        window.localStorage.setItem(
          "cartID",
          JSON.stringify(response.data.data.cartID)
        );

        // client.subscribe(checkoutCounter);
      },
      (error) => {
        console.log("err", error);
      }
    );
  };

  const handleStartScanExistCart = (cartID) => {
    const url = BE_URL + "/api/checkoutcart/verify_cart_expire";
    axios.post(url, { cartID: cartID }).then(
      async (response) => {
        if (response.data === "expire cart") {
          console.log("expired cart");
          handleRestart();
        } else {
          console.log(response);
          setCartID(response.data.cartID);
          setScan(true);
          setContinueScan(false);
          let message =
            "stop to scan " +
            checkoutCounter +
            " " +
            "with cartID " +
            response.data.cartID;
          console.log(message);
          await client.publish("CheckoutReadRFIDTag", message);

          // console.log(response);
        }
      },
      (error) => {
        console.log("err", error);
      }
    );
  };

  useEffect(() => {
    const cartIDStorage = window.localStorage.getItem("cartID");
    const checkScanStorage = window.localStorage.getItem("checkScan");
    if (
      JSON.parse(cartIDStorage) === null &&
      JSON.parse(checkScanStorage) === null
    ) {
      //handleRestart();
      console.log("new");
    } else {
      if (JSON.parse(checkScanStorage) === true && cartID === "") {
        handleStartScanExistCart(JSON.parse(cartIDStorage));
      }
    }
    if (cartID !== "") {
      const url = BE_URL + "/api/sse/" + cartID;
      console.log(url);
      const source = new EventSource(url);
      source.addEventListener("open", () => {
        console.log("SSE opened!");
      });
      source.addEventListener("message", async (e) => {
        //console.log(e.data);
        const data = await JSON.parse(e.data);
        if (data.scanned === true) {
          const rfidList = Array.from(productScan);
          if (rfidList.length != data.RFID.length) {
            setIsLoading(true);
            delay(1000);
            console.log(data.cartItem);
            await setProductData(data.cartItem);
            const setListRFID = new Set(data.RFID);
            await setProductScan(setListRFID);
            await setTotal(Number(data.totalPrice));
            setItemScanned(true);
            audio.play();
            setIsLoading(false);
          }
        }
      });
      source.addEventListener("error", (e) => {
        console.error("Error: ", e);
      });
      return () => {
        source.close();
      };
    }
  }, [cartID, productData]);
  console.log(productData);

  const totalVND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(total);



  function handleOnchange(event) {
    setCheckoutCounter(event.target.value);
  }
  const handleContinueScan = async () => {
    audio.play();
    let message =
      "start to scan " + checkoutCounter + " " + "with cartID " + cartID;
    console.log(message);
    await client.publish("CheckoutReadRFIDTag", message);
    setContinueScan(true);
  };

  const handleRestart = async () => {
    await window.localStorage.clear();
    await window.location.reload();
  };


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
    setMobileCart("");
    setInputCartModal(false);
  };

  const handleClickSubmit = () => {
    if (mobileCart !== "") {
      const url = BE_URL + "/api/checkoutcart/verify/" + mobileCart;
      axios.post(url, { deivceID: checkoutCounter }).then(
        async (response) => {
          console.log(response.data);
          await setCartID(response.data.cartID);
          await setProductData(response.data.cartItem);
          const setListRFID = new Set(response.data.RFID);
          await setProductScan(setListRFID);
          await setTotal(Number(response.data.totalPrice));
          setScan(true);
          window.localStorage.setItem("checkScan", JSON.stringify(true));
          window.localStorage.setItem(
            "cartID",
            JSON.stringify(response.data.cartID)
          );
          let message =
            "start to scan " +
            checkoutCounter +
            " " +
            "with cartID " +
            response.data.cartID;
          console.log(message);
          await client.publish("CheckoutReadRFIDTag", message);
          setItemScanned(true);
        },
        (error) => {
          console.log("err", error);
        }
      );
    }
  };

  return (
    <div>
      {isLoading === true ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translate(0px, -50%)",
            left: "30%",
          }}
        >
          <img src="https://www.icegif.com/wp-content/uploads/2023/07/icegif-1263.gif"></img>
        </div>
      ) : (
        <div>
          {errorScan === true ? (
            <>
              <Modal
                isOpen={errorScan}
                style={unsuccessStyles}
                ariaHideApp={false}
              >
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
                            setMobileCart(e.target.value);
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
              {itemScanned === false ? (
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
                </div>
              ) : (
                <div>
                  {continueScan === false ? (
                    <div>
                      <h4
                        style={{
                          position: "absolute",
                          top: "30%",
                          left: "52%",
                          transform: "translate(-50%, -50%)",
                          width: "300px",
                          fontSize: "20px",
                        }}
                      >
                        You have scanned some items
                      </h4>
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "57%",
                          transform: "translate(-50%, -50%)",
                          width: "700px",
                          display: "flex",
                        }}
                      >
                        <button
                          style={{
                            fontSize: "20px",
                            // backgroundColor: "#0000cc",
                            // color: "white",
                            marginRight: "100px",
                          }}
                          className="addToCartBttn"
                          onClick={() => handleRestart()}
                        >
                          <div>
                            {" "}
                            <p style={{ fontSize: "40px" }}>⌛</p>
                            <p>Restart Scanning</p>
                          </div>
                        </button>
                        <button
                          style={{
                            fontSize: "20px",
                          }}
                          className="addToCartBttn"
                          onClick={() => handleContinueScan()}
                        >
                          <p style={{ fontSize: "40px" }}>⭐</p>
                          <p>Continue to Scan</p>
                        </button>
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
                          setIsLoading={setIsLoading}
                          cartID={cartID}
                          BE_URL={BE_URL}
                          products={productData}
                          setProductValue={setProductData}
                          RFIDList={productScan}
                          setRFIDList={setProductScan}
                          totalValue={total}
                          setTotalValue={setTotal}
                          setItemScanned={setItemScanned}
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
      )}
    </div>
  );
};

export default ScanRFID;
