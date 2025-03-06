import React, { useState, useEffect, useCallback } from 'react';
import { getState, resetGame, handleMove } from '../API/stardog';
import Cell from './Cell';

const SIZE = 10;

export default function Grid() {
  const [types, setTypes] = useState({});

  // Fonction pour mettre à jour l'état du jeu
  const update = useCallback(() => {
    getState()
      .then(setTypes)
      .catch(console.error);
  }, []);

  // Fonction de réinitialisation du jeu
  const handleReset = async () => {
    await resetGame();
    update(); // Rafraîchir la grille après reset
  };

  // Gestion des touches clavier globalement
  const handleKeyPress = useCallback((event) => {
    const keyDirectionMap = {
      ArrowUp: "north",
      ArrowDown: "south",
      ArrowLeft: "west",
      ArrowRight: "east"
    };

    const direction = keyDirectionMap[event.key];

    if (direction) {
      handleMove(direction)
        .then(update)
        .catch(console.error);
    } else {
      console.warn("No valid direction found");
    }
  }, [update]);

  // Ajouter une seule fois l'écouteur de touches clavier
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]); // On l'ajoute uniquement quand `handleKeyPress` change

  // Charger l'état du jeu une seule fois au montage
  useEffect(() => {
    update();
  }, [update]);

  // Générer la grille de cellules
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
