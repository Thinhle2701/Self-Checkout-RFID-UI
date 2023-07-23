import React, { useState, useEffect } from "react";
import "./App.css";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
} from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Shop } from "./pages/shop/shop";
import WriteRFID from "./components/WritePage/WriteRFID";
import ScanRFID from "./components/customer/ScanRFID";
import CheckoutPage from "./components/CheckoutPage/CheckoutPage";
import CartPage from "./components/Mobile/Cart";
import axios from "axios";
import { Buffer } from "buffer";
const url = "http://localhost:3000";
function App() {
  const [products, setProducts] = useState([]);
  const arr = [
    {
      id: "P001",
      image:
        "https://bizweb.dktcdn.net/100/360/184/products/nu-o-c-suo-i-1.jpg?v=1640425989953",
      name: "Aquafina",
      price: "1$",
    },
  ];
  window.Buffer = Buffer;
  useEffect(() => {
    fetchProduct();
  }, []);
  const fetchProduct = () => {
    axios
      .get(`http://localhost:8000/api/product`)
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
            element={<Shop products={products}></Shop>}
          ></Route>

          <Route exact path="/write/:productId" element={<WriteRFID />}></Route>

          <Route
            exact
            path="/customer"
            element={<ScanRFID productList={products} />}
          ></Route>

          <Route
            exact
            path="/checkout"
            element={<CheckoutPage URL={url} />}
          ></Route>
          <Route
            exact
            path="/cart/:cartID"
            element={<CartPage productList={products} />}
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
