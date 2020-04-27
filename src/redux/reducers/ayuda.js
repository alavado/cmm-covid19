import { MOSTRAR_AYUDA } from '../actionTypes'

const initialState = {
  mostrando: false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case MOSTRAR_AYUDA: {
      return {
        ...state,
        mostrando: action.payload
      }
    }
    default:
      return state
  }
}