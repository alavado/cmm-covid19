import { combineReducers } from 'redux'
import series from './series'
import ayuda from './ayuda'
import colores from './colores'

export default combineReducers({
  series,
  ayuda,
  colores
})