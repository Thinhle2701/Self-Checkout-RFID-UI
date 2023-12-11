import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import axios from "axios";
const ForgotPassword = ({ BE_URL }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const userParam = queryParameters.get("userID");
    const tokenParam = queryParameters.get("token");
    setUserID(userParam);
    setToken(tokenParam);
  }, []);
  const handleClickSubmit = () => {
    if (password === confirmPassword) {
      const url = BE_URL + "/api/user/change_password";
      axios
        .post(
          url,
          {
            userID: userID,
            password: password,
          },
          {
            headers: {
              Authorization: "Bearer" + " " + token,
            },
          }
        )
        .then((res) => {
          setSuccess(true);
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
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          marginTop: "100px",
        }}
      >
        <h1>Reset Your Password</h1>
      </div>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "block",
        }}
      >
        {success === false ? (
          <>
            <div>
              <TextField
                id="outlined-password-input"
                label="New Password"
                type="password"
                autoComplete="current-password"
                style={{ width: "300px" }}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div style={{ marginTop: "50px" }}>
              <TextField
                id="outlined-password-input"
                label="Confirm Password"
                type="password"
                autoComplete="current-password"
                style={{ width: "300px" }}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </div>

            <div>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "black",
                  color: "white",
                  marginLeft: "30%",
                  width: "100px",
                  marginTop: "80px",
                }}
                onClick={() => {
                  handleClickSubmit();
                }}
              >
                Submit
              </Button>
            </div>
          </>
        ) : (
          <>
            <img src="https://media.tenor.com/IhzgisD8ORcAAAAM/tik.gif"></img>
            <p style={{ fontWeight: "bold" }}>Success to reset your password</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
