import React, { useState, useEffect, useRef } from "react";
import "./styles2.css";
const colors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
const images = [
  "https://retailsolutions.ie/wp-content/uploads/2022/06/SCO-5-min.jpg",
  "https://firebasestorage.googleapis.com/v0/b/selfcheckout-c9beb.appspot.com/o/Introduction%2FcheckoutItem.png?alt=media&token=ee8c4dd4-9889-4a08-992e-cf6644bee94f&_gl=1*1o8d0e4*_ga*NjMxMjYzNjEuMTY5NzUyNTYwMA..*_ga_CW55HF8NVT*MTY5NzUzMzYyMC4zLjEuMTY5NzUzMzYzMS40OS4wLjA.",
  "https://firebasestorage.googleapis.com/v0/b/selfcheckout-c9beb.appspot.com/o/Introduction%2Fselectpaymentmethod.png?alt=media&token=f97631c7-5d04-40c7-af2a-395587d2ede1&_gl=1*m036c4*_ga*NjMxMjYzNjEuMTY5NzUyNTYwMA..*_ga_CW55HF8NVT*MTY5NzUzMzYyMC4zLjEuMTY5NzUzMzc4MS41NC4wLjA.",
  "https://firebasestorage.googleapis.com/v0/b/selfcheckout-c9beb.appspot.com/o/Introduction%2Finvoice.png?alt=media&token=17b7005d-7a25-4f7e-afe6-98af5c62f2fc&_gl=1*398chv*_ga*NjMxMjYzNjEuMTY5NzUyNTYwMA..*_ga_CW55HF8NVT*MTY5NzUzMzYyMC4zLjEuMTY5NzUzNDkyNi4zMC4wLjA.",
  ,
];

const instruction = [
  "Step 1: Place Item to Checkout RFID Reader Device",
  "Step 2: Scan all items in your cart",
  "Step 3: Click to checkout and select Payment method",
  "Step 4: After successful payment, Input your email to recieve Invoive",
];
const delay = 3000;
const CheckoutInstruction = ({}) => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setIndex((prevIndex) =>
          prevIndex === colors.length - 1 ? 0 : prevIndex + 1
        ),
      delay
    );

    return () => {
      resetTimeout();
    };
  }, [index]);

  return (
    <div className="slideshow1" style={{ width: "700px" }}>
      <div>
        <p style={{ fontWeight: "bold", fontSize: "20px" }}>
          {instruction[index]}
        </p>
      </div>
      <div
        className="slideshowSlider1"
        style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
      >
        {colors.map((backgroundColor, index) => (
          <div className="slide1" key={index} style={{ backgroundColor }}>
            <img
              width={600}
              height={400}
              style={{
                marginLeft: "7%",
                marginRight: "auto",
                borderRadius: "10px",
              }}
              src={images[index]}
            ></img>
          </div>
        ))}
      </div>

      <div className="slideshowDots1">
        {colors.map((_, idx) => (
          <div
            key={idx}
            className={`slideshowDot${index === idx ? " active" : ""}`}
            onClick={() => {
              setIndex(idx);
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutInstruction;
