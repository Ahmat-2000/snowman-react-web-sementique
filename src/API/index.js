import { getPlayer , getState} from './stardog.js'

getPlayer()
  .then(console.log)
  .catch(console.error);

getState().then(console.log)