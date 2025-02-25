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

async function executQueryWithReponse (queryString){
  return query
    .execute(conn, database, queryString, 'application/sparql-results+json', {
      limit: 10,
      reasoning: true,
      offset: 0
    })
    .then(res => {
      if (!res.ok) throw res.statusText
      return res.body.results.bindings
    })
    .then(res => uriToId(res[0].player.value));
}

//---------------------------------------------------------------
export async function getPlayer() {
  const queryString = 'select ?player where { ?player a :CellPlayer }'
  return executQueryWithReponse(queryString);
}

//---------------------------------------------------------------
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

//todo => done
export async function moveDirection(direction){

  const queryString = `
   DELETE {
      ?oldCellPlayer a :CellPlayer
    }
    INSERT {
      ?newCellPlayer a :CellPlayer
    }
    WHERE {
      ?oldCellPlayer a :CellPlayer .
      ?oldCellPlayer :has${direction.substring(0,1).toUpperCase()}${direction.substring(1)} ?newCellPlayer
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
// export async function moveDirection(direction) {
//   const directionMapping = {
//     north: 'hasNorth',
//     south: 'hasSouth',
//     east: 'hasEast',
//     west: 'hasWest'
//   };
//   const dirProp = directionMapping[direction.toLowerCase()];
  
//   // Construction de la requête SPARQL :
//   // On déplace le joueur en supprimant la triple indiquant sa présence dans la cellule source et en l'insérant dans la cellule destination.
//   // La cellule destination doit être soit CellFree, soit MovableToNorth, et doit posséder (via hasSouth) au moins un CellPlayer.
//   const queryString = `
//     DELETE {
//       ?oldCellPlayer a :CellPlayer .
//     }
//     INSERT {
//       ?newCellPlayer a :CellPlayer .
//     }
//     WHERE {
//       ?oldCellPlayer a :CellPlayer .
//       ?oldCellPlayer :${dirProp} ?newCellPlayer .
//       {
//         ?newCellPlayer a :CellFree 
//       } UNION {
//         ?newCellPlayer a :MovableToNorth
//       }
//       ?newCellPlayer :hasSouth ?somePlayer .
//     }
//   `;
  
//   const res = await query.execute(
//     conn,
//     database,
//     queryString,
//     'application/sparql-results+json',
//     {
//       limit: 10,
//       reasoning: true,
//       offset: 0
//     }
//   );
//   if (!res.ok) throw res.statusText;
//   return res;
// }

export async function getState(){
  const queryString = `
  select ?player ?north ?south ?east ?west ?littleSnowman ?mediumSnowman ?bigSnowman
  where {
    ?player a :CellPlayer.
    ?player :hasEast ?east.
    ?player :hasWest ?west.
    ?player :hasNorth ?north.
    ?player :hasSouth ?south.
    ?littleSnowman :hasSnowman :littleSnowman.
    ?mediumSnowman :hasSnowman :mediumSnowman.
    ?bigSnowman :hasSnowman :bigSnowman.
    ?bigSnowman :hasSnowman :bigSnowman.
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
  console.log(ids);
  console.log(keys);
  console.log(data)
  ids.forEach((id, index) => {
    if (id in result) result[id] += ' ' + keys[index]
    else result[id] = keys[index]
  })
  console.log(result);
  
  return result
}