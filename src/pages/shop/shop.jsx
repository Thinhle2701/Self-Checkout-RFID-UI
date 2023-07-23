import React, { useState } from "react";
import { Product } from "./product";
import "./shop.css";
import SearchIcon from "@mui/icons-material/Search";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductModal from "../../components/Products/ProductModal";
import Modal from "react-modal";
import { Button } from "@mui/material";
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

export const Shop = ({ products }) => {
  console.log(products);
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="shop">
      <div className="shopTitle">
        <div style={{ marginLeft: "35%" }}>
          <SearchBar />
        </div>
        <Button
          variant="contained"
          style={{
            marginLeft: "80%",
            backgroundColor: "black",
            border: "1px solid black",
            color: "white",
            borderRadius: "200px",
            fontSize: "17px",
          }}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          + Add Product
        </Button>
      </div>

      {modalOpen === true ? (
        <Modal isOpen={modalOpen} style={customStyles} ariaHideApp={false}>
          <ProductModal
            // urlAPI={urlAPI}
            setOpenModal={setModalOpen}
          />
        </Modal>
      ) : (
        <p></p>
      )}
      <div className="products">
        {products.map((product) => (
          <Product product={product} />
        ))}
      </div>
    </div>
  );
};
