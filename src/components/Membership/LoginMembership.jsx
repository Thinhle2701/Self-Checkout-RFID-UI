import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import greenTick from "../../assets/image/greenTick.png";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import Membership from "./Membership";
const successStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "100px",
    width: "100px",
    backgroundColor: "white",
    borderColor: "green",
  },
};

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
const LoginMembership = ({ urlApi }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [membershipLogin, setMembershipLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  const [errMsg, setErroMsg] = useState("");
  const [registerModal, setRegisterModal] = useState(false);
  const [errorPhone, setErrorPhone] = useState(false);
  const [membershipData, setMembershipData] = useState({});
  const [phoneNumberRegister, setPhoneNumberRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [emailRegister, setEmailRegister] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);

  useEffect(() => {
    const check = window.localStorage.getItem("memberLogin");
    const member = window.localStorage.getItem("membership");

    if (JSON.parse(check) !== null) {
      if (JSON.parse(check) === false) {
        setMembershipLogin(JSON.parse(check));
        setMembershipData(JSON.parse(member));
      } else {
        setMembershipLogin(JSON.parse(check));
        setMembershipData(JSON.parse(member));
      }
    } else {
      const empty = {};
      window.localStorage.setItem("memberLogin", JSON.stringify(false));
      window.localStorage.setItem("membership", JSON.stringify(empty));
      setMembershipLogin(false);
    }
  }, []);

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = urlApi + "/api/membership/login";
    console.log("phone: ", phoneNumber);
    console.log("password: ", password);
    axios
      .post(url, {
        phoneNumber: phoneNumber,
        password: password,
      })
      .then(async (res) => {
        {
          if (res.status === 200) {
            console.log("Login success");
            await delay(200);
            setLoginStatus(true);
            await delay(2000);
            setMembershipLogin(true);
            setMembershipData(res.data);
            window.localStorage.setItem("memberLogin", JSON.stringify(true));
            window.localStorage.setItem("membership", JSON.stringify(res.data));
            // setLoginStatus(false);
            // setMembershipLogin(true)
            console.log(res);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setErroMsg(err.response.data.message);
        setLoginStatus(false);
      });
  };

  const handleClickCancleInput = () => {
    setPasswordRegister("");
    setCustomerName("");
    setPhoneNumberRegister("");
    setErrorPhone(false);
    setRegisterModal(false);
  };
  const handleClickRegister = () => {
    const url = urlApi + "/api/membership/add_member";
    console.log("cust name: ", customerName);
    console.log("phone: ", phoneNumberRegister);
    console.log("password: ", passwordRegister);
    if (!isValidEmail(emailRegister)) {
      setErrorEmail(true);
      setEmailRegister("");
    } else {
      axios
        .post(url, {
          customerName: customerName,
          phoneNumber: phoneNumberRegister,
          password: passwordRegister,
          email: emailRegister,
        })
        .then(async (res) => {
          {
            if (res.status === 200) {
              console.log(res);
              window.localStorage.setItem("memberLogin", JSON.stringify(true));
              window.localStorage.setItem(
                "membership",
                JSON.stringify(res.data)
              );
              setPhoneNumber(phoneNumberRegister);
              setPasswordRegister("");
              setCustomerName("");
              setPhoneNumberRegister("");
              setRegisterModal(false);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <div>
      {membershipLogin === false ? (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "block",
              border: "1px solid #9E9E9E",
              padding: "50px 50px",
              borderRadius: "4px",
              // boxShadow: "1px 3px 1px #9E9E9E",
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              Membership Login
            </h2>
            <section>
              <p aria-live="assertive">
                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="Phone number"
                    style={{ color: "black", fontSize: "20px" }}
                  >
                    Phone Number
                  </label>
                  <div style={{ display: "flex" }}>
                    <input
                      style={{
                        display: "block",
                        width: "400px",
                        padding: "20px 20px",
                        marginLeft: "1px",
                        border: "1px solid",
                        borderColor: "#9E9E9E",
                        borderRadius: "4px",
                        margin: "8px 0",
                        boxSizing: "border-box",
                        marginBottom: "20px",
                        fontSize: "17px",
                      }}
                      type="text"
                      id="phoneNumber"
                      // ref={userRef}
                      autoComplete="off"
                      value={phoneNumber}
                      placeholder="Fill your phone number"
                      required
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                      }}
                    ></input>
                  </div>

                  <label
                    htmlFor="Password"
                    style={{ color: "black", fontSize: "20px" }}
                  >
                    Password
                  </label>
                  <div style={{ display: "flex" }}>
                    <input
                      style={{
                        display: "block",
                        width: "400px",
                        padding: "20px 20px",
                        marginLeft: "1px",
                        border: "1px solid",
                        borderColor: "#9E9E9E",
                        borderRadius: "4px",
                        margin: "8px 0",
                        boxSizing: "border-box",
                        fontSize: "17px",
                      }}
                      type="password"
                      id="password"
                      // ref={userRef}
                      autoComplete="off"
                      value={password}
                      required
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      placeholder="Enter your password"
                    ></input>
                  </div>
                  {errMsg != "" ? (
                    <div>
                      <p style={{ color: "red" }}>❌{errMsg}</p>
                    </div>
                  ) : (
                    <Modal
                      isOpen={loginStatus}
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
                        Login Success
                      </p>
                    </Modal>
                  )}
                  <div>
                    <Button
                      variant="text"
                      onClick={() => setRegisterModal(true)}
                    >
                      Register Member
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "50px",
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#2e7ee6" /* Green */,
                        color: "white",
                        fontSize: "20px",
                        width: "400px",
                        padding: "12px",
                        borderRadius: "5px",
                        border: "1px solid #2e7ee6",
                      }}
                      //  onClick={handleClickLogin}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </p>
            </section>
            {registerModal === true ? (
              <>
                <>
                  <Modal
                    isOpen={registerModal}
                    style={customStyles}
                    ariaHideApp={false}
                  >
                    <div>
                      {" "}
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
                          setRegisterModal(false);
                        }}
                      >
                        X
                      </button>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "20px",
                        }}
                      >
                        <h2>Register Membership</h2>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "11%",
                        }}
                      >
                        <TextField
                          id="outlined-helperText"
                          label="Input Your Name"
                          placeholder="Name"
                          helperText="Your Name "
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "11%",
                        }}
                      >
                        <TextField
                          id="outlined-helperText"
                          label="Input Your Phone Number"
                          placeholder="Phone Number"
                          helperText="Your Phone Number"
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setErrorPhone(false);
                            }

                            setPhoneNumberRegister(e.target.value);
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "11%",
                        }}
                      >
                        <TextField
                          id="outlined-helperText"
                          label="Input Your Email"
                          placeholder="Email"
                          helperText="Your email"
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setErrorEmail(false);
                            }

                            setEmailRegister(e.target.value);
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "11%",
                        }}
                      >
                        <TextField
                          id="outlined-helperText"
                          label="Input Your Password"
                          placeholder="Password"
                          helperText="Your Password"
                          onChange={(e) => {
                            setPasswordRegister(e.target.value);
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "40px",
                        }}
                      >
                        {errorEmail === true ? (
                          <>
                            <p style={{ color: "red", fontWeight: "bold" }}>
                              ❌ Invalid Email
                            </p>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      {registerSuccess === true ? (
                        <>
                          {" "}
                          <div>
                            <p
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "-40px",
                                fontSize: "17px",
                                marginTop: "11%",
                                color: "green",
                                fontWeight: "bold",
                              }}
                            >
                              ✅ Login success
                            </p>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "40px",
                        }}
                      >
                        {errorPhone === true ? (
                          <>
                            <p style={{ color: "red", fontWeight: "bold" }}>
                              ❌ Invalid Phone
                            </p>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "-40px",
                          fontSize: "17px",
                          marginTop: "14%",
                        }}
                      >
                        <Button
                          variant="outlined"
                          style={{ border: "1px solid black", color: "black" }}
                          onClick={() => {
                            handleClickCancleInput();
                          }}
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
                          onClick={() => {
                            handleClickRegister();
                          }}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </Modal>
                </>
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        <>
          <Membership membershipData={membershipData}></Membership>
        </>
      )}
    </div>
  );
};

export default LoginMembership;
