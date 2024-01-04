import React, { useState, useEffect } from "react";

const SSE = ({ BE_URL }) => {
  const [donation, setDonation] = useState({ user: 0, amount: 0 });
  useEffect(() => {
    const url = BE_URL + "/api/mobilesse/dashboard";
    const source = new EventSource(url);

    source.addEventListener("open", () => {
      console.log("SSE opened!");
    });

    source.addEventListener("message", (e) => {
      //console.log(e.data);
      const data = JSON.parse(e.data);
      setDonation(data);
    });

    source.addEventListener("error", (e) => {
      console.error("Error: ", e);
    });

    return () => {
      source.close();
    };
  }, []);
  console.log(donation);
  return (
    <div>
      <h1>Donation status</h1>
      <hr />
      <h3>Total amount: {donation.amount}</h3>
      <h3>Total user: {donation.user}</h3>
    </div>
  );
};

export default SSE;
