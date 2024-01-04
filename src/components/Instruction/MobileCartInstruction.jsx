import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
const colors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
const images = [
  "https://mir-s3-cdn-cf.behance.net/projects/404/72737338691409.Y3JvcCw2NzcsNTMwLDIwNiwx.jpg",
  "https://firebasestorage.googleapis.com/v0/b/selfcheckout-c9beb.appspot.com/o/Introduction%2FtestPD.png?alt=media&token=cd1b4d7f-8588-4666-9f7f-1f6959126d3e&_gl=1*1dl7pqh*_ga*NjMxMjYzNjEuMTY5NzUyNTYwMA..*_ga_CW55HF8NVT*MTY5NzUyODc2Ni4yLjEuMTY5NzUyOTY5MC41Ni4wLjA.",
  "https://firebasestorage.googleapis.com/v0/b/selfcheckout-c9beb.appspot.com/o/Introduction%2FAddToCartUI.png?alt=media&token=dc45c881-f7e4-40dd-b395-89bf8f88357c&_gl=1*16mprve*_ga*NjMxMjYzNjEuMTY5NzUyNTYwMA..*_ga_CW55HF8NVT*MTY5NzUyODc2Ni4yLjEuMTY5NzUyOTUxMS41NS4wLjA.",
];

const instruction = [
  "Step 1: Place Item to RFID reader",
  "Step 2: See Product Information",
  "Step 3: Add Item to Cart",
];
const delay = 3000;
const MobileCartInstruction = ({}) => {
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
    <div className="slideshow">
      <div>
        <p style={{ fontWeight: "bold" }}>{instruction[index]}</p>
      </div>
      <div
        className="slideshowSlider"
        style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
      >
        {colors.map((backgroundColor, index) => (
          <div className="slide" key={index} style={{ backgroundColor }}>
            <img
              width={250}
              height={350}
              style={{
                marginLeft: "9%",
                marginRight: "auto",
                marginTop: "9%",
                borderRadius: "10px",
              }}
              src={images[index]}
            ></img>
          </div>
        ))}
      </div>

      <div className="slideshowDots">
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

export default MobileCartInstruction;
