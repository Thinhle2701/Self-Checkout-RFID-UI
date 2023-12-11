import React, { useState } from "react";
import Modal from "react-modal";
import greenTick from "../../assets/image/greenTick.png";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { useStepContext } from "@mui/material";
import emailjs from "@emailjs/browser";
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

const unsuccessStyles = {
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
    borderColor: "red",
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
    height: "300px",
    width: "510px",
    backgroundColor: "white",
    borderColor: "black",
    marginTop: "100px",
  },
};

const LoginForm = ({ urlApi, setAdminLogin, setUserInfo }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  const [errMsg, setErroMsg] = useState("");
  const [forgotpasswordModal, setForgotPasswordModal] = useState(false);
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = urlApi + "/api/user/login";
    console.log("username: ", username);
    console.log("password: ", password);
    axios
      .post(url, {
        username: username,
        password: password,
      })
      .then(async (res) => {
        {
          if (res.status === 200) {
            // console.log("Login success");
            await delay(200);
            setLoginStatus(true);
            await delay(2000);
            setLoginStatus(false);
            // setSuccess(true);
            setUserInfo(res.data.userData);
            window.localStorage.setItem("checkLogin", JSON.stringify(true));
            window.localStorage.setItem(
              "user",
              JSON.stringify(res.data.userData)
            );
            window.localStorage.setItem(
              "RFT",
              JSON.stringify(res.data.token.refreshToken)
            );
            setAdminLogin(true);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setErroMsg(err.response.data.message);
        setLoginStatus(false);
      });
  };

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  const handleClickCancleInput = () => {
    setEmail("");
    setErrorEmail(false);
    setForgotPasswordModal(false);
  };
  const handleClickSubmit = () => {
    if (!isValidEmail(email)) {
      setErrorEmail(true);
      setEmail(" ");
    } else {
      console.log(true);
      const url = urlApi + "/api/user/forgot_password";
      axios
        .post(url, {
          email: email,
        })
        .then(async (res) => {
          console.log(res);
          console.log(window.location.href);
          const changePasswordURL =
            window.location.href +
            "user/forgotpassword?userID=" +
            res.data.userData.userID +
            "&token=" +
            res.data.token;

          emailjs.init("WnU7YjuW7qxqmeZng");
          emailjs.send("service_1rdwrdi", "template_5p6qo3q", {
            from_name: "RFID Self-Checkout Store",
            user_name: res.data.userData.username,
            user_email: email,
            url: changePasswordURL,
          });
          setForgotPasswordModal(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div>
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
          Login
        </h2>
        <section>
          <p aria-live="assertive">
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="Username"
                style={{ color: "black", fontSize: "20px" }}
              >
                Username
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
                  id="username"
                  // ref={userRef}
                  autoComplete="off"
                  value={username}
                  placeholder="Fill your username"
                  required
                  onChange={(e) => {
                    setUsername(e.target.value);
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
                  {/* 

                  <Modal
                    isOpen={loginStatus}
                    style={unsuccessStyles}
                    ariaHideApp={false}
                  >
                    <img
                      style={{
                        height: "40px",
                        width: "40px",
                        display: "block",
                        textAlign: "center",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                      src="https://www.nicepng.com/png/detail/910-9107823_image-of-transparent-cross-x-mark-in-red.png"
                    ></img>
                    <p
                      style={{
                        textAlign: "center",
                        color: "red",
                        fontSize: "16px",
                      }}
                    >
                      Login Fail
                    </p>
                  </Modal> */}
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
                  onClick={() => setForgotPasswordModal(true)}
                >
                  Forgot Password
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

        {forgotpasswordModal === true ? (
          <>
            <Modal
              isOpen={forgotpasswordModal}
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
                    setForgotPasswordModal(false);
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
                  <h2>Forgot Password</h2>
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
                    helperText="You will receive email to change password"
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setErrorEmail(false);
                      }

                      setEmail(e.target.value);
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
                      handleClickSubmit();
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
