import { SELECCIONAR_REGION } from '../actionTypes'

const initialState = {
  region: {
    nombre: 'Chile',
    codigo: 0,
    datos: []
  }
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SELECCIONAR_REGION: {
      return {
        ...state,
        region: action.payload
      }
    }
    default:
      return state;
  }
}