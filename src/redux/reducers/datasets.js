import { AGREGAR_DATASET, SELECCIONAR_DATASET } from '../actionTypes'

const initialState = {
  datasets: [],
  indice: -1
}

export default function(state = initialState, action) {
  switch (action.type) {
    case AGREGAR_DATASET: {
      return {
        ...state,
        indice: 0,
        datasets: [
          ...state.datasets,
          action.payload
        ]
      }
    }
    case SELECCIONAR_DATASET: {
      return {
        ...state,
        indice: action.payload
      }
    }
    default:
      return state
  }
}