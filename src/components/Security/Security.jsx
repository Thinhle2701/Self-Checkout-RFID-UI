import React, { useState, useEffect } from "react";
import soundScanned from "../../assets/Sound/correct-choice-43861.mp3";
import emergencySound from "../../assets/Sound/emergency-alarm-with-reverb-29431.mp3";
import gateSecurity from "../../assets/image/securitygate.png";
import SensorsIcon from "@mui/icons-material/Sensors";
import { List } from "@mui/material";
import { Button } from "@mui/material";
import Modal from "react-modal";
import TextField from "@mui/material/TextField";
import axios from "axios";

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

var mqtt = require("mqtt");
const connectUrl = `wss://broker.emqx.io:8084/mqtt`;
const audio = new Audio(soundScanned);
const client = mqtt.connect(connectUrl, {
  clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
  username: "thinh",
  password: "thinhbeo2801",
});

const emergency = new Audio(emergencySound);

const Security = ({ RFID_List, BE_URL, itemSecurityList }) => {
  const [securityDevice, setSecurityDevice] = useState("e1118f");
  const [itemScanned, setItemScanned] = useState(() => new Set());
  const [scanSound, setScanSound] = useState(false);
  const [itemCheckList, setItemCheckList] = useState([]);
  const [securityScan, setSecurityScan] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [currentItemScan, setCurrentItemScan] = useState("");
  const [staffID, setStaffID] = useState("");
  const [adminInput, setAdminInput] = useState(true);
  const [productInvalid, setProductInvalid] = useState({});
  useEffect(() => {
    if (itemCheckList.length === 0) {
      handleStopScan();
      let itemArr = [];
      for (let i = 0; i < itemSecurityList.length; i++) {
        if (itemSecurityList[i].quantity > 1) {
          for (let k = 0; k < itemSecurityList[i].uuid.length; k++) {
            const newItem = {
              itemNumber: Number(itemArr.length) + 1,
              productID: itemSecurityList[i].productID,
              productName: itemSecurityList[i].productName,
              image: itemSecurityList[i].image,
              verify: false,
              uuid: itemSecurityList[i].uuid[k],
            };
            itemArr.push(newItem);
          }
        } else {
          const newItem = {
            itemNumber: Number(itemArr.length) + 1,
            productID: itemSecurityList[i].productID,
            productName: itemSecurityList[i].productName,
            image: itemSecurityList[i].image,
            verify: false,
            uuid: itemSecurityList[i].uuid[0],
          };
          itemArr.push(newItem);
        }
      }
      setItemCheckList(itemArr);
    }

    const interval = setInterval(async () => {
      if (itemScanned.size > 0 && itemCheckList.length > 0) {
        const [first] = itemScanned;
        const itemArray = await [...itemCheckList];
        let flagCheckScan = false;
        for (let i = 0; i < itemArray.length; i++) {
          if (itemArray[i].uuid === first) {
            flagCheckScan = true;
            itemArray[i].verify = true;
            await setCurrentItemScan("");
            await setItemCheckList(itemArray);
            const empty = new Set();
            await setItemScanned(empty);
            audio.play();
          }
        }
        if (flagCheckScan === false) {
          setWarningModal(true);
          emergency.play();
          console.log("invalid item");
        }
        console.log(itemArray);

        //console.log(first);
      } else {
        let totalCheckQTY = 0;
        for (let i = 0; i < itemCheckList.length; i++) {
          if (itemCheckList[i].verify === true) {
            totalCheckQTY = totalCheckQTY + 1;
          }
        }
        if (totalCheckQTY === itemCheckList.length && totalCheckQTY != 0) {
          //console.log("true item: ", totalCheckQTY);
          setVerifySuccess(true);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [RFID_List, itemSecurityList, itemScanned]);

  // console.log(itemScanned);
  console.log("item: ", itemCheckList);
  console.log("RFID: ", RFID_List);
  console.log("SecurityList: ", itemSecurityList);
  const handleStartScan = () => {
    audio.play();
    setSecurityScan(true);
    let message = "start to scan " + securityDevice;
    console.log(message);
    client.publish("InventoryRFIDTag", message);
    client.subscribe(securityDevice);
  };

  const handleStopScan = () => {
    let message = "stop to scan " + securityDevice;
    console.log(message);
    client.publish("InventoryRFIDTag", message);
    client.unsubscribe(securityDevice);
  };
  const addItem = async (payload) => {
    await setCurrentItemScan(payload);
    const uuid = payload.split("||")[0];
    await setItemScanned((prev) => new Set(prev).add(uuid));
    console.log(uuid);
    // const data = await [...productScan];
    // await console.log("test: ", data);
  };

  const checkItem = async (payload) => {
    const uuid = payload.split("||")[0];
    const productID = payload.split("||")[1];
    const itemArr = await [...itemCheckList];
    console.log("uuid", uuid);
    console.log("item coppy", itemArr);
    if (itemArr.length > 0) {
      if (itemScanned.has(uuid)) {
        for (let i = 0; i < itemArr.length; i++) {
          if (itemArr[i].uuid === uuid) {
            itemArr[i].verify = true;
          }
        }
      }
      await setItemCheckList(itemArr);
      //await itemArr.splice(0,itemArr.length);
    }
    //for ()
  };

  client.on("message", async function (topic, payload, packet) {
    // audio.play();
    await addItem(payload.toString());
    //console.log(obj);

    //await addToCart(obj)
  });

  const handleCloseVerifiedSecurity = () => {
    handleStopScan();

    const currentURL = window.location.href;
    const newURL = currentURL.split(window.location.pathname);
    console.log(newURL);
    const backURL = newURL[0] + "/customer";
    window.localStorage.clear();
    window.location.replace(backURL);
  };

  const handleCloseWarning = () => {
    setProductInvalid({});
    setCurrentItemScan("");
    setAdminInput(true);
    setWarningModal(false);
  };

  const handleClickSubmit = () => {
    if (staffID === "") {
      console.log("invalid staff");
    } else {
      if (staffID === "admin") {
        const productID = currentItemScan.split("||")[1];
        const uuid = currentItemScan.split("||")[0];
        console.log(productID);
        const body = {
          uuid: uuid,
          productID: productID,
        };
        const url = BE_URL + "/api/rfid/verifyTag";
        axios.post(url, body).then(
          async (response) => {
            setAdminInput(false);
            setProductInvalid(response.data);
            const empty = new Set();
            await setItemScanned(empty);
            console.log(response.data);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  };

  return (
    <div>
      {verifySuccess === false ? (
        <div>
          <h1
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            Security Gate
          </h1>
          <img
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              width: "300px",
              marginLeft: "27%",
            }}
            src={gateSecurity}
          ></img>
          {warningModal === true ? (
            <>
              <Modal
                isOpen={warningModal}
                style={customStyles}
                ariaHideApp={false}
              >
                <div>
                  <h2
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "red",
                    }}
                  >
                    Prevent Theft System
                  </h2>
                  {adminInput === true ? (
                    <>
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
                          label="Input Staff ID"
                          placeholder="Staff ID"
                          helperText="You must wait staff to input Staff ID"
                          onChange={(e) => {
                            setStaffID(e.target.value);
                          }}
                        />
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "black",
                            color: "white",
                            marginLeft: "40%",
                            width: "100px",
                            marginTop: "50px",
                          }}
                          onClick={() => {
                            handleClickSubmit();
                          }}
                        >
                          Submit
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <table style={{ width: "500px" }}>
                        <tr>
                          <th style={{ fontSize: "20px" }}>Product</th>
                          <th style={{ fontSize: "20px" }}>RFID tag</th>
                          <th style={{ fontSize: "20px" }}>Status</th>
                        </tr>
                        <tr>
                          <td>
                            <div style={{ display: "flex" }}>
                              <p
                                style={{
                                  fontSize: "15px",
                                  marginTop: "40px",
                                  fontWeight: "bold",
                                }}
                              >
                                {productInvalid.name}
                              </p>
                              <img
                                src={productInvalid.image}
                                style={{ width: "100px", height: "100px" }}
                              ></img>
                            </div>
                          </td>
                          <td style={{ marginLeft: "50px" }}>
                            {" "}
                            <p
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                color: "#000066",
                              }}
                            >
                              {productInvalid.uuid}
                            </p>
                          </td>
                          <td>
                            {" "}
                            <p
                              style={{
                                fontSize: "15px",
                                color: "red",
                                fontWeight: "bold",
                                marginLeft: "30px",
                              }}
                            >
                              Unpaid
                            </p>
                          </td>
                        </tr>
                      </table>
                      <div>
                        <Button
                          onClick={handleCloseWarning}
                          variant="outlined"
                          style={{
                            border: "1px solid black",
                            color: "black",
                            marginLeft: "42%",
                            marginTop: "10%",
                          }}
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Modal>
            </>
          ) : (
            <></>
          )}
          {securityScan === true ? (
            <>
              <div>
                <List
                  disabledPadding
                  style={{ marginTop: "50px", border: "1px solid white" }}
                >
                  <table
                    style={{
                      marginLeft: "10%",
                      backgroundColor: "white",
                      borderWidth: "1px",
                      borderColor: "#aaaaaa",
                      borderStyle: "solid",
                      width: "80%",
                    }}
                  >
                    <tr>
                      <th style={{ width: "10%", textAlign: "center" }}>
                        <p>Product</p>
                      </th>

                      <th style={{ width: "20%", textAlign: "center" }}>
                        <p>UUID</p>
                      </th>

                      <th style={{ width: "20%", textAlign: "center" }}>
                        <p>Verify</p>
                      </th>
                    </tr>
                    {itemCheckList.map((item) => (
                      <tr style={{ backgroundColor: "white" }}>
                        <th style={{}}>
                          <div
                            style={{
                              display: "flex",
                            }}
                          >
                            <img
                              src={item.image}
                              style={{
                                height: "100px",
                                width: "150px",
                                marginRight: "10px",
                                marginLeft: "10px",
                              }}
                            ></img>

                            <p style={{ marginLeft: "10px", paddingTop: "7%" }}>
                              {item.productName}
                            </p>
                          </div>
                        </th>
                        <th style={{ textAlign: "center" }}>
                          <p>{item.uuid}</p>
                        </th>
                        <th>
                          <div>
                            {item.verify === true ? (
                              <>
                                <p style={{ fontSize: "20px" }}>✅</p>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        </th>
                      </tr>
                    ))}
                  </table>
                </List>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "40px",
              }}
            >
              {" "}
              <button
                className="addToCartBttn"
                style={{}}
                onClick={() => handleStartScan()}
              >
                <SensorsIcon style={{ fontSize: "50px" }} />
                <p style={{ fontSize: "15px" }}> Click to Verify all items</p>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            Security Gate
          </h1>
          <img
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              width: "300px",
              marginLeft: "27%",
            }}
            src="https://zkteco.eu/sites/default/files/zkteco_europe_access_control_turnstiles_for_security_systems-_fbl6000_pro_and_sbtl6000_01.gif"
          ></img>
          <img
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              width: "250px",
              height: "250px",
              marginLeft: "30%",
            }}
            src="https://media1.giphy.com/media/PijzuUzUhm7hcWinGn/giphy.gif"
          ></img>
          <div>
            <Button
              onClick={handleCloseVerifiedSecurity}
              variant="outlined"
              style={{
                border: "1px solid black",
                color: "black",
                marginLeft: "45%",
                marginTop: "10%",
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
