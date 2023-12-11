import React, { useEffect, useState } from "react";
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

const EditProductModal = ({ setOpenModal, productData, urlAPI }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [productName, setProductName] = useState(productData.name);
  const [productPrice, setProductPrice] = useState(productData.price);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkUploadImage, setCheckUploadImage] = useState(true);
  const [imageUpload, setImageUpload] = useState(productData.image);
  const [updateStatus, setUpdateStatus] = useState(false);
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

  console.log(productData);

  const handleDelete = () => {
    setCheckUploadImage(false);
    setImageUpload("");
  };

  const handleCancleUpdateProduct = () => {
    setOpenModal(false);
  };

  const handleUpdateProduct = async () => {
    if (productName === "" || productPrice === 0 || imageUpload === "") {
      setErrorMessage("You need to fill fully information");
    } else {
      if (
        productName === productData.name &&
        productPrice === productData.price &&
        imageUpload === productData.image
      ) {
        console.log("No changes");
      } else {
        const url = urlAPI + "/api/product/update/" + productData.id;
        await axios
          .put(url, {
            name: productName,
            image: imageUpload,
            price: productPrice,
          })
          .then(async (res) => {
            console.log("api", res);
            await delay(200);
            setUpdateStatus(true);
            await delay(2000);
            setUpdateStatus(false);
            setOpenModal(false);
            await window.location.reload();
          })
          .catch(function (err) {
            console.log(err);
          });
      }
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
            value={productName}
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
            value={productPrice}
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
              onClick={handleCancleUpdateProduct}
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
              onClick={handleUpdateProduct}
            >
              Update
            </Button>

            <Modal
              isOpen={updateStatus}
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
                Update Success
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
              onClick={handleCancleUpdateProduct}
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
              onClick={handleUpdateProduct}
            >
              Update
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditProductModal;
