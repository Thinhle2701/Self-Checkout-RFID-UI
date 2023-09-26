import React, { useState } from "react";
import Modal from "react-modal";
import greenTick from "../../assets/image/greenTick.png";
import axios from "axios";
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

const LoginForm = ({ urlApi, setAdminLogin, setUserInfo }) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  const [errMsg, setErroMsg] = useState("");

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
            setUserInfo(res.data);
            window.localStorage.setItem("checkLogin", JSON.stringify(true));
            window.localStorage.setItem("user", JSON.stringify(res.data));
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
              <div></div>
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
      </div>
    </div>
  );
};

export default LoginForm;
