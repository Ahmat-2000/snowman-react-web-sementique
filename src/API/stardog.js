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
  SELECT ?player ?north ?south ?east ?west ?littleSnowman ?mediumSnowman ?bigSnowman
  WHERE {
    ?player a :CellPlayer.
    OPTIONAL { ?player :hasNorth ?north . }
    OPTIONAL { ?player :hasSouth ?south . }
    OPTIONAL { ?player :hasEast ?east . }
    OPTIONAL { ?player :hasWest ?west . }
    OPTIONAL { ?littleSnowman :hasSnowman :littleSnowman . }
    OPTIONAL { ?mediumSnowman :hasSnowman :mediumSnowman . }
    OPTIONAL { ?bigSnowman :hasSnowman :bigSnowman . }
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
  console.log(extractedData)
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
    :cell45 a :CellPlayer .
    :cell22 :hasSnowman :littleSnowman .
    :cell88 :hasSnowman :mediumSnowman .
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

  // Vérifier la cellule actuelle du joueur et son voisin
  const checkQuery = `
    SELECT ?newCell ?snowman ?nextCell
    WHERE {
      ?player a :CellPlayer .
      ?player :${relation} ?newCell .
      OPTIONAL { ?newCell :hasSnowman ?snowman . }  
      OPTIONAL { 
        ?newCell :${relation} ?nextCell .
      }
    }
  `;

  const checkRes = await query.execute(conn, database, checkQuery, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!checkRes.ok) throw checkRes.statusText;

  const bindings = checkRes.body.results.bindings;
  if (bindings.length === 0) return null; 

  return extractData(bindings);
}

export async function handleMove(dir) {
  const extractedData = await checkMove(dir);
  if (!extractedData) {
    console.warn(`No available move in direction: ${dir}`);
    return;
  }

  const { newCell, snowman, nextCell } = extractedData;

  if (!newCell || newCell === "wall") {
    console.warn("Invalid move: No cell in this direction.");
    return;
  }

  let queryString = `
    DELETE { ?player a :CellPlayer }
    INSERT { :${newCell} a :CellPlayer }
    WHERE { ?player a :CellPlayer }
  `;

  if (snowman) {
    if (!nextCell || nextCell === "wall") {
      console.warn("Cannot push the snowman, no valid cell behind!");
      return;
    }

    queryString = `
      DELETE { ?player a :CellPlayer .
               :${newCell} :hasSnowman :${snowman} }
      INSERT { :${newCell} a :CellPlayer .
               :${nextCell} :hasSnowman :${snowman} }
      WHERE { ?player a :CellPlayer .
              :${newCell} :hasSnowman :${snowman} }
    `;
  }

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;

  console.log(`Player moved to ${newCell}${snowman ? ` and snowman moved to ${nextCell}` : ''}`);
}


