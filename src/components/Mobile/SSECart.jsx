import React from "react";
import { useState, useEffect } from "react";
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
import MobileCartInstruction from "../Instruction/MobileCartInstruction";

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
    height: "100px",
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
});
client.setMaxListeners(100);

const SSECart = ({ productList, BE_URL }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [deviceID, setDeviceID] = useState("5667bb");
  const [scan, setScan] = useState(false);
  const [productScan, setProductScan] = useState(() => new Set());
  const [productData, setProductData] = useState([]);
  const [total, setTotal] = useState(0);
  const [continueScan, setContinueScan] = useState(true);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalWarningOpen, setModalWarningOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [cartID, setCartID] = useState("");
  const [timer, setTimer] = useState(0);
  const [verifyCart, setVerifyCart] = useState(false);
  const [timeAvaiable, setTimeAvaiable] = useState(true);

  const [errorScan, setErrorScan] = useState(false);
  const [scannedItem, setScannedItem] = useState({
    productID: "",
    name: "",
    image: "",
    price: "",
    uuid: "",
    scanned: false,
    displayModal: false,
    validTag: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleStartScanExistCart = (cartID) => {
    const url = BE_URL + "/api/cart/verify_mobile_cart_expire";
    axios.post(url, { cartID: cartID }).then(
      async (response) => {
        if (response.data === "expire cart") {
          console.log("expired cart");
          handleRestart();
        } else {
          setScan(true);
          console.log(response);
          setCartID(response.data.cartID);
          setProductData(response.data.cartItem);
          setProductScan(response.data.RFID);
          setTotal(response.data.totalPrice)
          await setContinueScan(false);

          let message =
            "stop to scan " +
            deviceID +
            " " +
            "with cartID " +
            response.data.cartID;
          console.log(message);
          await client.publish("ReadRFIDTag", message);

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
      const url = BE_URL + "/api/mobilesse/" + cartID;
      const source = new EventSource(url);

      source.addEventListener("open", () => {
        console.log("SSE opened!");
      });

      source.addEventListener("message", async (e) => {
        //console.log(e.data);
        const data = JSON.parse(e.data);
        if (data.validTag === true) {
          if (data.cartID === cartID && data.uuid !== scannedItem.uuid) {
            console.log(data);
            await setScannedItem(data);
            if (modalOpen === false) {
              await setModalOpen(true);
            }
            await audio.play();
          }
        } else {
          if (data.productID === "invalid tag") {
            await audio.play();
            await delay(200);
            await setErrorScan(true);
            await delay(2000);
            setErrorScan(false);

            const urlUpdate =
              BE_URL + "/api/mobilesse/update_restart_scan/" + cartID;
            await axios
              .get(urlUpdate)
              .then(async (res) => {
                const scanValueNew = {
                  productID: "",
                  name: "",
                  image: "",
                  price: "",
                  uuid: "",
                  scanned: false,
                  displayModal: false,
                  validTag: false,
                };
                await setScannedItem(scanValueNew);
              })
              .catch((error) => console.log(error));
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
  }, [deviceID, cartID, scannedItem, productData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeAvaiable === true && transferModal === true) {
        if (verifyCart === false) {
          const url = BE_URL + "/api/cart/check_verify/" + cartID;

          axios.get(url).then((response) => {
            if (response.data.success === true) {
              setVerifyCart(true);
            }
            console.log("res: ", response);
          });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [timeAvaiable, transferModal, verifyCart, cartID]);

  const totalVND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(total);

  const handleStartScan = () => {
    const url = BE_URL + "/api/cart/create_new_cart";
    axios.post(url, { deivceID: deviceID }).then(
      async (response) => {
        setCartID(response.data.data.cartID);
        console.log(response);
        let message =
          "start to scan " +
          deviceID +
          " " +
          "with cartID " +
          response.data.data.cartID;
        console.log(message);
        await client.publish("ReadRFIDTag", message);
        setScan(true);
        window.localStorage.setItem("checkScan", true);
        window.localStorage.setItem(
          "cartID",
          JSON.stringify(response.data.data.cartID)
        );

      },
      (error) => {
        console.log("err", error);
      }
    );
  };


  const handleContinueScan = async () => {
    audio.play();
    let message = "start to scan " + deviceID + " " + "with cartID " + cartID;
    console.log(message);
    await client.publish("ReadRFIDTag", message);
    setContinueScan(true);
  };



  const handleAddToCart = async () => {
    setModalOpen(false);
    const url = BE_URL + "/api/cart/add_item_to_cart";
    axios
      .post(url, {
        cartID: cartID,
        item: scannedItem,
      })
      .then(
        async (response) => {
          console.log(response);
          if (response.data === "exist item") {
            const emptyScannedItem = {
              productID: "",
              name: "",
              image: "",
              price: "",
              uuid: "",
              scanned: false,
              displayModal: false,
            };
            setScannedItem(emptyScannedItem);
            await delay(200);
            await setModalWarningOpen(true);
            await delay(2000);
            setModalWarningOpen(false);
          } else {
            const emptyScannedItem = {
              productID: "",
              name: "",
              image: "",
              price: "",
              uuid: "",
              scanned: false,
              displayModal: false,
              validTag: false,
            };
            setScannedItem(emptyScannedItem);
            setProductData(response.data.cartItem);
            setProductScan(response.data.RFID);
            setTotal(response.data.totalPrice);
            await notify();
          }
        },
        (error) => {
          console.log("err", error);
        }
      );
  };

  const notify = () => toast("Successfully Add to Cart");
  const handleRestart = async () => {
    await window.localStorage.clear();
    await window.location.reload();
  };

  const handleTransferToCheckoutCart = () => {
    setTransferModal(true);
  };


  

  const handleCloseVerifiedCart = () => {
    window.localStorage.removeItem("cartID");
    window.localStorage.removeItem("checkScan");
    window.location.reload();
  };
  const renderTime = ({ remainingTime }) => {
    if (remainingTime === 0) {
      setTransferModal(false);
      return <div className="timer">Transfer Time is expired</div>;
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
      {isLoading === true ? (
        <div
          style={{
            position: "absolute",
            top: "45%",
            transform: "translate(0px, -50%)",
            left: "-10%",
          }}
        >
          <img src="https://i.pinimg.com/originals/71/3a/32/713a3272124cc57ba9e9fb7f59e9ab3b.gif"></img>
        </div>
      ) : (
        <div>
          <div>
            {scan === false ? (
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
                  <button
                    className="addToCartBttn"
                    onClick={() => handleStartScan()}
                  >
                    CLick to Start scanning
                  </button>
                </div>
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
                          marginTop: "24px",
                        }}
                      >
                        Invalid Item
                      </p>
                    </Modal>
                  </>
                ) : (
                  <></>
                )}

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
                                {scannedItem.name}
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
                                }).format(scannedItem.price)}
                              </p>
                            </div>{" "}
                          </li>
                        </ul>

                        <img
                          style={{
                            marginLeft: "50px",
                          }}
                          src={scannedItem.image}
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
                          onClick={async () => {
                            setModalOpen(false);
                            const urlUpdate =
                              BE_URL +
                              "/api/mobilesse/update_restart_scan/" +
                              cartID;
                            await axios
                              .get(urlUpdate)
                              .then(async (res) => {
                                const scanValueNew = {
                                  productID: "",
                                  name: "",
                                  image: "",
                                  price: "",
                                  uuid: "",
                                  scanned: false,
                                  displayModal: false,
                                };
                                await setScannedItem(scanValueNew);
                              })
                              .catch((error) => console.log(error));
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
                            handleAddToCart();
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
                          height: "40px",
                          width: "50px",
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
                    marginTop: "0%",
                  }}
                >
                  <h1>Cart 🛒 </h1>
                </div>
                {productData.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* <img height={250} src={imageScan}></img> */}
                    <div>
                      <MobileCartInstruction />
                    </div>
                  </div>
                ) : (
                  <div>
                    {continueScan === false ? (
                      <div>
                        <div>
                          <h4
                            style={{
                              position: "absolute",
                              top: "30%",
                              left: "60%",
                              transform: "translate(-50%, -50%)",
                              width: "400px",
                              marginLeft: "20px",
                              fontSize: "20px",
                            }}
                          >
                            You have scanned some items
                          </h4>
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "60%",
                              transform: "translate(-50%, -50%)",
                              width: "400px",
                              display: "flex",
                            }}
                          >
                            <button
                              style={{
                                fontSize: "15px",
                                //backgroundColor: "#0000cc",
                                color: "#F76C01",
                                border: "2px solid #F76C01",
                                marginRight: "50px",
                                backgroundColor: "white",
                                borderRadius: "10px",
                              }}
                              onClick={() => handleRestart()}
                            >
                              <div>
                                {" "}
                                <p style={{ fontSize: "20px" }}>⌛</p>
                                <p style={{ fontWeight: "bold" }}>
                                  Restart Scanning
                                </p>
                              </div>
                            </button>
                            <button
                              style={{
                                fontSize: "15px",
                                backgroundColor: "white",
                                borderRadius: "10px",
                                color: "#019A79",
                                border: "2px solid #019A79",
                              }}
                              onClick={() => handleContinueScan()}
                            >
                              <p style={{ fontSize: "20px" }}>⭐</p>
                              <p style={{ fontWeight: "bold" }}>
                                Continue to Scan
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "60%" }}>
                        <div
                          style={{
                            // display: "block",
                            // position: "absolute",
                            // top: "50%",
                            // left: "50%",
                            // transform: "translate(-50%, -50%)",
                            marginTop: "30px",
                          }}
                        >
                          <Table
                            cartID={cartID}
                            BE_URL={BE_URL}
                            products={productData}
                            setProductValue={setProductData}
                            RFIDList={productScan}
                            setRFIDList={setProductScan}
                            totalValue={total}
                            setTotalValue={setTotal}
                            setIsLoading={setIsLoading}
                          />{" "}
                          <div></div>
                        </div>
                        <h2
                          style={{
                            width: "400px",
                            marginTop: "20px",
                            marginLeft: "36%",
                          }}
                        >
                          $Total: {totalVND}
                          <div
                            style={{
                              marginTop: "5%",
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
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: "50%",
                                          left: "50%",
                                          transform: "translate(-50%, -50%)",
                                          display: "block",
                                        }}
                                      >
                                        <img
                                          style={{
                                            width: "250px",
                                            height: "250px",
                                            marginTop: "50px",
                                          }}
                                          src="https://us.123rf.com/450wm/get4net/get4net1901/get4net190102035/126403924-verified-shopping-cart.jpg?ver=6"
                                        ></img>
                                        <div>
                                          <Button
                                            onClick={handleCloseVerifiedCart}
                                            variant="outlined"
                                            style={{
                                              border: "1px solid black",
                                              color: "black",
                                              marginLeft: "35%",
                                              marginTop: "10%",
                                            }}
                                          >
                                            Close
                                          </Button>
                                        </div>
                                      </div>
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
        </div>
      )}
    </div>
  );
};

export default SSECart;
