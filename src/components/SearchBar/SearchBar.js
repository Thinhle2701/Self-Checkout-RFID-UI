import React, { useState, useRef } from "react";
import "./SearchBar.css";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ setSearch, productList, setProductSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const typingTimeoutRef = useRef(null);
  function handleSearchChange(e) {
    var ProductSearch = [];
    setSearch(true);
    setSearchTerm(e.target.value);
    const value = e.target.value;
    if (value === "") {
      setSearch(false);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      for (var i = 0; i < productList.length; i++) {
        if (productList[i].name.toLowerCase().includes(value.toLowerCase())) {
          ProductSearch.push(productList[i]);
        }
      }
      setProductSearch(ProductSearch);
    }
  }
  return (
    <div
      style={{
        border: "3px solid black",
        borderRadius: "30px",
        width: "450px",
        paddingLeft: "15px",
        height: "40px",
      }}
    >
      <div className="search">
        <div className="searchInputs">
          <input
            type="text"
            placeholder="search product"
            style={{ height: "10px" }}
            onChange={handleSearchChange}
          />
          <div
            className="searchIcon"
            style={{ height: "10px", marginTop: "2px", marginLeft: "35%" }}
          >
            <SearchIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
