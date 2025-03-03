// Grid.js
import React, { useState, useEffect } from 'react';
import { getState, resetGame, checkMove } from '../API/stardog';
import Cell from './Cell';

const SIZE = 10;

export default function Grid() {
  const [types, setTypes] = useState({});
  const [snowTypes, setSnowTypes] = useState({});
  const update = () => {
    getState()
    .then(setTypes) 
    .catch(console.error);
  };

  const handleReset = async () => {
    await resetGame();
    update(); // Mettre à jour la grille après reset
  };


  useEffect(() => {
    update();
    const directions = ["north", "south", "east", "west"];

    // Exécuter toutes les requêtes en parallèle
    Promise.all(directions.map(async (dir) => {
      const data = await checkMove(dir);
      return { direction: dir, result: data };
    }))
    .then(results => {
      console.table(results); // Affichage propre en tableau
    })
    .catch(error => console.error("Error fetching movement data:", error));
    
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
      />
    );
  });

  return (
    <div className='parent'>
      <div className=''>
        <button className='reset-btn' onClick={handleReset}>
          Restart the game
        </button>
      </div>
      <div className='container'>
        {cells}
      </div>
    </div>
  );
}

