import React, { useState, useEffect } from 'react'
import { handleMove } from '../API/stardog'

const WIDTH = 50

export default function Cell (props) {
  const [type, setType] = useState('')
  const key = `cell${props.x}${props.y}`

  useEffect(() => {
    if (props.types && props.types[key]) {
      setType(props.types[key]);
    } else {
      setType('');
    }
  }, [props.types, key]);

  const click = () => {
    if (!type) return;
  
    // Séparer les différentes valeurs (ex: "north littleSnowman" -> ["north", "littleSnowman"])
    const types = type.split(" ");
    const validDirections = ["north", "south", "east", "west"];
    
    // Trouver la direction valide
    const direction = types.find(t => validDirections.includes(t));
  
    if (direction) {
      handleMove(direction)
        .then(props.update)
        .catch(console.error);
    } else {
      console.warn("No valid direction found for:", type);
    }
  };
  

  return (
    <div
      onClick={click}
      className={`cell ${type}`}
      style={{   
        backgroundColor: "#282c34" 
      }}
    >
      {/* <>{props.x + '' + props.y}</> */}
    </div>
  )
}
