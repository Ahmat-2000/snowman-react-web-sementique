// Grid.js
import React, { useState, useEffect } from 'react';
import { getState } from '../API/stardog'
import Cell from './Cell';

const SIZE = 10;

export default function Grid() {
  const [types, setTypes] = useState({});
  const [movement, setMovement] = useState("");

  const update = () => {
    getState().then(setTypes);
  };

  useEffect(() => {
    update();
  }, []);

  const cells = Array.from({ length: SIZE * SIZE }, (_, index) => {
    const x = Math.floor(index / SIZE);
    const y = index % SIZE;
    return (
      <Cell
        key={index}
        types={types}
        x={x}
        y={y}
        update={update}
        movement={movement}
      />
    );
  });

  return (
    <div className='parent'>
      <div className='container'>
        {cells}
      </div>
    </div>
  );
}

