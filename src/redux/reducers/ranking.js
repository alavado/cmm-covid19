import { EXPANDIR_RANKING } from '../actionTypes'

const initialState = {
  rankingExpandido: false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case EXPANDIR_RANKING: {
      return {
        ...state,
        rankingExpandido: action.payload
      }
    }
    default:
      return state
  }
}