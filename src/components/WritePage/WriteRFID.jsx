import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";
import { Routes, useLocation } from "react-router-dom";
import { IconButton, Button } from "@mui/material";
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3";
import InventoryIcon from "@mui/icons-material/Inventory";
import ImportExportRoundedIcon from "@mui/icons-material/ImportExportRounded";
import Modal from "react-modal";
import greenTick from "../../assets/image/greenTick.png";

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

const WriteRFID = ({ BE_URL, userInfo }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [product, setProduct] = useState({});
  const [itemScaned, setItemScaned] = useState(() => new Set());
  const [writed, setWrited] = useState(false);
  const [importInventory, setImportInventory] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const addItem = (item) => {
    setItemScaned((prev) => new Set(prev).add(item));
  };
  client.on("connect", function () {
    client.subscribe("rfid/P001", function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
  const location = useLocation();

  console.log("rfid: ", itemScaned.size);

  // Get current path
  const path = location.pathname;
  const myArray = path.split("/");
  const productID = myArray[2];
  const fetchProduct = (url) => {
    axios
      .get(url)
      .then((res) => {
        console.log(res.data);
        setProduct(res.data);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    const url = BE_URL + "/api/product/" + productID;
    fetchProduct(url);
  }, [productID]);

  client.on("message", async function (topic, payload, packet) {
    await addItem(payload.toString());
    audio.play();
  });
  const handleStartWrite = () => {
    const topic = "rfid/" + product.id;
    const url = BE_URL + "/api/rfid/write";
    axios
      .post(url, {
        productID: product.id,
      })
      .then(
        (response) => {
          console.log(response);
          client.subscribe(topic);
        },
        (error) => {
          console.log(error);
        }
      );
    setWrited(true);
  };

  const handleStopWrite = () => {
    setWrited(false);
    const topic = "rfid/" + product.id;
    client.unsubscribe("rfid");
    const url = BE_URL + "/api/rfid/stop_write";
    axios
      .post(url, {
        productID: product.id,
      })
      .then(
        (response) => {
          console.log(response);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

  const handleImportInvetory = () => {
    const body = {
      uuid: Array.from(itemScaned),
      productID: product.id,
      userID: userInfo.userID,
    };
    const url = BE_URL + "/api/rfid/add_rfid"
    axios.post(url, body).then(
      async (response) => {
        console.log(response);
        if (response.data === "imported") {
          await delay(200);
          setImportInventory(true);
          await delay(5000);
          setImportInventory(false);
          const emptySet = new Set();
          setItemScaned(emptySet);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };
  console.log(itemScaned);
  return (
    <div>
      <h1 style={{ marginLeft: "45%", fontSize: "40px" }}>Write RFID</h1>
      <div style={{ display: "flex", marginTop: "5%", marginLeft: "25%" }}>
        <img width={600} height={400} src={product.image} />
        <div style={{ display: "block" }}>
          <h2 style={{ fontSize: "50px" }}>{product.name}</h2>
          <p style={{ fontSize: "30px" }}>
            Price:{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </p>
          {writed == false ? (
            <div style={{ display: "flex", marginTop: "5px" }}>
              <button className="addToCartBttn" onClick={handleStartWrite}>
                Write
              </button>
              <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                <p style={{ marginLeft: "20px" }}>
                  Total Scaned : {itemScaned.size}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", marginTop: "5px" }}>
              <button
                style={{
                  color: "red",
                  border: "2px solid red",
                  hoverColor: "red",
                }}
                className="addToCartBttn"
                onClick={handleStopWrite}
              >
                Pause
              </button>
              <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                <p style={{ marginLeft: "20px" }}>
                  Total Scaned : {itemScaned.size}
                </p>
              </div>
            </div>
          )}
          <div>
            {itemScaned.size != 0 ? (
              <>
                <div style={{ marginTop: "20%" }}>
                  {isHovering && (
                    <div>
                      <div
                        style={{
                          display: "block",
                          marginBottom: "20%",
                          border: "2px solid black",
                          borderRadius: "50px",
                        }}
                      >
                        <h2
                          style={{ justifyContent: "center", display: "flex" }}
                        >
                          UUID List
                        </h2>
                        <div>
                          {Array.from(itemScaned).map((item) => (
                            <div style={{ marginLeft: "10%" }}>
                              <ul>
                                <li>{item}</li>
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <IconButton
                    style={{
                      display: "flex",
                      border: "2px solid blue",
                      borderRadius: "200px",
                    }}
                    onClick={() => {
                      handleImportInvetory();
                    }}
                  >
                    <p style={{ color: "blue", fontWeight: "bold" }}>
                      Import Inventory
                    </p>
                    <InventoryIcon
                      style={{
                        color: "blue",
                        fontSize: "50px",
                      }}
                    ></InventoryIcon>
                  </IconButton>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>

          <Modal
            isOpen={importInventory}
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
              Successfully Import {itemScaned.size} items
            </p>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default WriteRFID;
