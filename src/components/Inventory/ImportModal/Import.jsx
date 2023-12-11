import React, { useState, useEffect } from "react";
import axios from "axios";
import imageScan from "../../../assets/image/placeRFID.jpg";
import soundScanned from "../../../assets/Sound/Barcode-scanner-beep-sound.mp3";
import { Button } from "@mui/material";
import Table from "../ImportDataTable/DataTable";
import { Routes, useLocation } from "react-router-dom";
import Modal from "react-modal";
import greenTick from "../../../assets/image/greenTick.png";
const successStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "150px",
    width: "250px",
    backgroundColor: "white",
    borderColor: "green",
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
const Import = ({ urlAPI, setModalOpen, productList, userInfo }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [importDevice, setImportDevice] = useState("b2211");
  const [importedScan, setImportedScan] = useState(() => new Set());
  const [scan, setScan] = useState(false);
  const [importData, setImportData] = useState([]);
  const [scanSound, setScanSound] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const handleStartScan = () => {
    setScan(true);
    let message = "start to scan " + importDevice;
    console.log(message);
    client.publish("ReadRFIDTag", message);
    client.subscribe(importDevice);
  };

  function handleTurnOnAudio() {
    setScanSound(true);
    audio.play();
  }
  const addItem = async (item) => {
    await setImportedScan((prev) => new Set(prev).add(item));
    // const data = await [...productScan];
    // await console.log("test: ", data);
  };

  client.on("message", async function (topic, payload, packet) {
    //var obj = JSON.parse(payload.toString())

    await addItem(payload.toString());
    audio.play();

    //await addToCart(obj)
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const scanList = Array.from(importedScan);
      // console.log("array: ",productData.length)
      // console.log("set: ",scanList.length)
      var uuidList = [];
      for (let i = 0; i < importData.length; i++) {
        uuidList = uuidList.concat(importData[i].uuid);
      }
      var difference = scanList.filter((x) => uuidList.indexOf(x) === -1);
      if (difference.length > 0) {
        if (importData.length === 0) {
          for (let i = 0; i < scanList.length; i++) {
            let proID = scanList[i].split("||")[1];
            for (let j = 0; j < productList.length; j++) {
              if (proID === productList[j].id) {
                var uuidArr = [];
                uuidArr.push(scanList[i]);
                var item = {
                  id: productList[j].id,
                  productID: productList[j].id,
                  name: productList[j].name,
                  image: productList[j].image,
                  quantity: 1,
                  uuid: uuidArr,
                };
                setImportData((oldArray) => [...oldArray, item]);
              }
            }
          }
        } else {
          var arrUUID = [];
          for (let i = 0; i < importData.length; i++) {
            arrUUID = arrUUID.concat(importData[i].uuid);
          }

          var newItem = [];
          for (let i = 0; i < scanList.length; i++) {
            if (arrUUID.includes(scanList[i]) === false) {
              newItem.push(scanList[i]);
            }
          }

          for (let i = 0; i < newItem.length; i++) {
            let proID = newItem[i].split("||")[1];
            const index = importData.findIndex((object) => {
              return object.productID === proID;
            });
            if (index >= 0) {
              console.log("add quantity");
              var retrieveItem = [...importData];
              retrieveItem[index].quantity = retrieveItem[index].quantity + 1;
              let arrayUUID = retrieveItem[index].uuid;
              arrayUUID.push(newItem[i]);
              retrieveItem[index].uuid = arrayUUID;
              setImportData(retrieveItem);
            } else {
              for (let j = 0; j < productList.length; j++) {
                if (proID === productList[j].id) {
                  const uuidArr = [];
                  uuidArr.push(newItem[i]);
                  var item = {
                    id: productList[j].id,
                    productID: productList[j].id,
                    name: productList[j].name,
                    image: productList[j].image,
                    quantity: 1,
                    uuid: uuidArr,
                  };
                  setImportData((oldArray) => [...oldArray, item]);
                }
              }
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [importedScan, importData]);

  const handleImportInvetory = () => {
    console.log(importData);
    const body = {
      importData: importData,
      userID: userInfo.userID,
    };
    const url = urlAPI + "/api/rfid/import_inventory";
    axios.post(url, body).then(
      async (response) => {
        if (response.data.success === true) {
          await delay(200);
          setImportSuccess(true);
          await delay(5000);
          setImportSuccess(false);
          setModalOpen(false);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return (
    <div>
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
            setModalOpen(false);
          }}
        >
          X
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "-40px",
          fontSize: "20px",
        }}
      >
        <h2>Import to Inventory</h2>

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
              <div
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                  marginTop: "1%",
                }}
              ></div>
              {importData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    style={{
                      position: "absolute",
                      top: "30%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "block",
                    }}
                    height={150}
                    src={imageScan}
                  ></img>
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
                            style={{ width: "100px", height: "100px" }}
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
                  <div style={{ width: "10%" }}>
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
                        products={importData}
                        setImportValue={setImportData}
                        RFIDList={importedScan}
                        setRFIDList={setImportedScan}
                      />{" "}
                      <div
                        style={{
                          display: "flex",
                          position: "absolute",
                          top: "100%",
                          left: "90%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor: "black",
                            color: "white",
                            marginLeft: "30%",
                            width: "250px",
                            marginTop: "50%",
                          }}
                          onClick={handleImportInvetory}
                        >
                          Import to Inventory
                        </Button>

                        <Modal
                          isOpen={importSuccess}
                          style={successStyles}
                          ariaHideApp={false}
                        >
                          <img
                            style={{
                              height: "50px",
                              width: "100px",
                              display: "block",
                              textAlign: "center",
                              marginLeft: "auto",
                              marginRight: "auto",
                              marginTop: "30px",
                            }}
                            src={greenTick}
                          ></img>
                          <p
                            style={{
                              textAlign: "center",
                              color: "green",
                              fontSize: "20px",
                            }}
                          >
                            Successfully Import {importedScan.size} items
                          </p>
                        </Modal>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Import;
