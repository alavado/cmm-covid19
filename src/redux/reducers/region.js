import { SELECCIONAR_REGION, SELECCIONAR_CHILE } from '../actionTypes'
import infectados_por_100000 from '../../data/regional/infectados_por_100000.json'

export const datosChile = {
  nombre: 'Chile',
  codigo: 0,
  datos: infectados_por_100000.find(r => r.codigo === 0).datos,
  fechaInicial: '2020-03-07'
}

const initialState = {
  region: {
    nombre: '',
    codigo: 0,
    datos: [],
    fechaInicial: '2020-03-07'
  }
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SELECCIONAR_REGION: {
      return {
        ...state,
        region: {
          ...state.region,
          ...action.payload
        }
      }
    }
    case SELECCIONAR_CHILE: {
      return {
        ...state,
        region: datosChile
      }
    }
    default:
      return state;
  }
}
