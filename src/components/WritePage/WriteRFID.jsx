import { useEffect,useState } from "react";
import React from 'react'
import axios from "axios";
import {Routes, useLocation  } from "react-router-dom";
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3"
var mqtt = require("mqtt");
const connectUrl = `wss://broker.emqx.io:8084/mqtt`
const audio = new Audio(soundScanned);
const client = mqtt.connect(connectUrl, {
    clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
    username: 'thinh',
    password: 'thinhbeo2801'
})
const WriteRFID = () => {
    const [product,setProduct] = useState({})
    const[itemScaned,setItemScaned] = useState(()=>new Set())
    const[writed,setWrited] = useState(false)

    const addItem = item =>{
        setItemScaned(prev => new Set(prev).add(item))
    }
    client.on('connect', function () {
        client.subscribe('rfid/P001', function (err) {
          if (err) {
            console.log(err);
          }
        })
      })
    const location = useLocation();

    // Get current path
    const path = location.pathname;
    const myArray = path.split("/");
    const productID = myArray[2]
    const fetchProduct = (url) =>{
            
        axios.get(url)
          .then(res => {
            console.log(res.data)
            setProduct(res.data)
          })
          .catch(error => console.log(error));
    }
    useEffect(()=>{

        const url ="http://localhost:8000/api/product/" + productID
        fetchProduct(url);

    },[productID])
    
    client.on('message', async function (topic, payload, packet) {
        await addItem(payload.toString())
        audio.play(); 
    })
    const handleStartWrite = ()=>{
        const topic = "rfid/"+product.id;
        axios.post('http://localhost:8000/api/rfid/write', {
          productID: product.id,
        })
        .then((response) => {
          console.log(response);
          client.subscribe(topic)
        }, (error) => {
          console.log(error);
        });
        setWrited(true)
      }
    
      const handleStopWrite = ()=>{
        setWrited(false)
        const topic = "rfid/"+product.id;
        client.unsubscribe("rfid");
        axios.post('http://localhost:8000/api/rfid/stop_write', {
          productID: product.id,
        })
        .then((response) => {
          console.log(response);
        }, (error) => {
          console.log(error);
        });
      }

    console.log(itemScaned)
  return (
    <div>
        <h1 style={{marginLeft:"45%",fontSize:"40px"}}>Write RFID</h1>
        <div style={{display:"flex",marginTop:"5%",marginLeft:"25%"}}>
            <img width={600} height={400}  src={product.image} />
            <div style={{display:"block"}}>
                <h2 style={{fontSize:"50px"}}>{product.name}</h2>
                <p style={{fontSize:"30px"}}>Price: {product.price}</p>
                {writed == false ? (        
                  <div style={{display:"flex",marginTop:"5px"}}>
                    <button className="addToCartBttn" onClick={handleStartWrite}>
                     Write
                     </button>
                     <p style={{marginLeft:"20px"}}>Total Scaned : {itemScaned.size}</p>
                   </div>) :(
                    <div style={{display:"flex",marginTop:"5px"}}>
                    <button className="addToCartBttn" onClick={handleStopWrite}>
                    Pause
                    </button>
                    <p style={{marginLeft:"20px"}}>Total Scaned : {itemScaned.size}</p>
                </div>
                )}
            </div>
        </div>

    </div>
  )
}

export default WriteRFID