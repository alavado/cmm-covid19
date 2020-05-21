import { AGREGAR_DATASET } from '../actionTypes'

const initialState = {
  datasets: []
}

export default function(state = initialState, action) {
  switch (action.type) {
    case AGREGAR_DATASET: {
      return {
        ...state,
        datasets: [
          ...state.datasets,
          action.payload
        ]
      }
    }
    default:
      return state
  }
}