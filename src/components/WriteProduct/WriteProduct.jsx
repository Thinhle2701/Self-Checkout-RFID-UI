import React,{useState} from 'react'
import "./WriteProduct.css";
import { Buffer } from 'buffer';
import axios from 'axios';
import soundScanned from "../../assets/Sound/Barcode-scanner-beep-sound.mp3"
var mqtt = require("mqtt");
const connectUrl = `wss://broker.emqx.io:8084/mqtt`
const audio = new Audio(soundScanned);
const client = mqtt.connect(connectUrl, {
    clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
    username: 'thinh',
    password: 'thinhbeo2801'
})


const WriteProduct = ({setOpenModal,product}) => {
  const[itemScaned,setItemScaned] = useState([])
  const[writed,setWrited] = useState(false)
  const itemlist = new Set([])
  client.on('connect', function () {
    client.subscribe('rfid/P001', function (err) {
      if (err) {
        console.log(err);
      }
    })
  })

  const checkInclude = (uuid,arr) =>{
    if (arr.includes(uuid)){
      return true
    }
    else{
      return false
    }
  }

  const addToList = async (uuid) =>{
    var newState = [...itemScaned, uuid];
    await setItemScaned(newState)
  }

  client.on('message', async function (topic, payload, packet) {
    let check = await checkInclude(payload.toString(),itemScaned)
    if (check == false){
      await addToList(payload.toString())
      audio.play();
    }

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
   
  return (
    <div>
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
          onClick={() => setOpenModal(false)}
        >
          X
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "-40px",
            fontSize: "20px",
          }}
        >
          <h2>Write RFID</h2>
        </div>
        <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "-40px",
            fontSize: "20px",
            height:"300px",
            marginTop:"20px"
          }}>
            <div style={{display:"block",marginTop:"10%"}}>
                <h2>{product.name}</h2>
                <p>Price: {product.price}</p>
            </div>

            <img src={product.image} />
        </div>
        {writed == false ? (        
            <div style={{display:"flex",marginLeft:"22%",marginTop:"5px"}}>
            <button className="addToCartBttn" onClick={handleStartWrite}>
            Write
            </button>
            <p style={{marginLeft:"20px"}}>Total Scaned : {itemScaned.size}</p>
        </div>) :(
            <div style={{display:"flex",marginLeft:"22%",marginTop:"5px"}}>
            <button className="addToCartBttn" onClick={handleStopWrite}>
            Pause
            </button>
            <p style={{marginLeft:"20px"}}>Total Scaned : {itemScaned.length}</p>
        </div>
        )
        }
    </div>
  )
}

export default WriteProduct