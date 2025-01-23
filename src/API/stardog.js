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
      ?oldCellPlayer :${direction} ?newCellPlayer
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
  select ?player ?north ?south ?east ?west
  where {
    ?player a :CellPlayer.
    ?player :hasEast ?east.
    ?player :hasWest ?west.
    ?player :hasNorth ?north.
    ?player :hasSouth ?south
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
  ids.forEach((id, index) => {
    if (id in result) result[id] += ' ' + keys[index]
    else result[id] = keys[index]
  })
  // console.log(result)
  return result
}