import React, { useEffect } from 'react';

export default function Snowflakes() {
  useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement("span");
      snowflake.classList.add("snowflake");
      document.body.appendChild(snowflake);

      // Définir la taille et la durée d'animation
      const size = Math.random() * 5 + 8;
      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;

      setTimeout(() => snowflake.remove(), 5000);
    };

    const interval = setInterval(createSnowflake, 200);
    return () => clearInterval(interval); 
  }, []);

  return <></>;
}
