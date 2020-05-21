import { ACTIVAR_DALTONISMO, DESTACAR_INDICE, ACTIVAR_ANIMACIONES, NORMALIZAR_POR_100000_HABITANTES, SELECCIONAR_SERIE } from '../actionTypes'
import { escala, colorApagado, escalaDaltonica, colorApagadoDaltonico, escalaAbsoluta } from '../../helpers/escala'
import { CASOS_COMUNALES, CASOS_REGIONALES } from './series'

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
    case SELECCIONAR_SERIE: {
      const id = action.payload
      return {
        ...state,
        escala: id === CASOS_COMUNALES || id === CASOS_REGIONALES ? (escalaAbsoluta) : (state.daltonicos ? escalaDaltonica : escala)
      }
    }
    default:
      return state
  }
}