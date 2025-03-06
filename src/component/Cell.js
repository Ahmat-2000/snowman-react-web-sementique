import React, { useState, useEffect } from 'react';
import { handleMove } from '../API/stardog';

export default function Cell(props) {
  const [type, setType] = useState('');
  const key = `cell${props.x}${props.y}`;

  useEffect(() => {
    setType(props.types && props.types[key] ? props.types[key] : '');
  }, [props.types, key]);

  const click = () => {
    if (!type) return;

    const types = type.split(" ");
    const validDirections = ["north", "south", "east", "west"];
    
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
        backgroundColor: "gray" 
      }}
    >
      <>{props.x + '' + props.y}</>
    </div>
  );
}
