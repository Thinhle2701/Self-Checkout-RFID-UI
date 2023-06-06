import React from "react";
import { Product } from "./product";
import "./shop.css";
import SearchIcon from '@mui/icons-material/Search';
import SearchBar from "../../components/SearchBar/SearchBar";
export const Shop = ({products}) => {
  console.log(products)
  return (
    <div className="shop">
      <div className="shopTitle">
        <div style={{marginLeft:"30%"}} >
          <SearchBar />
        </div>
      </div>

      <div className="products">
        {products.map((product) => (
          <Product product={product} />
        ))}
      </div>
    </div>
  );
};
