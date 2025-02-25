import React, { useState, useEffect } from 'react'
import { moveDirection } from '../API/stardog'

const WIDTH = 50

export default function Cell (props) {
  const [type, setType] = useState('')
  const key = `cell${props.x}${props.y}`

  useEffect(() => {
    setType(props.types[key]);    
  }, [props.types])

  const click = () => {
    if(type && type !== "player") {
      moveDirection(type).then(props.update);
      console.log("Player moved to "+key);
      console.log("Type of cell : "+type);
    }
  }

  return (
    <div
      onClick={click}
      className={`cell ${type}`}
      style={{ 
        top: WIDTH * props.x + 'px', 
        left: WIDTH * props.y + 'px',   
        backgroundColor: "#282c34" 
      }}
    >
      {/* <>{props.x + '' + props.y}</> */}
    </div>
  )
}
