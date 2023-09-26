import React, { useState, useEffect } from "react";
import "./App.css";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
} from "react-router-dom";
import { Navbar } from "./components/navbar";
import LoginForm from "./components/Login/LoginForm";
import { Shop } from "./pages/shop/shop";
import WriteRFID from "./components/WritePage/WriteRFID";
import ScanRFID from "./components/customer/ScanRFID";
import CheckoutVNPAYPage from "./components/CheckoutPage/CheckoutVNPAYPage";
import CheckoutMoMoPage from "./components/CheckoutPage/CheckoutMoMoPage";
import CartPage from "./components/Mobile/Cart";
import Inventory from "./components/Inventory/Inventory";
import axios from "axios";
import { Buffer } from "buffer";
const urlBE = "http://localhost:8000";
function App() {
  const [products, setProducts] = useState([]);
  const [adminLogin, setAdminLogin] = useState(true);
  const [userInfo, setUserInfo] = useState({});
  window.Buffer = Buffer;
  useEffect(() => {
    fetchProduct();
    const check = window.localStorage.getItem("checkLogin");
    const user = window.localStorage.getItem("user");
    if (JSON.parse(check) !== null) {
      setAdminLogin(JSON.parse(check));
      setUserInfo(JSON.parse(user));
    } else {
      window.localStorage.setItem("checkLogin", JSON.stringify(false));
      setAdminLogin(false);
    }
  }, []);
  const fetchProduct = () => {
    const url = urlBE + "/api/product";
    axios
      .get(url)
      .then((res) => {
        console.log(res.data);
        setProducts(res.data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="App">
      {/* <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Shop products={products}/>} />

            <Route exact path="/write/:productId" element={<WriteRFID />}>
              <WriteRFID />
            </Route>
          </Routes>
          
        </Router> */}
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={
              adminLogin ? (
                <Shop
                  products={products}
                  BE_URL={urlBE}
                  setAdminLogin={setAdminLogin}
                  setUserInfo={setUserInfo}
                ></Shop>
              ) : (
                <LoginForm
                  urlApi={urlBE}
                  setAdminLogin={setAdminLogin}
                  setUserInfo={setUserInfo}
                ></LoginForm>
              )
            }
          ></Route>

          <Route
            exact
            path="/write/:productId"
            element={
              adminLogin ? (
                <WriteRFID BE_URL={urlBE} userInfo={userInfo} />
              ) : (
                <LoginForm
                  urlApi={urlBE}
                  setAdminLogin={setAdminLogin}
                  setUserInfo={setUserInfo}
                ></LoginForm>
              )
            }
          ></Route>

          <Route
            exact
            path="/customer"
            element={
              <ScanRFID
                productList={products}
                BE_URL={urlBE}
                userInfo={userInfo}
              />
            }
          ></Route>

          <Route
            exact
            path="/checkoutvnp"
            element={<CheckoutVNPAYPage BE_URL={urlBE} />}
          ></Route>

          <Route
            exact
            path="/checkoutmomo"
            element={<CheckoutMoMoPage BE_URL={urlBE} />}
          ></Route>
          <Route
            exact
            path="/cart/:cartID"
            element={<CartPage productList={products} BE_URL={urlBE} />}
          ></Route>

          <Route
            exact
            path="/inventory"
            element={
              adminLogin ? (
                <Inventory
                  setInventory={setProducts}
                  userInfo={userInfo}
                  BE_URL={urlBE}
                  inventoryList={products}
                  setValueInventory={setProducts}
                />
              ) : (
                <LoginForm
                  urlApi={urlBE}
                  setAdminLogin={setAdminLogin}
                  setUserInfo={setUserInfo}
                ></LoginForm>
              )
            }
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
