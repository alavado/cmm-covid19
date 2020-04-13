import { SELECCIONAR_REGION } from '../actionTypes'
import infectados_por_100000 from '../../data/regional/infectados_por_100000.json'

const datosChile = {
  nombre: 'Chile',
  codigo: 0,
  datos: infectados_por_100000.find(r => r.codigo).datos,
  fechaInicial: '2020-03-07'
}

const initialState = {
  region: datosChile
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
    default:
      return state;
  }
}