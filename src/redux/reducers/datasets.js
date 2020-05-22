import { AGREGAR_DATASET, SELECCIONAR_DATASET, FIJAR_POSICION_DATASETS } from '../actionTypes'

const initialState = {
  datasets: [],
  indice: -1,
  posicion: 20
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
    case FIJAR_POSICION_DATASETS: {
      return {
        ...state,
        posicion: action.payload
      }
    }
    default:
      return state
  }
}