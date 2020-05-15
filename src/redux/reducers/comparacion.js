import { MOSTRAR_MINI_GRAFICOS } from '../actionTypes'

const initialState = {
  mostrandoMiniGraficos: false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case MOSTRAR_MINI_GRAFICOS: {
      return {
        ...state,
        mostrandoMiniGraficos: action.payload
      }
    }
    default:
      return state
  }
}