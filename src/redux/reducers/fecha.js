import { CAMBIAR_FECHA, SELECCIONAR_CHILE } from '../actionTypes'
import { datosChile } from './region'

const initialState = {
  dia: -1
}

export default function(state = initialState, action) {
  switch (action.type) {
    case CAMBIAR_FECHA: {
      return {
        ...state,
        dia: action.payload
      }
    }
    case SELECCIONAR_CHILE: {
      return {
        ...state,
        dia: state.dia < 0 ? datosChile.datos.length - 1 : state.dia
      }
    }
    default:
      return state
  }
}