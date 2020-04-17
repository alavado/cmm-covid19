import { combineReducers } from 'redux'
import fecha from './fecha'
import region from './region'
import series from './series'

export default combineReducers({
  fecha,
  region,
  series
})