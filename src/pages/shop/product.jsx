import React, { useContext,useState } from "react";
import Modal from 'react-modal';
import WriteProduct from "../../components/WriteProduct/WriteProduct";
import "./shop.css"
import {Routes, Route, useNavigate} from 'react-router-dom';

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
export const Product = ({product}) => {
  const navigate = useNavigate();
  const navigateProduct = () => {
    // 👇️ navigate to /contacts
    const link = '/write/' + product.id;
    navigate(link);
  };
  const [modalOpen,setModalOpen] = useState(false);
  console.log(product)
  return (
    <div className="product">
      <img src={product.image} width={250} height={250} />
      <div className="description">
        <p>
          <b>{product.name}</b>
        </p>
        <p>{product.price}</p>
    </div>
      {/* <button className="addToCartBttn" onClick={()=>{setModalOpen(true)}}>
        Start to Write
      </button> */}
      <button onClick={navigateProduct} className="addToCartBttn">start to write</button>
    </div>
  );
};
