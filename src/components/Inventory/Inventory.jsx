import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import Table from "./InventoryTable/DataTable";
import axios from "axios";
import { Button } from "@mui/material";
import Modal from "react-modal";
import ImportModal from "./ImportModal/Import";
const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "700px",
    width: "810px",
    backgroundColor: "white",
    borderColor: "black",
    marginTop: "100px",
  },
};

const Inventory = ({
  BE_URL,
  inventoryList,
  setValueInventory,
  userInfo,
  setInventory,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    const url = BE_URL + "/api/product";
    axios
      .get(url)
      .then((res) => {
        console.log(res.data);
        setValueInventory(res.data);
      })
      .catch((error) => console.log(error));
  };
  return (
    <div>
      <button
        style={{
          padding: "10px 30px",
          background: "#FFFFFF",
          color: "black",
          fontWeight: "bolb",
          border: "none",
          fontSize: "20px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "0.5s",
        }}
        onClick={() => {
          const currentURL = window.location.href;
          const backURL = currentURL.split("inventory")[0];
          window.location.replace(backURL);
        }}
      >
        {"< Back"}{" "}
      </button>
      <h1 style={{ display: "flex", justifyContent: "center" }}>Inventory</h1>

      <Button
        variant="contained"
        style={{
          marginLeft: "80%",
          backgroundColor: "red",
          border: "1px solid red",
          color: "white",
          borderRadius: "200px",
          fontSize: "17px",
          width: "200px",
        }}
        onClick={() => {
          setModalOpen(true);
        }}
      >
        + import
      </Button>

      <Button
        variant="contained"
        style={{
          marginLeft: "80%",
          backgroundColor: "black",
          border: "1px solid black",
          color: "white",
          borderRadius: "200px",
          fontSize: "17px",
          marginTop: "20px",
          width: "200px",
        }}
        onClick={() => {
          window.location.reload();
        }}
      >
        ↻ Refresh
      </Button>

      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Table products={inventoryList} />{" "}
        </div>
      </div>

      {modalOpen === true ? (
        <Modal isOpen={modalOpen} style={customStyles} ariaHideApp={false}>
          <ImportModal
            setInventory={setInventory}
            urlAPI={BE_URL}
            setModalOpen={setModalOpen}
            productList={inventoryList}
            userInfo={userInfo}
          />
        </Modal>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default Inventory;
