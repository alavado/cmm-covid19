import { ACTIVAR_DALTONISMO } from '../actionTypes'
import { escala, colorApagado, escalaDaltonica, colorApagadoDaltonico } from '../../helpers/escala'

const initialState = {
  escala,
  colorApagado,
  daltonicos: false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ACTIVAR_DALTONISMO: {
      if (action.payload) {
        return {
          ...state,
          escala: escalaDaltonica,
          colorApagado: colorApagadoDaltonico,
          daltonicos: true
        }
      }
      else {
        return {
          ...state,
          escala,
          colorApagado,
          daltonicos: false
        }
      }
    }
    default:
      return state
  }
}