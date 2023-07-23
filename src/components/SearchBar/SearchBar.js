import React, { useState,useRef } from "react";
import "./SearchBar.css";
import SearchIcon from '@mui/icons-material/Search';



function SearchBar({ onHandleSearchItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const typingTimeoutRef = useRef(null);
//   function handleSearchChange(e) {
//     setSearchTerm(e.target.value);
//     console.log(e.target.value);
//     const value = e.target.value;
//     if(typingTimeoutRef.current)
//     {
//       clearTimeout(typingTimeoutRef.current)
//     }

//     typingTimeoutRef.current = setTimeout(() =>{
//       const formValues = {
//         searchTerm: value,
//       };
//       onHandleSearchItem(formValues.searchTerm);
//     },300);

//   }
  return (
    <div style={{ border: '3px solid black',borderRadius:"30px",width:"450px",paddingLeft:"15px",height:"40px"}}>
    <div className="search" >
      <div className="searchInputs" >
        <input
          type="text"
          placeholder="search product"
          style={{height:"10px"}}
        />
        <div className="searchIcon" style={{height:"10px",marginTop:"2px",marginLeft:"35%"}} >
          <SearchIcon  />
        </div>
      </div>
    </div>
    </div>
  );
}

export default SearchBar;