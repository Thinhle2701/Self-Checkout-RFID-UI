import React, { useState } from "react";
import { Product } from "./product";
import "./shop.css";
import SearchIcon from "@mui/icons-material/Search";
import SearchBar from "../../components/SearchBar/SearchBar";
import ProductModal from "../../components/Products/ProductModal";
import Modal from "react-modal";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
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

export const Shop = ({ products, BE_URL, setAdminLogin, setUserInfo }) => {
  console.log(products);
  const [modalOpen, setModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState(products);
  const [search, setSearch] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const handleClose = () => {
    setOpenMenu(null);
  };

  const handleClickProfileMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleSignOut = () => {
    setAdminLogin(false);
    setUserInfo({});
    window.localStorage.removeItem("user");
    window.localStorage.setItem("checkLogin", false);
  };
  return (
    <div className="shop">
      <div className="shopTitle">
        <div style={{ marginLeft: "35%" }}>
          <div style={{ display: "flex" }}>
            <SearchBar
              setSearch={setSearch}
              productList={products}
              setProductSearch={setProductSearch}
            />

            <img
              src="https://cdn-icons-png.flaticon.com/512/147/147142.png"
              onClick={handleClickProfileMenu}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "400px",
                marginRight: "10px",
                marginTop: "1px",
                marginLeft: "45%",
              }}
            ></img>
            <Menu
              keepMounted
              anchorEl={openMenu}
              onClose={handleClose}
              open={Boolean(openMenu)}
            >
              <MenuItem>My Account</MenuItem>
              <MenuItem
                onClick={() => {
                  const currentUrl = window.location.href;
                  const inventoryURL = currentUrl + "inventory";
                  window.location.replace(inventoryURL);
                }}
              >
                Inventory
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const currentUrl = window.location.href;
                  const orderURL = currentUrl + "orderhistory";
                  window.location.replace(orderURL);
                }}
              >
                Order History
              </MenuItem>
              <MenuItem onClick={() => handleSignOut()}>Sign Out</MenuItem>
            </Menu>
          </div>
        </div>
        <Button
          variant="contained"
          style={{
            marginLeft: "60%",
            backgroundColor: "black",
            border: "1px solid black",
            color: "white",
            borderRadius: "200px",
            fontSize: "17px",
            marginTop: "20px",
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
          <ProductModal urlAPI={BE_URL} setOpenModal={setModalOpen} />
        </Modal>
      ) : (
        <p></p>
      )}

      {search === false ? (
        <>
          <div className="products">
            {products.map((product) => (
              <Product product={product} urlAPI={BE_URL} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="products">
            {productSearch.map((product) => (
              <Product product={product} urlAPI={BE_URL} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
