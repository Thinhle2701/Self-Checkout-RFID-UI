import React, { useContext, useState } from "react";
import Modal from "react-modal";
import WriteProduct from "../../components/WriteProduct/WriteProduct";
import "./shop.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditProductModal from "../../components/Products/EditProductModal";
import axios from "axios";

const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "600px",
    width: "510px",
    backgroundColor: "white",
    borderColor: "black",
    marginTop: "100px",
  },
};
const askStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "130px",
    width: "300px",
    backgroundColor: "white",
    borderColor: "black",
  },
};
export const Product = ({ product,urlAPI }) => {
  const navigate = useNavigate();
  const navigateProduct = () => {
    // 👇️ navigate to /contacts
    const link = "/write/" + product.id;
    navigate(link);
  };
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalAskUser, setModalAskUser] = useState(false);
  console.log(product);

  const handleApproveDelete = async () => {
    const url = urlAPI +"/api/product/delete/" + product.id;
    await axios
      .delete(url)
      .then(async function (response) {
        await setModalAskUser(false);
        window.location.reload();
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  };
  return (
    <div className="product">
      <img src={product.image} width={250} height={300} />
      <div className="description">
        <p>
          <b style={{ fontSize: "25px" }}>{product.name}</b>
        </p>
        <p style={{ fontSize: "20px", color: "green" }}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(product.price)}
        </p>
      </div>
      {/* <button className="addToCartBttn" onClick={()=>{setModalOpen(true)}}>
        Start to Write
      </button> */}
      <div style={{ display: "flex" }}>
        <button onClick={navigateProduct} className="addToCartBttn">
          Write RFID tag
        </button>
        <Tooltip title="Edit">
          <IconButton
            style={{}}
            onClick={() => {
              setModalEditOpen(true);
            }}
          >
            <EditIcon style={{ color: "black" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            style={{}}
            onClick={() => {
              setModalAskUser(true);
            }}
          >
            <DeleteIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      </div>

      {modalEditOpen === true ? (
        <Modal isOpen={modalEditOpen} style={customStyles} ariaHideApp={false}>
          <EditProductModal
            productData={product}
            setOpenModal={setModalEditOpen}
            urlAPI = {urlAPI}
          />
        </Modal>
      ) : (
        <p></p>
      )}

      {modalAskUser === true ? (
        <div>
          {" "}
          <Modal isOpen={modalAskUser} style={askStyles} ariaHideApp={false}>
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
                onClick={() => setModalAskUser(false)}
              >
                X
              </button>
            </div>
            <p
              style={{
                textAlign: "center",
                color: "black",
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "10%",
              }}
            >
              Are you sure to delete this product ?
            </p>
            <div style={{ display: "flex", marginTop: "30px" }}>
              <div style={{ marginLeft: "20%" }}>
                <Button
                  style={{ border: "2px solid red", color: "red" }}
                  variant="outlined"
                  onClick={(e) => {
                    handleApproveDelete();
                  }}
                >
                  YES
                </Button>
              </div>
              <div style={{ marginLeft: "15%" }}>
                <Button
                  style={{ border: "2px solid black" }}
                  variant="outlined"
                  onClick={() => setModalAskUser(false)}
                >
                  NO
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
