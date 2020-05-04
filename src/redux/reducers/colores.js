import { ACTIVAR_DALTONISMO, DESTACAR_INDICE, ACTIVAR_ANIMACIONES } from '../actionTypes'
import { escala, colorApagado, escalaDaltonica, colorApagadoDaltonico } from '../../helpers/escala'

const initialState = {
  escala,
  colorApagado,
  daltonicos: false,
  animaciones: true,
  indiceDestacado: -1
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
    case DESTACAR_INDICE: {
      return {
        ...state,
        indiceDestacado: action.payload
      }
    }
    case ACTIVAR_ANIMACIONES: {
      return {
        ...state,
        animaciones: action.payload
      }
    }
    default:
      return state
  }
}