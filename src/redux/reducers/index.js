import { combineReducers } from 'redux'
import series from './series'
import ayuda from './ayuda'
import colores from './colores'
import ranking from './ranking'
import comparacion from './comparacion'

export default combineReducers({
  series,
  ayuda,
  colores,
  ranking,
  comparacion
})