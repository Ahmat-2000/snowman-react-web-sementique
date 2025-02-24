import React, { useState, useEffect } from 'react'
import { getState } from '../API/stardog'

import Cell from './Cell'

const SIZE = 10

export default function Grid () {
const [types, setTypes] = useState({});
const update = () => {
  getState().then(setTypes)
}
  useEffect(() => {
    update();    
  }, [])

  const cells = Array(SIZE * SIZE)
    .fill()
    .map((element, index) => (
      <Cell key={index} types={types} x={Math.floor(index / 10)} y={index % 10} update={update}/>
    ))

  return (
    <div className='parent'>
      <div className='container'>
        {cells}
      </div>
    </div>
  )
}
