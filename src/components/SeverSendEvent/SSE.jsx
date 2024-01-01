import React, { useState, useEffect } from "react";

const SSE = ({ BE_URL }) => {
  const [donation, setDonation] = useState({});
  useEffect(() => {
    const url = BE_URL + "/api/sse/I0j2KWm";
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
  return <div></div>;
};

export default SSE;
