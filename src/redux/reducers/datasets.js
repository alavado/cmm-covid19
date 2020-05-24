import { AGREGAR_DATASET, SELECCIONAR_DATASET, FIJAR_POSICION_DATASETS } from '../actionTypes'

const initialState = {
  datasets: [],
  indice: -1,
  posicion: 0
}

export default function(state = initialState, action) {
  switch (action.type) {
    case AGREGAR_DATASET: {
      return {
        ...state,
        indice: 3,
        datasets: [
          ...state.datasets,
          action.payload
        ]
      }
    }
    case SELECCIONAR_DATASET: {
      const indice = action.payload
      let posicion = Math.max(0, Math.min(state.posicion, state.datasets[indice].chile.length - 1))
      if (state.posicion === state.datasets[state.indice].chile.length - 1) {
        posicion = state.datasets[indice].chile.length - 1
      }
      return {
        ...state,
        indice,
        posicion
      }
    }
    case FIJAR_POSICION_DATASETS: {
      return {
        ...state,
        posicion: Math.max(0, Math.min(action.payload, state.datasets[state.indice].chile.length - 1))
      }
    }
    default:
      return state
  }
}