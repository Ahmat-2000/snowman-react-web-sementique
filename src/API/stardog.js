import pkgStardog from 'stardog'
import { uriToId } from './utils.js'

import { username, password, endpoint } from './stardogConfig.js'

const { Connection, query } = pkgStardog

const conn = new Connection({
  username: username,
  password: password,
  endpoint: endpoint
})
const database = 'snowman';

export async function getPlayer() {
  const queryString = 'SELECT ?player WHERE { ?player a :CellPlayer }';
  
  return query
    .execute(conn, database, queryString, 'application/sparql-results+json', {
      limit: 1,
      reasoning: true
    })
    .then(res => {
      if (!res.ok) throw res.statusText;
      const bindings = res.body.results.bindings;
      return bindings.length > 0 ? uriToId(bindings[0].player.value) : null;
    });
}

export async function move(destination){
  const queryString = `
  DELETE { 
    ?oldCellPlayer a :CellPlayer
  }
  INSERT {
    :${destination} a :CellPlayer
  }
  WHERE {
    ?oldCellPlayer a :CellPlayer 
  }  
  `;
  const res = await query
    .execute(conn, database, queryString, 'application/sparql-results+json', {
      limit: 10,
      reasoning: true,
      offset: 0
    })
  if (!res.ok) throw res.statusText
  return res;
}

export async function moveDirection(dir){
  const directions = {
    "north" : "hasNorth",
    "south" : "hasSouth",
    "east" : "hasEast",
    "west" : "hasWest",
  }
  if (!(dir in directions)) {
    throw new Error(`Invalid direction: ${dir}`);
  }
  const queryString = `
   DELETE {
      ?oldCellPlayer a :CellPlayer
    }
    INSERT {
      ?newCellPlayer a :CellPlayer
    }
    WHERE {
      ?oldCellPlayer a :CellPlayer .
      ?oldCellPlayer :${directions[dir]} ?newCellPlayer
    }`
  ;
  const res = await query
    .execute(conn, database, queryString, 'application/sparql-results+json', {
      limit: 10,
      reasoning: true,
      offset: 0
    })
  if (!res.ok) throw res.statusText
  return res;
}

export async function getState(){
  const queryString = `
  select ?player ?north ?south ?east ?west ?littleSnowman ?mediumSnowman ?bigSnowman
  where {
    ?player a :CellPlayer.
    OPTIONAL { ?player :hasNorth ?north . }
    OPTIONAL { ?player :hasSouth ?south . }
    OPTIONAL { ?player :hasEast ?east . }
    OPTIONAL { ?player :hasWest ?west . }
    OPTIONAL { ?littleSnowman :hasSnowman :littleSnowman. }
    OPTIONAL { ?mediumSnowman :hasSnowman :mediumSnowman. }
    OPTIONAL { ?bigSnowman :hasSnowman :bigSnowman. }
  }
  `;
  const res = await query
    .execute(conn, database, queryString, 'application/sparql-results+json', {
      reasoning: true
    })
  const data = res.body.results.bindings[0]
  const result = {}
  const keys = Object.keys(data)
  const ids = Object.values(data).map(d => uriToId(d.value)
  )
  // console.log(ids);
  // console.log(keys);
  // console.log(data)
  ids.forEach((id, index) => {
    if (id in result) result[id] += ' ' + keys[index]
    else result[id] = keys[index]
  })
  // console.log("Game State:", result);
  return result
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
    :cell55 a :CellPlayer .
    :cell22 :hasSnowman :littleSnowman .
    :cell88 :hasSnowman :mediumSnowman .
    :cell82 :hasSnowman :bigSnowman .
  }
  `;

  const res = await query.execute(conn, database, queryString, 'application/sparql-results+json', {
    reasoning: true
  });

  if (!res.ok) throw res.statusText;
  // console.log("Game has been reset!");
}
