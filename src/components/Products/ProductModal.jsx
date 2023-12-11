import React, { useState } from "react";
import { TextField, IconButton, Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Input } from "@mui/material";
import { storage } from "../../Firebase";
import axios from "axios";
import Modal from "react-modal";
import greenTick from "../../assets/image/greenTick.png";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
  refFromURL,
} from "firebase/storage";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 } from "uuid";

const successStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "100px",
    width: "130px",
    backgroundColor: "white",
    borderColor: "green",
  },
};

const ProductModal = ({ setOpenModal,urlAPI }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkUploadImage, setCheckUploadImage] = useState(false);
  const [imageUpload, setImageUpload] = useState("");
  const [createStatus, setCreateStatus] = useState(false);
  console.log(productName);
  console.log(productPrice);
  const uploadImage = () => {
    const imageRef = ref(storage, `imageproduct/${imageUpload.name + v4()}`);
    uploadBytes(imageRef, imageUpload).then((response) => {
      getDownloadURL(response.ref).then((url) => {
        console.log(url);
        setImageUpload(url);
        setCheckUploadImage(true);
      });
    });
  };

  const handleDelete = () => {
    setCheckUploadImage(false);
    setImageUpload("");
  };

  const handleCancleCreateProduct = () => {
    setOpenModal(false);
  };

  const handleCreateProduct = () => {
    if (productName === "" || productPrice === 0 || imageUpload === "") {
      setErrorMessage("You need to fill fully information");
    } else {
      const productInfo = {
        name: productName,
        price: productPrice ,
        image: imageUpload,
      };
      console.log(productInfo);
      const url = urlAPI + "/api/product/add_product"
      axios
        .post(url, productInfo)
        .then(
          async (res) => {
            if (res.data.success === false) {
              setErrorMessage(res.data.message);
            } else {
              console.log(res.data.message);
              await delay(200);
              setCreateStatus(true);
              await delay(2000);
              setCreateStatus(false);
              setOpenModal(false);
              await window.location.reload();
            }
          },
          (error) => {
            console.log(error);
          }
        );
    }
  };
  return (
    <div>
      <div>
        <button
          style={{
            marginLeft: "auto",
            display: "flex",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            marginBottom: "-30px",
          }}
          onClick={() => {
            setOpenModal(false);
          }}
        >
          X
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "-40px",
            fontSize: "20px",
          }}
        >
          <h2>Product Detail</h2>
        </div>
      </div>

      <div style={{ display: "flex", marginTop: "10px" }}>
        <div>
          <p style={{ fontWeight: "bold" }}>Product Name</p>
          <TextField
            id="outlined-basic"
            label="Name"
            variant="outlined"
            onChange={(e) => {
              setErrorMessage("");
              setProductName(e.target.value);
            }}
          />
        </div>

        <div style={{ marginLeft: "20%" }}>
          <p style={{ fontWeight: "bold" }}>Price</p>
          <TextField
            id="outlined-basic"
            label="$ Price"
            variant="outlined"
            onChange={(e) => {
              setErrorMessage("");
              setProductPrice(e.target.value);
            }}
          />
        </div>
      </div>

      {checkUploadImage === true ? (
        <>
          <div style={{ marginLeft: "30%", marginTop: "50px" }}>
            <h3 style={{ marginLeft: "35px" }}>Product Image</h3>
            <div style={{ display: "flex" }}>
              <img width={200} height={200} src={imageUpload}></img>
              <IconButton
                style={{}}
                onClick={() => {
                  handleDelete();
                }}
              >
                <DeleteIcon style={{ color: "black" }} />
              </IconButton>
            </div>
          </div>
          {errorMessage != "" ? (
            <>
              <div>
                <h3 style={{ marginLeft: "23%", color: "red" }}>
                  {errorMessage}
                </h3>
              </div>
            </>
          ) : (
            <></>
          )}
          <div
            style={{ display: "block", marginTop: "10%", marginLeft: "20%" }}
          >
            <Button
              variant="outlined"
              onClick={handleCancleCreateProduct}
              style={{ border: "1px solid black", color: "black" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: "black",
                color: "white",
                marginLeft: "30%",
                width: "100px",
              }}
              onClick={handleCreateProduct}
            >
              Create
            </Button>

            <Modal
              isOpen={createStatus}
              style={successStyles}
              ariaHideApp={false}
            >
              <img
                style={{
                  height: "40px",
                  width: "50px",
                  display: "block",
                  textAlign: "center",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
                src={greenTick}
              ></img>
              <p
                style={{
                  textAlign: "center",
                  color: "green",
                  fontSize: "16px",
                }}
              >
                Create Success
              </p>
            </Modal>
          </div>
        </>
      ) : (
        <>
          <h3 style={{ marginLeft: "35%", marginTop: "10%" }}>Upload image</h3>
          <div style={{ marginLeft: "20%" }}>
            <Input
              type="file"
              name="myImage"
              onChange={(event) => {
                setImageUpload(event.target.files[0]);
              }}
            ></Input>
          </div>
          <div style={{ left: "40%", position: "absolute", marginTop: "30px" }}>
            <IconButton style={{}} onClick={uploadImage}>
              <FileUploadIcon style={{ fontSize: "100px", color: "black" }} />
            </IconButton>
          </div>
          <div
            style={{ display: "block", marginTop: "50%", marginLeft: "20%" }}
          >
            <Button
              variant="outlined"
              onClick={handleCancleCreateProduct}
              style={{ border: "1px solid black", color: "black" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: "black",
                color: "white",
                marginLeft: "30%",
                width: "100px",
              }}
              onClick={handleCreateProduct}
            >
              Create
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductModal;
