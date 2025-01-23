import React, { useState, useEffect } from 'react'
import { move , moveDirection} from '../API/stardog'

const WIDTH = 50

export default function Cell (props) {
  const [type, setType] = useState('')
  const key = `cell${props.x}${props.y}`

  useEffect(() => {
    setType(props.types[key]);
  }, [props.types, type])

  const click = () => {
    if(type && type != "player") {
      // move(key).then(() => {
      //   props.update();
      // });
      const direction = `has${type.substring(0,1).toUpperCase()}${type.substring(1)}`;
      moveDirection(direction).then(() => {
        props.update();
      });
      console.log("Player moved to "+key);
      console.log("Type of cell : "+type);
    }
  }

  return (
    <div
      onClick={click}
      className={'cell ' + type}
      style={{ top: WIDTH * props.x + 'px', left: WIDTH * props.y + 'px' }}
    >
      <>{props.x + '' + props.y}</>
    </div>
  )
}
