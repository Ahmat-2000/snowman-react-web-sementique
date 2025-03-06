import pkgStardog from 'stardog'
import { extractData, uriToId } from './utils.js'

import { username, password, endpoint } from './stardogConfig.js'

const { Connection, query } = pkgStardog
const directions = {
  "north": "hasNorth",
  "south": "hasSouth",
  "east": "hasEast",
  "west": "hasWest"
};

const conn = new Connection({
  username: username,
  password: password,
  endpoint: endpoint
})
const database = 'snowman';

export async function getPlayer() {
  const queryString = 'SELECT ?player WHERE { ?player a :CellPlayer }';

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    limit: 1,
    reasoning: true
  });

  if (!res.ok) throw res.statusText;

  const bindings = res.body.results.bindings;
  return bindings.length > 0 ? uriToId(bindings[0].player.value) : null;
}

export async function move(destination){
  const queryString = `
    DELETE { ?oldCellPlayer a :CellPlayer }
    INSERT { :${destination} a :CellPlayer }
    WHERE { ?oldCellPlayer a :CellPlayer } 
  `;

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;
  return res;
}

export async function getState() {
  const queryString = `
  SELECT ?player ?north ?south ?east ?west ?littleSnowman ?mediumSnowman ?bigSnowman ?littleAndMediumSnowman ?mediumAndBigSnowman ?littleAndBigSnowman ?finalSnowman
  WHERE {
    ?player a :CellPlayer.
    OPTIONAL { ?player :hasNorth ?north . }
    OPTIONAL { ?player :hasSouth ?south . }
    OPTIONAL { ?player :hasEast ?east . }
    OPTIONAL { ?player :hasWest ?west . }
    OPTIONAL { ?littleSnowman :hasSnowman :littleSnowman . }
    OPTIONAL { ?mediumSnowman :hasSnowman :mediumSnowman . }
    OPTIONAL { ?bigSnowman :hasSnowman :bigSnowman . }
    OPTIONAL { ?littleAndBigSnowman :hasSnowman :littleAndBigSnowman . }
    OPTIONAL { ?littleAndMediumSnowman :hasSnowman :littleAndMediumSnowman . }
    OPTIONAL { ?mediumAndBigSnowman :hasSnowman :mediumAndBigSnowman . }
    OPTIONAL { ?finalSnowman :hasSnowman :finalSnowman . }
  }
  `;

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;

  const bindings = res.body.results.bindings;
  if (bindings.length === 0) return {}; // Si aucun résultat, retourner un objet vide

  const extractedData = {};
  bindings.forEach(binding => {
    Object.entries(binding).forEach(([key, value]) => {
      const id = uriToId(value.value);
      if (extractedData[id]) {
        extractedData[id] += ` ${key}`;
      } else {
        extractedData[id] = key;
      }
    });
  });
  // console.log(extractedData)
  return extractedData;
}

export async function resetGame() {
  const queryString = `
  # Supprimer le joueur et les bonhommes de neige actuels
  DELETE WHERE { 
    ?player a :CellPlayer .
    ?cell :hasSnowman ?snowman .
  };

  # Réinsérer les éléments initiaux
  INSERT DATA {
    :cell54 a :CellPlayer .
    :cell25 :hasSnowman :littleSnowman .
    :cell68 :hasSnowman :mediumSnowman .
    :cell82 :hasSnowman :bigSnowman .
  }
  `;

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;
  console.log("Game has been reset!");
  return res;
}

export async function checkMove(dir) {
  if (!(dir in directions)) {
    throw new Error(`Invalid direction: ${dir}`);
  }

  const relation = directions[dir];

  const queryString = `
    SELECT ?newCell ?snowman ?nextCell ?nextSnowman
    WHERE {
      ?player a :CellPlayer .
      ?player :${relation} ?newCell .
      OPTIONAL { ?newCell :hasSnowman ?snowman . }
      OPTIONAL { 
        ?newCell :${relation} ?nextCell .
        OPTIONAL { ?nextCell :hasSnowman ?nextSnowman . }
      }
    }
  `;

  const checkRes = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!checkRes.ok) throw checkRes.statusText;

  const bindings = checkRes.body.results.bindings;

  return (bindings.length === 0) ? null : extractData(bindings);
}

export async function handleMove(dir) {
  const extractedData = await checkMove(dir);
  if (!extractedData) {
    console.warn(`No available move in direction: ${dir}`);
    return;
  }

  const { newCell, snowman, nextCell, nextSnowman } = extractedData;

  if (!newCell || newCell === "wall") {
    console.warn("Invalid move: No cell in this direction.");
    return;
  }

  let  queryString = `
    DELETE { ?player a :CellPlayer }
    INSERT { :${newCell} a :CellPlayer }
    WHERE { ?player a :CellPlayer }
  `;

  if (snowman) {
    if (!nextCell || nextCell === "wall") {
      console.warn("Cannot push the snowman, no valid cell behind!");
      return;
    }

    if (nextSnowman) {
      const assembled = await assembleSnowman(newCell, nextCell, snowman, nextSnowman);
      if (assembled) {
        console.log(`Snowman assembled at ${nextCell}`);
      }
    } else {
      // Pousser un snowman et déplacer le joueur
      queryString = `
        DELETE { 
          ?player a :CellPlayer .
          :${newCell} :hasSnowman :${snowman} 
        }
        INSERT { 
          :${newCell} a :CellPlayer .
          :${nextCell} :hasSnowman :${snowman} 
        }
        WHERE { 
          ?player a :CellPlayer .
          :${newCell} :hasSnowman :${snowman} 
        }
      `;
    }
  } 

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;

  console.log(`Player moved to ${newCell}${snowman ? ` and snowman moved to ${nextCell}` : ''}`);
}

export async function assembleSnowman(cellA, cellB, snowmanA, snowmanB) {
  // Règles de fusion
  const fusionRules = {
    "littleSnowman:mediumSnowman": "littleAndMediumSnowman",
    "mediumSnowman:bigSnowman": "mediumAndBigSnowman",
    "littleSnowman:bigSnowman": "littleAndBigSnowman",
    "littleAndMediumSnowman:bigSnowman": "finalSnowman",
    "mediumAndBigSnowman:littleSnowman": "finalSnowman",
    "littleAndBigSnowman:mediumSnowman": "finalSnowman"
  };

  // Vérifier dans les deux sens 
  const key1 = `${snowmanA}:${snowmanB}`;
  const key2 = `${snowmanB}:${snowmanA}`;

  let newSnowman = fusionRules[key1] || fusionRules[key2];

  if (!newSnowman) {
    console.warn(`Cannot assemble ${snowmanA} and ${snowmanB}`);
    return false;
  }

  // Requête SPARQL pour fusionner les deux Snowmen
  const queryString = `
    DELETE { 
      :${cellA} :hasSnowman :${snowmanA} .
      :${cellB} :hasSnowman :${snowmanB} 
    }
    INSERT { :${cellB} :hasSnowman :${newSnowman} }
    WHERE { 
      :${cellA} :hasSnowman :${snowmanA} .
      :${cellB} :hasSnowman :${snowmanB} 
    }
  `;

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;

  console.log(`Snowmen merged into ${newSnowman} at ${cellB}`);
  return true;
}
