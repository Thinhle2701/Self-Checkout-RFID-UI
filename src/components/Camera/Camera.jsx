import React, { useState } from "react";
import QrReader from "react-qr-scanner";
const Camera = () => {
  const [scanQR, setScanQR] = useState({ deplay: 100, result: "no result" });
  const handleScan = (data) => {
    setScanQR({ result: data });
  };
  const handleError = (err) => {
    console.error(err);
  };
  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div>
      <QrReader
        delay={scanQR.delay}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      />
      <p>{scanQR.result}</p>
    </div>
  );
};

export default Camera;
