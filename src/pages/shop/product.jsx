import React, { useContext, useState } from "react";
import Modal from "react-modal";
import WriteProduct from "../../components/WriteProduct/WriteProduct";
import "./shop.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "390px",
    width: "810px",
    backgroundColor: "white",
    borderColor: "black",
  },
};
export const Product = ({ product }) => {
  const navigate = useNavigate();
  const navigateProduct = () => {
    // 👇️ navigate to /contacts
    const link = "/write/" + product.id;
    navigate(link);
  };
  const [modalOpen, setModalOpen] = useState(false);
  console.log(product);
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
              console.log("edit");
            }}
          >
            <EditIcon style={{ color: "black" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            style={{}}
            onClick={() => {
              console.log("delete");
            }}
          >
            <DeleteIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};
