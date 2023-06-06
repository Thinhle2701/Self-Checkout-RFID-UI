import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import "./navbar.css";
import { height } from "@mui/system";

export const Navbar = () => {
  return (
    <div className="navbar">
      <div className="links">
        {/* <Link to="/"> Shop </Link> */}
        <AccountBoxIcon style={{height:"40px"}} />
      </div>
    </div>
  );
};
