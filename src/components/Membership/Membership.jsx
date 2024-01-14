import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
const Membership = ({ membershipData }) => {
  return (
    <div>
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        Membership
      </h1>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Card sx={{ maxWidth: 345 }}>
          <CardMedia
            component="img"
            alt="green iguana"
            height="360"
            image="https://cdn-icons-png.flaticon.com/512/6080/6080057.png"
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              Name: {membershipData.customerName}
            </Typography>
            <Typography gutterBottom variant="h7" component="div">
              Phone Number: {membershipData.phoneNumber}
            </Typography>
            <Typography gutterBottom variant="h7" component="div">
              Membership Point: {membershipData.point}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thank you for your contribution
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Share</Button>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      </div>
    </div>
  );
};

export default Membership;
